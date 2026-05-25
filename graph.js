// ==========================================
// 1. グラフ描画・同期更新処理（Blockly から Desmos API への橋渡し）
// ==========================================
// 引数として渡されたBlocklyワークスペースの変更を監視し、リアルタイムにDesmosへと数式を送り込む関数
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

        const SAFE_FUNCS = /\\(sin|cos|tan|log|ln|sqrt|frac)\s*\(/;

        let prev;
        let loop = 0;
        const MAX = 50;

        do {
          prev = formula;

          // --- (1) 関数でない単純カッコを削除 ---
          formula = formula.replace(
            /\(([^()]+)\)/g,
            (m, inner) => {
              // 関数の引数は残す
              if (SAFE_FUNCS.test(m)) return m;

              // 中身が式ならカッコ不要 → 削除
              return inner;
            }
          );

          // --- (2) 全体囲みカッコを除去 ---
          if (
            formula.startsWith("(") &&
            formula.endsWith(")") &&
            isBalanced(formula.slice(1, -1))
          ) {
            formula = formula.slice(1, -1).trim();
          }

          loop++;
        } while (formula !== prev && loop < MAX);

        // --- 定義域まわりの丸カッコ徹底掃除ロジック ---

        // ① `{ ... }` の内部の丸カッコ完全削除
        formula = formula.replace(/\{[^}]*\}/g, (m) =>
          m.replace(/[()]/g, "")
        );

        // ② `{` の直前カッコ除去
        formula = formula.replace(/\(([^()]+)\)\s*\{/g, "$1{");

        // ③ 全体が `( ... { ... })` の場合の前カッコ除去
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
  // 補助関数：カッコの整合性チェック
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
