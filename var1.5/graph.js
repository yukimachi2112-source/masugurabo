// ==========================================
// 1. グラフ描画・同期更新処理（Blockly から Desmos API への橋渡し）
// ==========================================
window.initGraphUpdater = (targetWorkspace) => {
  if (!targetWorkspace) return;

  targetWorkspace.addChangeListener((event) => {
    const changedBlock = event.blockId
      ? targetWorkspace.getBlockById(event.blockId)
      : null;

    const changedTopBlock = changedBlock ? changedBlock.getRootBlock() : null;

    if (event.isUiEvent) return;

    if (event.type === Blockly.Events.BLOCK_MOVE && event.isDragging) {
      return;
    }

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

      // // ==========================================
      // // 2. カッコの自動クレンジング・整形処理
      // // ==========================================
      // if (formula) {
      //   formula = formula.trim();

      //   const maxLoops = 10;
      //   let previousFormula;
      //   let loopCount = 0;

      //   do {
      //     previousFormula = formula;

      //     formula = formula.replace(
      //       /(?<!\\left)\(([^()]+)\)(?!\\right)/g,
      //       "$1",
      //     );

      //     if (formula.startsWith("(") && formula.endsWith(")")) {
      //       formula = formula.substring(1, formula.length - 1).trim();
      //     }

      //     loopCount++;
      //   } while (formula !== previousFormula && loopCount < maxLoops);

      //   // ① 定義域内部の丸カッコ除去
      //   formula = formula.replace(/\{[^}]+\}/g, (match) =>
      //     match.replace(/[()]/g, ""),
      //   );

      //   // ② 定義域直前の丸カッコ除去
      //   formula = formula.replace(/\(([^()]+)\)\s*\{/g, "$1{");

      //   // ③ 定義域ごと包まれた丸カッコ除去
      //   if (formula.startsWith("(") && formula.endsWith("}")) {
      //     formula = formula.substring(1).trim();
      //   }
      // }

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

        if (changedTopBlock && changedTopBlock.id === block.id) {
          window.updateLatexPreview(formula);
        }
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
};
