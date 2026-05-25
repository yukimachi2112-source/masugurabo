import { cleanLatex } from "./latexCleaner.js";

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
