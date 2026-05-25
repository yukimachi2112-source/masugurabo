// ==========================================
// 1. グラフ描画・同期更新処理（Blockly から Desmos API への橋渡し）
// ==========================================
window.initGraphUpdater = function (targetWorkspace) {
  if (!targetWorkspace) return;

  targetWorkspace.addChangeListener((event) => {
    // 【UIイベントの排除】
    if (event.isUiEvent) return;

    // 【パフォーマンス対策】
    if (event.type === Blockly.Events.BLOCK_MOVE && event.isDragging) return;

    const topBlocks = targetWorkspace.getTopBlocks();
    const currentTopBlockIds = new Set();

    topBlocks.forEach((block) => {
      const desmosId = `blockly_graph_${block.id}`;
      currentTopBlockIds.add(desmosId);

      let formula = "";
      try {
        const res = window.latexGenerator.blockToCode(block);
        formula = Array.isArray(res) ? res[0] : res;
      } catch (e) {
        console.error("LaTeX生成エラー:", e);
        return;
      }

      // ==========================================
      // 2. カッコの自動クレンジング・整形処理
      // ==========================================
      if (formula) {
        formula = formula.trim();

        let prev;
        let loop = 0;
        const MAX = 50;

        do {
          prev = formula;

          // --- (1) \left( ... \right) は絶対に保護 ---
          // 一旦一時退避
          const stored = [];
          formula = formula.replace(
            /\\left\((.*?)\\right\)/g,
            (_, inner) => {
              const key = `__LEFT_RIGHT_${stored.length}__`;
              stored.push(inner);
              return key;
            }
          );

          // --- (2) 通常の不要カッコを削除 ---
          formula = formula.replace(/\(([^()]+)\)/g, "$1");

          // --- (3) 全体囲みカッコ削除（安全） ---
          if (
            formula.startsWith("(") &&
            formula.endsWith(")") &&
            isBalanced(formula.slice(1, -1))
          ) {
            formula = formula.slice(1, -1).trim();
          }

          // --- (4) 退避した \left ... \right を復元 ---
          stored.forEach((inner, i) => {
            formula = formula.replace(
              `__LEFT_RIGHT_${i}__`,
              `\\left(${inner}\\right)`
            );
          });

          loop++;
        } while (formula !== prev && loop < MAX);

        // --- 定義域まわりの丸カッコ徹底掃除ロジック ---

        // ① `{}` 内の () 削除（ただし left/right は守る）
        formula = formula.replace(/\{[^}]*\}/g, (m) => {
          return m.replace(
            /\(([^()]*)\)/g,
            (_, inner) => inner
          );
        });

        // ② `{` の直前カッコ削除
        formula = formula.replace(/\(([^()]+)\)\s*\{/g, "$1{");

        // ③ 先頭の余計な "(" 削除
        if (formula.startsWith("(") && formula.includes("{")) {
          formula = formula.replace(/^\(/, "");
        }
      }

      // ==========================================
      // 3. Desmos への送信・上書き登録
      // ==========================================
      if (formula && formula.trim() !== "") {
        const isRelation =
          /=|\\lt|\\gt|\\le|\\ge|\{/.test(formula) ||
          block.type === "Relation" ||
          block.type === "Relation_Range";

        if (!isRelation) {
          formula = `y = ${formula}`;
        }

        console.log("Desmosに送信される最終LaTeX:", formula);

        calculator.setExpression({
          id: desmosId,
          latex: formula,
        });
      }
    });

    // ==========================================
    // 4. ゴミ箱（削除）対応の差分クリーンアップ処理
    // ==========================================
    calculator.getExpressions().forEach((expr) => {
      if (
        expr.id.startsWith("blockly_graph_") &&
        !currentTopBlockIds.has(expr.id)
      ) {
        calculator.removeExpression(expr);
      }
    });
  });

  // ==========================================
  // 補助関数：カッコ整合性チェック
  // ==========================================
  function isBalanced(str) {
    let depth = 0;
    for (let c of str) {
      if (c === "(") depth++;
      if (c === ")") depth--;
      if (depth < 0) return false;
    }
    return depth === 0;
  }
};
