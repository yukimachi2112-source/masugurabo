// ==========================================
// 1. ジェネレーターの新規定義と初期設定
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
// 2. 補助関数（超重要）
// ==========================================

// 不要な () をつけない
function wrapIfNeeded(code) {
  if (/^[a-zA-Z0-9]+$/.test(code)) return code;
  return code;
}

// ==========================================
// 3. 各ブロック
// ==========================================

// --- 数値 ---
window.latexGenerator.forBlock["math_number"] = function (block) {
  return [String(block.getFieldValue("NUM")), window.latexGenerator.ORDER_ATOMIC];
};

// --- 四則演算 ---
window.latexGenerator.forBlock["math_operator"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const b = window.latexGenerator.valueToCode(block, "B", 0) || "0";
  const op = block.getFieldValue("OP");

  let code = "";

  switch (op) {
    case "ADD":
      code = `${a} + ${b}`;
      break;

    case "MINUS":
      code = `${a} - ${b}`;
      break;

    case "MULT":
      code = `${wrapIfNeeded(a)} \\cdot ${wrapIfNeeded(b)}`;
      break;

    case "DIV":
      code = `\\frac{${a}}{${b}}`;
      break;
  }

  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 累乗 ---
window.latexGenerator.forBlock["power"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const b = window.latexGenerator.valueToCode(block, "B", 0) || "0";

  return [`${a}^{${b}}`, window.latexGenerator.ORDER_ATOMIC];
};

// --- sqrt / abs / reciprocal ---
window.latexGenerator.forBlock["sqrt"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const op = block.getFieldValue("OP");

  let code = "";

  switch (op) {
    case "SQRT":
      code = `\\sqrt{${a}}`;
      break;

    case "ABS":
      // left/rightはここだけ
      code = `\\left|${a}\\right|`;
      break;

    case "RECIPROCAL":
      code = `\\frac{1}{${a}}`;
      break;
  }

  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 三角関数 ---
window.latexGenerator.forBlock["trigonometry"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const func = block.getFieldValue("OP").toLowerCase();

  // 不要カッコ禁止
  return [`\\${func}\\left(${a}\\right)`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 関係式 ---
window.latexGenerator.forBlock["Relation"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const b = window.latexGenerator.valueToCode(block, "B", 0) || "0";
  const op = block.getFieldValue("OP");

  const map = {
    EQ: "=",
    LT: "\\lt",
    LTE: "\\le",
    GT: "\\gt",
    GTE: "\\ge",
  };

  return `${a} ${map[op]} ${b}`;
};

// --- 変数 ---
window.latexGenerator.forBlock["XYVariable"] = function (block) {
  return [block.getFieldValue("OP"), window.latexGenerator.ORDER_ATOMIC];
};

// --- round系 ---
window.latexGenerator.forBlock["math_round_functions"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const op = block.getFieldValue("OP");

  const map = {
    FLOOR: "floor",
    CEIL: "ceil",
    ROUND: "round",
  };

  return [
    `\\operatorname{${map[op]}}\\left(${a}\\right)`,
    window.latexGenerator.ORDER_ATOMIC,
  ];
};

// --- log ---
window.latexGenerator.forBlock["logarithm"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const op = block.getFieldValue("OP");

  if (op === "LOG10") {
    return [`\\log_{10}\\left(${a}\\right)`, window.latexGenerator.ORDER_ATOMIC];
  }

  return [`\\ln\\left(${a}\\right)`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 定数 ---
window.latexGenerator.forBlock["constant"] = function (block) {
  const op = block.getFieldValue("OP");

  return [
    op === "PI" ? "\\pi" : "e",
    window.latexGenerator.ORDER_ATOMIC,
  ];
};

// --- 変数定義 ---
window.latexGenerator.forBlock["custom_variable_set"] = function (block) {
  const name = block.getFieldValue("VAR_NAME");
  const value =
    window.latexGenerator.valueToCode(block, "VALUE", 0) || "0";

  return `${name} = ${value}`;
};

// --- 変数呼び出し ---
window.latexGenerator.forBlock["custom_variable"] = function (block) {
  return [block.getFieldValue("VAR_NAME"), window.latexGenerator.ORDER_ATOMIC];
};

// --- 関係式 + 定義域 ---
window.latexGenerator.forBlock["Relation_Range"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const b = window.latexGenerator.valueToCode(block, "B", 0) || "0";
  const range =
    window.latexGenerator.valueToCode(block, "RANGE", 0) || "";

  const op = block.getFieldValue("OP");

  const map = {
    EQ: "=",
    LT: "\\lt",
    LTE: "\\le",
    GT: "\\gt",
    GTE: "\\ge",
  };

  return range
    ? `${a} ${map[op]} ${b} \\{ ${range} \\}`
    : `${a} ${map[op]} ${b}`;
};

// --- range ---
window.latexGenerator.forBlock["range"] = function (block) {
  const a = window.latexGenerator.valueToCode(block, "A", 0) || "0";
  const b = window.latexGenerator.valueToCode(block, "B", 0) || "0";
  const op = block.getFieldValue("OP");

  const map = {
    LT: "\\lt",
    LTE: "\\le",
    GT: "\\gt",
    GTE: "\\ge",
  };

  return [`${a} ${map[op]} ${b}`, window.latexGenerator.ORDER_ATOMIC];
};
