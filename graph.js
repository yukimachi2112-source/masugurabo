// ==========================================
// 0. LaTeXジェネレーター定義
// ==========================================

// Blocklyに「LaTeX」というコード生成器を登録
window.latexGenerator = new Blockly.Generator("LaTeX");

// 優先順位（今回は簡易）
window.latexGenerator.ORDER_NONE = 0;   // 弱い
window.latexGenerator.ORDER_ATOMIC = 99; // 最強（数値・変数など）

// 初期化（今回は不要）
window.latexGenerator.init = function () {};

// 全体生成後処理（そのまま返す）
window.latexGenerator.finish = function (code) {
  return code;
};

// ブロックが縦に繋がってる場合の連結処理
window.latexGenerator.scrub_ = function (block, code, opt_thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  const nextCode = opt_thisOnly
    ? ""
    : window.latexGenerator.blockToCode(nextBlock);

  return code + nextCode;
};

// ==========================================
// 1. 各ブロック（構造崩壊しない生成）
// ==========================================

// --- 数値 ---
window.latexGenerator.forBlock["math_number"] = (b) => [
  String(b.getFieldValue("NUM")),
  99, // これ以上分解不可
];

// --- x / y ---
window.latexGenerator.forBlock["XYVariable"] = (b) => [
  b.getFieldValue("OP"),
  99,
];

// --- 四則演算 ---
window.latexGenerator.forBlock["math_operator"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";
  const op = b.getFieldValue("OP");

  // 無駄なカッコは最初から付けない
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

// --- 累乗 ---
window.latexGenerator.forBlock["power"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const c = window.latexGenerator.valueToCode(b, "B", 0) || "0";

  return [`${a}^{${c}}`, 99];
};

// --- sqrt / abs / reciprocal ---
window.latexGenerator.forBlock["sqrt"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const op = b.getFieldValue("OP");

  if (op === "SQRT") return [`\\sqrt{${a}}`, 99];

  // absは left/right 必須（サイズ調整）
  if (op === "ABS") return [`\\left|${a}\\right|`, 99];

  if (op === "RECIPROCAL") return [`\\frac{1}{${a}}`, 99];
};

// --- 三角関数 ---
window.latexGenerator.forBlock["trigonometry"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";
  const f = b.getFieldValue("OP").toLowerCase();

  // 必要なところだけ left/right
  return [`\\${f}\\left(${a}\\right)`, 99];
};

// --- round系 ---
window.latexGenerator.forBlock["math_round_functions"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";

  const map = {
    FLOOR: "floor",
    CEIL: "ceil",
    ROUND: "round",
  };

  return [
    `\\operatorname{${map[b.getFieldValue("OP")]}}\\left(${a}\\right)`,
    99,
  ];
};

// --- log ---
window.latexGenerator.forBlock["logarithm"] = (b) => {
  const a = window.latexGenerator.valueToCode(b, "A", 0) || "0";

  return b.getFieldValue("OP") === "LOG10"
    ? [`\\log_{10}\\left(${a}\\right)`, 99]
    : [`\\ln\\left(${a}\\right)`, 99];
};

// --- 定数 ---
window.latexGenerator.forBlock["constant"] = (b) => [
  b.getFieldValue("OP") === "PI" ? "\\pi" : "e",
  99,
];

// --- 関係式 ---
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

// --- 定義域付き ---
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

// --- 範囲 ---
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
// 2. LaTeXクレンジング（壊さない）
// ==========================================
function cleanLatex(formula) {
  if (!formula) return "";

  let prev;
  let loop = 0;

  do {
    prev = formula;

    // ===== 構造保護 =====
    const store = [];
    formula = formula.replace(
      /(\\left\([^]*?\\right\))|(\\frac\{[^}]*\}\{[^}]*\})|(\\operatorname\{[^}]*\})|(\\sqrt\{[^}]*\})/g,
      (m) => {
        const key = "__P" + store.length + "__";
        store.push(m);
        return key;
      }
    );

    // ===== 安全な簡約のみ =====
    // (x) → x
    formula = formula.replace(/\((x)\)/g, "x");

    // (10) → 10
    formula = formula.replace(/\((\d+(\.\d+)?)\)/g, "$1");

    // ===== 復元 =====
    store.forEach((v, i) => {
      formula = formula.replace("__P" + i + "__", v);
    });

    loop++;
  } while (formula !== prev && loop < 20);

  // ===== left/right補完 =====
  const l = (formula.match(/\\left\(/g) || []).length;
  const r = (formula.match(/\\right\)/g) || []).length;

  if (l > r) {
    formula += "\\right)";
  }

  return formula;
}

// ==========================================
// 3. GraphUpdater（Desmos連携）
// ==========================================
window.initGraphUpdater = function (workspace) {
  if (!workspace) return;

  workspace.addChangeListener((event) => {
    // UI操作は無視
    if (event.isUiEvent) return;

    // ドラッグ中は更新しない（軽量化）
    if (event.type === Blockly.Events.BLOCK_MOVE && event.isDragging) return;

    const topBlocks = workspace.getTopBlocks();
    const alive = new Set();

    topBlocks.forEach((block) => {
      const id = "blockly_graph_" + block.id;
      alive.add(id);

      let f = window.latexGenerator.blockToCode(block);
      if (Array.isArray(f)) f = f[0];

      // ===== 数式クレンジング =====
      f = cleanLatex(f);

      // ===== y= 自動補完 =====
      const isRelation =
        /=|\\lt|\\gt|\\le|\\ge|\{/.test(f) ||
        block.type === "Relation" ||
        block.type === "Relation_Range";

      if (!isRelation) f = "y = " + f;

      console.log("FINAL:", f);

      // ===== Desmos送信 =====
      calculator.setExpression({ id, latex: f });
    });

    // ===== 削除同期 =====
    calculator.getExpressions().forEach((e) => {
      if (e.id.startsWith("blockly_graph_") && !alive.has(e.id)) {
        calculator.removeExpression(e);
      }
    });
  });
};
