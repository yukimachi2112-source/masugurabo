// JavaScriptコード生成用のジェネレーターオブジェクトを取得（※このコード内では参照のみで未使用）
const javascriptGenerator = Blockly.JavaScript;

// ==========================================
// 1. 四則演算ブロック（[A] [+] [B] のような数式を作成）
// ==========================================
Blockly.Blocks["math_operator"] = {
  init: function () {
    // 左側（1つ目）の数値入力エリアを定義。入力できるのは数値（Number）型のみ
    this.appendValueInput("A").setCheck("Number");

    // 四則演算の記号（演算子）を選択するドロップダウンメニューを定義
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["+", "ADD"], // 画面表示: + , 内部値: ADD
        ["−", "MINUS"], // 画面表示: − , 内部値: MINUS
        ["×", "MULT"], // 画面表示: × , 内部値: MULT
        ["÷", "DIV"], // 画面表示: ÷ , 内部値: DIV
      ]),
      "OP", // このドロップダウンの識別名（フィールド名）
    );

    // 右側（2つ目）の数値入力エリアを定義。入力できるのは数値（Number）型のみ
    this.appendValueInput("B").setCheck("Number");

    // 入力スロットやテキストを折り返さず、横一列に並べる設定
    this.setInputsInline(true);

    // このブロック自体が「数値（Number）を返す」出力コネクタ（左側の突起）を持つように設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 2. べき乗（累乗）ブロック（[A] の [B] 乗）
// ==========================================
Blockly.Blocks["power"] = {
  init: function () {
    // 底（ベースとなる数）の入力エリアを定義。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 日本語の助詞「の」のテキストを表示
    this.appendDummyInput().appendField("の");

    // 指数（何乗するか）の入力エリアを定義。数値のみ許可
    this.appendValueInput("B").setCheck("Number");

    // 日本語の結び「乗」のテキストを表示
    this.appendDummyInput().appendField("乗");

    // すべての要素を横一列に並べる設定
    this.setInputsInline(true);

    // 数値（Number）を返す出力コネクタを設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 3. 平方根（ルート）ブロック（[A] の平方根）
// ==========================================
Blockly.Blocks["sqrt"] = {
  init: function () {
    // ルートの中身となる数値入力エリアを定義。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 日本語のテキスト「の平方根」を表示
    this.appendDummyInput().appendField("の平方根");

    // すべての要素を横一列に並べる設定
    this.setInputsInline(true);

    // 数値（Number）を返す出力コネクタを設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 4. 三角関数ブロック（[sin/cos/tan] [A]）
// ==========================================
Blockly.Blocks["trigonometry"] = {
  init: function () {
    // sin, cos, tan を切り替えるドロップダウンメニューを定義
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["sin", "SIN"], // 画面表示: sin , 内部値: SIN
        ["cos", "COS"], // 画面表示: cos , 内部値: COS
        ["tan", "TAN"], // 画面表示: tan , 内部値: TAN
      ]),
      "OP", // このドロップダウンの識別名
    );

    // 角度（または値）を入力するエリアを定義。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // すべての要素を横一列に並べる設定
    this.setInputsInline(true);

    // 数値（Number）を返す出力コネクタを設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 5. 関係式（比較）ブロック（[A] [= / < / > 等] [B]）
// ==========================================
Blockly.Blocks["Relation"] = {
  init: function () {
    // 左辺の数値入力エリアを定義。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 比較演算子を選択するドロップダウンメニューを定義
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["=", "EQ"], // 等号
        ["<", "LT"], // 小なり
        ["<=", "LTE"], // 以下
        [">", "GT"], // 大なり
        [">=", "GTE"], // 以上
      ]),
      "OP", // このドロップダウンの識別名
    );

    // 右辺の数値入力エリアを定義。数値のみ許可
    this.appendValueInput("B").setCheck("Number");

    // すべての要素を横一列に並べる設定
    this.setInputsInline(true);

    // このブロックは「条件式（方程式など）」として独立して扱うため、
    // 上下の結合凹凸やsetOutput（出力コネクタ）を持たない形状に設定（※Desmos等の数式生成用）
    this.setColour("#a8aa52"); // ブロックの色をくすんだ黄色に設定
  },
};

// ==========================================
// 6. X,Y変数ブロック（グラフ上の座標用変数「x」または「y」）
// ==========================================
Blockly.Blocks["XYVariable"] = {
  init: function () {
    // 座標の変数名「x」と「y」を切り替えるドロップダウンメニューを定義
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["x", "x"], // 画面表示: x , 内部値: x
        ["y", "y"], // 画面表示: y , 内部値: y
      ]),
      "OP", // このドロップダウンの識別名
    );

    // 要素を横一列に並べる設定
    this.setInputsInline(true);

    // 数値（Number）を返す出力コネクタを設定（数式ブロックに組み込めるようにする）
    this.setOutput(true, "Number");

    // ブロックの色を紫色に設定
    this.setColour("#a44a86");
  },
};
