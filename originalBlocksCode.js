// ==========================================
// 1. ジェネレーターの新規定義と初期設定 
// ==========================================
// Blocklyのコアシステムに「LaTeX」という名前の新しいコード生成器（ジェネレーター）を登録
window.latexGenerator = new Blockly.Generator("LaTeX");

// 演算子の結合度（優先順位）を定義する定数
window.latexGenerator.ORDER_NONE = 99; // 優先順位なし（結合力が最も弱く、括弧などの処理を考慮しない最低の結合度）
window.latexGenerator.ORDER_ATOMIC = 99; // 最小単位（これ以上分解・展開できない最高の結合度。変数や数値など単体）

// ワークスペース全体のコード生成を開始する前の前処理（今回は事前準備が不要なため空関数）
window.latexGenerator.init = function (workspace) {};

// ワークスペース全体のコード生成がすべて完了した後に、最終的な文字列をパッケージングして返す処理
window.latexGenerator.finish = function (code) {
  return code;
};

// ブロック群が縦方向（ステートメント接続）に結合されている場合、それらを上から順に走査して1つの文字列に連結する共通処理
window.latexGenerator.scrub_ = function (block, code, opt_thisOnly) {
  // 現在のブロックの直後に物理的に結合されている次のブロックを取得
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();

  // 引数 opt_thisOnly が true の場合は現在のブロックのみ処理、false の場合は後続のブロックのコードも再帰的に生成
  const nextCode = opt_thisOnly
    ? ""
    : window.latexGenerator.blockToCode(nextBlock);

  // 現在のブロックが生成したコードと、それに続くすべてのブロックのコードを文字列結合して戻す
  return code + nextCode;
};

// ==========================================
// 2. 各個別ブロックに対応するLaTeX数式生成ロジック
// ==========================================

