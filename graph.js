// ==========================================
// 0. LaTeXジェネレーター定義
// ==========================================
window.latexGenerator = new Blockly.Generator("LaTeX");

window.latexGenerator.ORDER_NONE = 0;
window.latexGenerator.ORDER_ATOMIC = 99;

window.latexGenerator.init = function () {};
window.latexGenerator.finish = function (code) {
  return code;
};

window.latexGenerator.scrub_ = function (block, code, opt_thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = opt_thisOnly
    ? ""
    : window.latexGenerator.blockToCode(nextBlock);

  return code + nextCode;
};

// ==========================================
// 1. ブロック定義（カッコ最小化設計）
// ==========================================

window.latexGenerator.forBlock["math_number"] = (b) => [
  String(b.getFieldValue("NUM")),
  99,
];

window.latexGenerator.forBlock["XYVariable"] = (b) => [
  b.getFieldValue("OP"),
  99,
];

window.latexGenerator.forBlock["math_operator"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";
  const op = b.getFieldValue("OP");

  switch (op) {
    case "ADD":
      return [`${a} + ${c}`, 0];
    case "MINUS":
      return [`${a} - ${c}`, 0];
    case "MULT":
      return [`${a} \\cdot ${c}`, 0];
    case "DIV":
      return [`\\frac{${a}}{${c}}`, 99];
  }
};

window.latexGenerator.forBlock["power"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";
  return [`${a}^{${c}}`, 99];
};

window.latexGenerator.forBlock["sqrt"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const op = b.getFieldValue("OP");

  if (op === "SQRT") return [`\\sqrt{${a}}`, 99];
  if (op === "ABS") return [`\\left|${a}\\right|`, 99];
  if (op === "RECIPROCAL") return [`\\frac{1}{${a}}`, 99];
};

window.latexGenerator.forBlock["trigonometry"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const f = b.getFieldValue("OP").toLowerCase();
  return [`\\${f}\\left(${a}\\right)`, 99];
};

window.latexGenerator.forBlock["math_round_functions"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const map = { FLOOR: "floor", CEIL: "ceil", ROUND: "round" };
  return [`\\operatorname{${map[b.getFieldValue("OP")]}}\\left(${a}\\right)`, 99];
};

window.latexGenerator.forBlock["logarithm"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  return b.getFieldValue("OP") === "LOG10"
    ? [`\\log_{10}\\left(${a}\\right)`, 99]
    : [`\\ln\\left(${a}\\right)`, 99];
};

window.latexGenerator.forBlock["constant"] = (b) => [
  b.getFieldValue("OP") === "PI" ? "\\pi" : "e",
  99,
];

window.latexGenerator.forBlock["Relation"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";
  const map = {
    EQ: "=",
    LT: "\\lt",
    LTE: "\\le",
    GT: "\\gt",
    GTE: "\\ge",
  };
  return `${a} ${map[b.getFieldValue("OP")]} ${c}`;
};

window.latexGenerator.forBlock["Relation_Range"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";
  const r = window.latexGenerator.valueToCode(b, "RANGE", 0) || "";

  const map = {
    EQ: "=",
    LT: "\\lt",
    LTE: "\\le",
    GT: "\\gt",
    GTE: "\\ge",
  };

  return r
    ? `${a} ${map[b.getFieldValue("OP")]} ${c} \\{ ${r} \\}`
    : `${a} ${map[b.getFieldValue("OP")]} ${c}`;
};

window.latexGenerator.forBlock["range"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";

  const map = {
    LT: "\\lt",
    LTE: "\\le",
    GT: "\\gt",
    GTE: "\\ge",
  };

  return [`${a} ${map[b.getFieldValue("OP")]} ${c}`, 99];
};

// ==========================================
// 2. LaTeXクレンジング（壊さない版）
// ==========================================
function cleanLatex(formula) {
  if (!formula) return "";

  let prev;
  let loop = 0;

  do {
    prev = formula;

    // 保護
    const store = [];
    formula = formula.replace(
      /(\\left\([^]*?\\right\))|(\\frac\{[^}]*\}\{[^}]*\})|(\\operatorname\{[^}]*\})|(\\sqrt\{[^}]*\})/g,
      (m) => {
        const k = "__P" + store.length + "__";
        store.push(m);
        return k;
      }
    );

    // 軽い削除だけ
    formula = formula
      .replace(/\((x)\)/g, "x")
      .replace(/\((\d+(\.\d+)?)\)/g, "$1");

    // 保存復元
    store.forEach((v, i) => {
      formula = formula.replace("__P" + i + "__", v);
    });

    loop++;
  } while (formula !== prev && loop < 20);

  // left/right補完
  const l = (formula.match(/\\left\(/g) || []).length;
  const r = (formula.match(/\\right\)/g) || []).length;
  if (l > r) formula += "\\right)";

  return formula;
}

// ==========================================
// 3. GraphUpdater
// ==========================================
window.initGraphUpdater = function (workspace) {
  if (!workspace) return;

  workspace.addChangeListener((event) => {
    if (event.isUiEvent) return;
    if (event.type === Blockly.Events.BLOCK_MOVE && event.isDragging) return;

    const topBlocks = workspace.getTopBlocks();
    const alive = new Set();

    topBlocks.forEach((block) => {
      const id = "blockly_graph_" + block.id;
      alive.add(id);

      let f = window.latexGenerator.blockToCode(block);
      if (Array.isArray(f)) f = f[0];

      f = cleanLatex(f);

      const isRelation =
        /=|\\lt|\\gt|\\le|\\ge|\{/.test(f) ||
        block.type === "Relation" ||
        block.type === "Relation_Range";

      if (!isRelation) f = "y = " + f;

      console.log("FINAL:", f);

      calculator.setExpression({ id, latex: f });
    });

    calculator.getExpressions().forEach((e) => {
      if (e.id.startsWith("blockly_graph_") && !alive.has(e.id)) {
        calculator.removeExpression(e);
      }
    });
  });
};
