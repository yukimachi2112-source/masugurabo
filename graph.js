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
      // 2. カッコの自動クレンジング・整形処理（完全安全版）
      // ==========================================
      if (formula) {
        formula = formula.trim();

        let prev;
        let loop = 0;
        const MAX = 50;

        do {
          prev = formula;

          // ======================================
          // (A) 重要構造を完全保護
          // ======================================
          const protectedBlocks = [];

          formula = formula.replace(
            /(\\left\([^]*?\\right\))|(\\frac\{[^}]*\}\{[^}]*\})|(\\operatorname\{[^}]*\})|(\\sqrt\{[^}]*\})/g,
            (match) => {
              const key = `__PROTECTED_${protectedBlocks.length}__`;
              protectedBlocks.push(match);
              return key;
            }
          );

          // ======================================
          // (B) 安全な括弧削除
          // ======================================

          // (x) → x
          formula = formula.replace(/\((x)\)/g, "$1");

          // (10) → 10
          formula = formula.replace(/\((\d+(\.\d+)?)\)/g, "$1");

          // (a+b) → a+b （単純式のみ）
          formula = formula.replace(/\(([^()]+)\)/g, "$1");

          // ======================================
          // (C) 外側丸ごとカッコ除去
          // ======================================
          if (
            formula.startsWith("(") &&
            formula.endsWith(")") &&
            isBalanced(formula.slice(1, -1))
          ) {
            formula = formula.slice(1, -1).trim();
          }

          // ======================================
          // (D) 定義域対策（Desmos厳格仕様）
          // ======================================

          // { } 内の () 削除
          formula = formula.replace(/\{[^}]*\}/g, (m) =>
            m.replace(/[()]/g, "")
          );

          // (式){条件} → 式{条件}
          formula = formula.replace(/\(([^()]+)\)\s*\{/g, "$1{");

          // ======================================
          // (E) 保護ブロック復元
          // ======================================
          protectedBlocks.forEach((block, i) => {
            formula = formula.replace(`__PROTECTED_${i}__`, block);
          });

          loop++;
        } while (formula !== prev && loop < MAX);
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
