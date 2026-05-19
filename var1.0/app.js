// 初期化
const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox"),
  renderer: "zelos",
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
  },
  move: {
    scrollbars: true,
    drag: true,
    wheel: true,
  },
});

const elt = document.getElementById("graphDiv");
const calculator = Desmos.GraphingCalculator(elt, {
  expressions: false,
  keypad: false,
});

// グラフ処理
workspace.addChangeListener((event) => {
  // UI操作（スクロールやツールボックス開閉）は無視
  if (event.isUiEvent) return;

  const topBlocks = workspace.getTopBlocks();
  calculator.setBlank(); // Desmosの表示を一度リセット

  topBlocks.forEach((block, index) => {
    let formula = "";

    try {
      // 修正された window.latexGenerator を使って安全に数式を抽出
      const res = window.latexGenerator.blockToCode(block);

      if (Array.isArray(res)) {
        formula = res[0]; // 値ブロックは配列[code, order]で返るため[0]を抽出
      } else {
        formula = res; // Relationブロックなどの場合は文字列をそのまま抽出
      }
    } catch (e) {
      console.error(e);
      return; // 組み立て途中のエラーはスルー
    }

    if (formula) {
      formula = formula.trim();

      // ループを使って、消せる単体カッコが完全になくなるまで繰り返す
      let previousFormula;
      do {
        previousFormula = formula;
        // \left( や \right) に挟まれていない、不要な単体カッコ (文字) を解除
        formula = formula.replace(/(?<!\\left)\(([^()]+)\)(?!\\right)/g, "$1");
        // 最外殻のカッコも毎回トリミング
        if (formula.startsWith("(") && formula.endsWith(")")) {
          formula = formula.substring(1, formula.length - 1).trim();
        }
      } while (formula !== previousFormula);
    }

    // 条件を満たしていればDesmosに式を登録して描画
    if (formula && formula.trim() !== "") {
      const hasVariable = /x|y/i.test(formula);

      if (hasVariable) {
        // 一番外側が「Relation」以外なら頭に「y =」を自動補完
        if (block.type !== "Relation") {
          formula = `y = ${formula}`;
        }

        // 変数が含まれている有効な式だけをDesmosに登録して描画
        calculator.setExpression({
          id: `blockly_graph_${index}`,
          latex: formula,
        });
      }
    }
  });
});

// --- グラフサイズの固定 ---
window.addEventListener("resize", () => {
  calculator.resize();
});
