// ==========================================
// 0. LaTeX完全安全クレンジング
// ==========================================
function cleanLatex(formula) {
  if (!formula) return "";

  formula = formula.trim();

  let prev;
  let loop = 0;
  const MAX = 50;

  do {
    prev = formula;

    // ======================================
    // (A) 構造保護（絶対壊さない）
    // ======================================
    const protectedBlocks = [];

    formula = formula.replace(
      /(\\left\([^]*?\\right\))|(\\frac\{[^}]*\}\{[^}]*\})|(\\operatorname\{[^}]*\})|(\\sqrt\{[^}]*\})/g,
      (m) => {
        const key = `__P${protectedBlocks.length}__`;
        protectedBlocks.push(m);
        return key;
      }
    );

    // ======================================
    // (B) 不要カッコ削除（安全）
    // ======================================

    // (x)
    formula = formula.replace(/\((x)\)/g, "$1");

    // (数値)
    formula = formula.replace(/\((\d+(\.\d+)?)\)/g, "$1");

    // ((式)) → 式
    formula = formula.replace(/\(([^()]+)\)/g, "$1");

    // ======================================
    // (C) 外側全体カッコ削除
    // ======================================
    if (
      formula.startsWith("(") &&
      formula.endsWith(")") &&
      isBalanced(formula.slice(1, -1))
    ) {
      formula = formula.slice(1, -1).trim();
    }

    // ======================================
    // (D) 定義域対策
    // ======================================
    formula = formula.replace(/\{[^}]*\}/g, (m) =>
      m.replace(/[()]/g, "")
    );

    formula = formula.replace(/\(([^()]+)\)\s*\{/g, "$1{");

    // ======================================
    // (E) left/right修復
    // ======================================

    const leftCount = (formula.match(/\\left\(/g) || []).length;
    const rightCount = (formula.match(/\\right\)/g) || []).length;

    if (leftCount > rightCount) {
      formula += "\\right)";
    }

    // ======================================
    // (F) 復元
    // ======================================
    protectedBlocks.forEach((b, i) => {
      formula = formula.replace(`__P${i}__`, b);
    });

    loop++;
  } while (formula !== prev && loop < MAX);

  return formula;
}

// ==========================================
// カッコ整合性チェック
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

// ==========================================
// 1. グラフ描画・同期更新処理（完全安定版）
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

      // ここで完全クレンジング（重要）
      formula = cleanLatex(formula);

      // ==========================================
      // Desmos送信
      // ==========================================
      if (formula && formula.trim() !== "") {
        const isRelation =
          /=|\\lt|\\gt|\\le|\\ge|\{/.test(formula) ||
          block.type === "Relation" ||
          block.type === "Relation_Range";

        if (!isRelation) {
          formula = `y = ${formula}`;
        }

        console.log("Desmos最終:", formula);

        calculator.setExpression({
          id: desmosId,
          latex: formula,
        });
      }
    });

    // ==========================================
    // 削除処理
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
};