// --- 数値ブロック（標準の math_number） ---
window.latexGenerator.forBlock["math_number"] = function (block) {
  // ブロックの入力フィールドから数値を取得し、プレーンな文字列に変換
  const code = String(block.getFieldValue("NUM"));
  // 生成した文字列と、これ以上分解できない最小単位（ORDER_ATOMIC）であることを示す優先順位のペアを配列で返す
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 四則演算ブロック ---
window.latexGenerator.forBlock["math_operator"] = function (block) {
  // 入力スロット「A」に接続されている子ブロックからコードを再帰生成。未接続（null）ならデフォルト値として「0」を補完
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 入力スロット「B」に接続されている子ブロックからコードを再帰生成。未接続（null）ならデフォルト値として「0」を補完
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // ドロップダウンで選択されている演算子キー（ADD, MINUS, MULT, DIV）を取得
  const op = block.getFieldValue("OP");

  let code = "";
  // 演算子の種類に応じ、LaTeXの数式表記ルールに則って文字列を組み立て
  switch (op) {
    case "ADD":
      code = `${a} + ${b}`; // 加算（標準的なプラス記号）
      break;
    case "MINUS":
      code = `${a} - ${b}`; // 減算（標準的なマイナス記号）
      break;
    case "MULT":
      code = `${a} \\cdot ${b}`; // 乗算（Desmos等で中黒を表現する \cdot コマンド。JSの文字列内でエスケープするためバックスラッシュは2本）
      break;
    case "DIV":
      code = `\\frac{${a}}{${b}}`; // 除算（分数表現を構築する \frac{分子}{分母} コマンド）
      break;
  }
  // 四則演算の塊を1つの完結した数式要素（ORDER_ATOMIC）として安全に受け渡す
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- べき乗（累乗）ブロック ---
window.latexGenerator.forBlock["power"] = function (block) {
  // 底（ベースとなる数）のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 指数のコードを生成
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // LaTeXの累乗形式「底^{指数}」を組み立て。指数が複数文字になっても正しく上付き配置されるよう中括弧で囲む
  return [`${a}^{${b}}`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 平方根、絶対値、逆数ブロック ---
window.latexGenerator.forBlock["sqrt"] = function (block) {
  // 計算対象（中身）となる数式のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 選択されている演算の識別値を取得
  const op = block.getFieldValue("OP");

  let code = "";
  switch (op) {
    case "SQRT":
      code = `\\sqrt{${a}}`; // 平方根（\sqrt{対象} コマンドを生成）
      break;
    case "ABS":
      code = `\\left|${a}\\right|`; // 絶対値（中身の縦の長さに合わせて縦棒が自動追従して拡大するよう \left| と \right| で囲む）
      break;
    case "RECIPROCAL":
      code = `\\frac{1}{${a}}`; // 逆数（分子を「1」に固定した分数を生成）
      break;
  }
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 三角関数ブロック ---
window.latexGenerator.forBlock["trigonometry"] = function (block) {
  // 引数（角度や値）のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 選択されている関数名を取得（"SIN", "COS", "TAN"）
  const op = block.getFieldValue("OP");
  // LaTeXコマンドはすべて小文字（\sin等）であるため、toLowerCase関数で小文字の文字列へと変換
  const func = op.toLowerCase();

  console.log(`${func}の引数:`, a);

  // 内部の数式サイズ（分数など）に応じて丸括弧のサイズが自動最適化されるよう \left( と \right) を付与してラップ
  return [`\\${func}\\left(${a}\\right)`, window.latexGenerator.ORDER_ATOMIC];
};

// --- 関係式（最外殻になる等式・不等式）ブロック ---
window.latexGenerator.forBlock["Relation"] = function (block) {
  // 左辺のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 右辺のコードを生成
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 選択されている関係演算子を取得
  const op = block.getFieldValue("OP");

  let symbol = "=";
  // Desmos APIが内部で厳密にパース・識別できる正規のLaTeX不等号コマンドへ安全にマッピング
  switch (op) {
    case "EQ":
      symbol = "=";
      break; // 等号
    case "LT":
      symbol = "\\lt";
      break; // 未満（Less Than）
    case "LTE":
      symbol = "\\le";
      break; // 以下（Less than or Equal to）
    case "GT":
      symbol = "\\gt";
      break; // 超える（Greater Than）
    case "GTE":
      symbol = "\\ge";
      break; // 以上（Greater than or Equal to）
  }
  // このブロックは他のブロックのパーツにならず、単体で「数式（式そのもの）」となるため、
  // 優先順位の配列ではなく、生成された完成文字列（単体）をそのまま出力する
  return `${a} ${symbol} ${b}`;
};

// --- X,Y変数ブロック ---
window.latexGenerator.forBlock["XYVariable"] = function (block) {
  // 選択されている変数文字列（"x" または "y"）をそのまま取得
  const code = block.getFieldValue("OP");
  // 変数名は単一の文字であり、これ以上分解不可能な最小単位（ORDER_ATOMIC）として扱う
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 床関数、天井関数、四捨五入ブロック ---
window.latexGenerator.forBlock["math_round_functions"] = function (block) {
  // 丸め処理の対象となる内側の数式のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 選択されている関数のアルゴリズム（FLOOR, CEIL, ROUND）を取得
  const op = block.getFieldValue("OP");

  let code = "";
  switch (op) {
    case "FLOOR":
      code = `\\left\\lfloor${a}\\right\\rfloor`; // 床関数（切り捨て。下部だけにカギがあるブラケット \lfloor と \rfloor を適用）
      break;
    case "CEIL":
      code = `\\left\\lceil${a}\\right\\rceil`; // 天井関数（切り上げ。上部だけにカギがあるブラケット \lceil と \rceil を適用）
      break;
    case "ROUND":
      code = `\\left\\lfloor${a} + \\frac{1}{2}\\right\\rfloor`; // 四捨五入（対象に0.5を足した上で床関数を適用する数学的アプローチで実装）
      break;
  }
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 対数関数ブロック ---
window.latexGenerator.forBlock["logarithm"] = function (block) {
  // 対数の真数部分にあたるコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 対数の種類（LOG10, LN）を取得
  const op = block.getFieldValue("OP");

  let code = "";
  switch (op) {
    case "LOG10":
      code = `\\log_{10}\\left(${a}\\right)`; // 常用対数（底を「10」に指定。真数を括弧でラップ）
      break;
    case "LN":
      code = `\\ln\\left(${a}\\right)`; // 自然対数（底が e であることを示す \ln コマンドを使用）
      break;
  }
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 定数ブロック ---
window.latexGenerator.forBlock["constant"] = function (block) {
  // 選択されている定数キー（"PI" または "E"）を取得
  const op = block.getFieldValue("OP");
  let code = "";
  switch (op) {
    case "PI":
      code = `\\pi`; // 円周率（ギリシャ文字のパイを表示する \pi コマンドへ変換）
      break;
    case "E":
      code = `e`; // 自然対数の底（アルファベットの「e」をそのまま出力）
      break;
  }
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 変数の定義ブロック ---
window.latexGenerator.forBlock["custom_variable_set"] = function (block) {
  // ユーザーが入力したテキストから、定義する変数名（"a" や "t" など）を文字列として取得
  const varName = String(block.getFieldValue("VAR_NAME"));

  // 右辺（VALUE）スロットに結合されたブロックから数式コードを生成。未結合なら "0" をセット
  const value =
    window.latexGenerator.valueToCode(
      block,
      "VALUE",
      window.latexGenerator.ORDER_NONE,
    ) || "0";

  // Desmosが「スライダー（変数定義）」として認識可能な「変数名 = 値」の代入構文を組み立てて返す
  return `${varName} = ${value}`;
};

// --- 変数の呼び出しブロック ---
window.latexGenerator.forBlock["custom_variable"] = function (block) {
  // ドロップダウンリストから現在選択されている変数名を文字列として取得
  const code = String(block.getFieldValue("VAR_NAME"));
  // 呼び出された変数は単体の名前（最小単位）として ORDER_ATOMIC を指定してリターン
  return [code, window.latexGenerator.ORDER_ATOMIC];
};

// --- 関係式（比較）ブロック（定義域付き） ---
window.latexGenerator.forBlock["Relation_Range"] = function (block) {
  // 主数式の左辺と右辺の数式コードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 主数式の等号・不等号の種類を取得
  const op = block.getFieldValue("OP");

  let symbol = "=";
  // 主数式用の関係演算子をLaTeXコマンドにマッピング
  switch (op) {
    case "EQ":
      symbol = "=";
      break;
    case "LT":
      symbol = "\\lt";
      break;
    case "LTE":
      symbol = "\\le";
      break;
    case "GT":
      symbol = "\\gt";
      break;
    case "GTE":
      symbol = "\\ge";
      break;
  }

  // RANGEスロットに接続された定義域用ブロックから条件式コードを生成。未接続なら空文字にする
  const range =
    window.latexGenerator.valueToCode(
      block,
      "RANGE",
      window.latexGenerator.ORDER_NONE,
    ) || "";

  // Desmos APIが「定義域（描画範囲制限）」として正常に解釈するための重要な構文ルールを適用：
  // API経由の通信では、波括弧にバックスラッシュ（\\）を付けてエスケープするとパースエラーを起こしてグラフが消える仕様のため、
  // 必ずエスケープなしの「生の波括弧 { }」を用いて、数式の直後に条件を直結させる。
  // 定義域ブロック（range）が接続されている場合のみ中括弧のコードを結合し、未接続なら通常の数式をそのまま返す。
  const domain = range
    ? `${a} ${symbol} ${b} \\{ ${range} \\}`
    : `${a} ${symbol} ${b}`;

  return domain;
};

// --- 関係式（最外殻になる等式・不等式）定義域用パーツ ---
window.latexGenerator.forBlock["range"] = function (block) {
  // 範囲制限を構成する左辺と右辺のコードを生成
  const a =
    window.latexGenerator.valueToCode(
      block,
      "A",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  const b =
    window.latexGenerator.valueToCode(
      block,
      "B",
      window.latexGenerator.ORDER_NONE,
    ) || 0;
  // 選択されている不等号の種類を取得
  const op = block.getFieldValue("OP");

  let symbol = "\\lt";
  // 定義域の内部で用いられる不等号を、Desmos API対応のLaTeXコマンドにマッピング
  switch (op) {
    case "LT":
      symbol = "\\lt";
      break;
    case "LTE":
      symbol = "\\le";
      break;
    case "GT":
      symbol = "\\gt";
      break;
    case "GTE":
      symbol = "\\ge";
      break;
  }

  // このブロックは「setOutput」を持つパーツ用ブロックであるため、必ず「[文字列, 優先順位]」の配列形式で値を返す
  return [`${a} ${symbol} ${b}`, window.latexGenerator.ORDER_ATOMIC];
};
