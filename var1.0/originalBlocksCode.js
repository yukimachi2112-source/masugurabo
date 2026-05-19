window.latexGenerator = new Blockly.Generator("LaTeX");
window.latexGenerator.ORDER_NONE = 0;
window.latexGenerator.ORDER_ATOMIC = 99;
window.latexGenerator.init = function (workspace) {};
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

// --- 数値ブロック（標準の math_number） ---
window.latexGenerator.forBlock["math_number"] = function (block) {
  const code = String(block.getFieldValue("NUM"));
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 四則演算 ---
window.latexGenerator.forBlock["math_operator"] = function (block) {
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || null;
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
      code = `${a} \\cdot ${b}`;
      break;
    case "DIV":
      code = `\\frac{${a}}{${b}}`;
      break;
  }
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- べき乗 ---
window.latexGenerator.forBlock["power"] = function (block) {
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  return [`${a}^{${b}}`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 平方根 ---
window.latexGenerator.forBlock["sqrt"] = function (block) {
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  return [`\\sqrt{${a}}`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 三角関数 ---
window.latexGenerator.forBlock["trigonometry"] = function (block) {
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  const op = block.getFieldValue("OP");
  const func = op.toLowerCase(); // 'sin', 'cos', 'tan'
  return [`\\${func}\\left(${a}\\right)`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 関係式（最外殻になる等式・不等式） ---
window.latexGenerator.forBlock["Relation"] = function (block) {
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  const op = block.getFieldValue("OP");

  let symbol = "=";
  switch (op) {
    case "EQ":
      symbol = "=";
      break;
    case "LT":
      symbol = "<";
      break;
    case "LTE":
      symbol = "<=";
      break;
    case "GT":
      symbol = ">";
      break;
    case "GTE":
      symbol = ">=";
      break;
  }
  return `${a} ${symbol} ${b}`; // 最外殻なので文字列単体で返す
};

// --- X,Y変数 ---
window.latexGenerator.forBlock["XYVariable"] = function (block) {
  const op = block.getFieldValue("OP"); // "x" または "y"
  return [op, window.latexGenerator.ORDER_ATOMIC];
};
