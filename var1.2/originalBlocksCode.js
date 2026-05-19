// ==========================================
// 1. ジェネレーターの基本定義と初期設定
// ==========================================
// "LaTeX"という名前の新しいコードジェネレーターをインスタンス化し、グローバル（window）に登録
window.latexGenerator = new Blockly.Generator("LaTeX");

// 演算子の優先順位（結合度）を定義
window.latexGenerator.ORDER_NONE = 0; // 優先順位なし（括弧などの処理を考慮しない最低の結合度）
window.latexGenerator.ORDER_ATOMIC = 99; // 最小単位（これ以上分解できない最高の結合度。変数や数値など）

// ワークスペース全体のコード生成を開始する前の初期化処理（今回は何も行わない）
window.latexGenerator.init = function (workspace) {};

// ワークスペース全体のコード生成が完了した後に、最終的な文字列を整形して返す処理
window.latexGenerator.finish = function (code) {
  return code;
};

// ブロック群が縦に結合（接続）されている場合、それらを1つの文字列に繋げるための処理
window.latexGenerator.scrub_ = function (block, code, opt_thisOnly) {
  // 次に結合されているブロックを取得
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  // 引数 opt_thisOnly が true の場合は現在のブロックのみ処理、false の場合は次のブロックのコードも生成
  const nextCode = opt_thisOnly
    ? ""
    : window.latexGenerator.blockToCode(nextBlock);
  // 現在のブロックのコードと、それに続くブロックのコードを連結して返す
  return code + nextCode;
};

// ==========================================
// 2. 個々のブロックに対応するLaTeX数式生成ロジック
// ==========================================

// --- 数値ブロック（標準の math_number） ---
window.latexGenerator.forBlock["math_number"] = function (block) {
  // ブロックに入力された数値（NUM）を文字列に変換
  const code = String(block.getFieldValue("NUM"));
  // 生成した文字列と、これ以上分解できない最小単位であることを示す優先順位をセットで返す
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 四則演算 ---
window.latexGenerator.forBlock["math_operator"] = function (block) {
  // 入力スロット「A」に接続されているブロックからコードを生成。未接続なら null
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // 入力スロット「B」に接続されているブロックからコードを生成。未接続なら null
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // 選択されている演算子の種類（ADD, MINUS, MULT, DIV）を取得
  const op = block.getFieldValue("OP");

  let code = "";
  // 演算子の種類に応じて、LaTeX形式の数式文字列を組み立て
  switch (op) {
    case "ADD":
      code = `${a} + ${b}`; // 加算
      break;
    case "MINUS":
      code = `${a} - ${b}`; // 減算
      break;
    case "MULT":
      code = `${a} \\cdot ${b}`; // 乗算（中黒「・」を表現する \cdot）
      break;
    case "DIV":
      code = `\\frac{${a}}{${b}}`; // 除算（分数表現の \frac{分子}{分母}）
      break;
  }
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- べき乗 ---
window.latexGenerator.forBlock["power"] = function (block) {
  // 底（ベースの数）のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // 指数のコードを生成
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // LaTeXの累乗形式「底^{指数}」として組み立てて返す
  return [`${a}^{${b}}`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 平方根 ---
window.latexGenerator.forBlock["sqrt"] = function (block) {
  // ルートの中身となるコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // LaTeXのルート形式「\sqrt{中身}」として組み立てて返す
  return [`\\sqrt{${a}}`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 三角関数 ---
window.latexGenerator.forBlock["trigonometry"] = function (block) {
  // 引数（角度など）のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // 選択されている関数名（SIN, COS, TAN）を取得
  const op = block.getFieldValue("OP");
  // 内部値を小文字に変換（'sin', 'cos', 'tan'）
  const func = op.toLowerCase();
  // LaTeXの三角関数形式「\関数名\left(引数\right)」として組み立てて返す（括弧のサイズが自動調整されるように \left / \right を付与）
  return [`\\${func}\\left(${a}\\right)`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 関係式（最外殻になる等式・不等式） ---
window.latexGenerator.forBlock["Relation"] = function (block) {
  // 左辺のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // 右辺のコードを生成
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || null;
  // 選択されている比較演算子を取得
  const op = block.getFieldValue("OP");

  let symbol = "=";
  // 演算子の種類に応じて、Desmosなどが認識できる等号・不等号記号にマッピング
  switch (op) {
    case "EQ":
      symbol = "="; // 等しい
      break;
    case "LT":
      symbol = "<"; // 未満
      break;
    case "LTE":
      symbol = "<="; // 以下
      break;
    case "GT":
      symbol = ">"; // 超える
      break;
    case "GTE":
      symbol = ">="; // 以上
      break;
  }
  // このブロックは他のブロックに組み込まれる出力（setOutput）を持たず、式そのものを表す「最外殻」となるため、
  // 配列ではなく、生成された等式・不等式の完成した文字列単体をそのまま返す
  return `${a} ${symbol} ${b}`;
};

// --- X,Y変数 ---
window.latexGenerator.forBlock["XYVariable"] = function (block) {
  // 選択されている変数名（"x" または "y"）を取得
  const op = block.getFieldValue("OP");
  // 変数名の文字列そのものと、最小単位であることを示す優先順位を返す
  return [op, window.latexGenerator.ORDER_ATOMIC];
};
