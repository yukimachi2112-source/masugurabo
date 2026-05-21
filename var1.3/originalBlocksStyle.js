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
// 3. 平方根（ルート）、絶対値などの特殊ブロック
// ==========================================
Blockly.Blocks["sqrt"] = {
  init: function () {
    // ルートの中身となる数値入力エリアを定義。数値のみ許可
    this.appendValueInput("A").setCheck("Number");
    // 日本語のテキスト「の」を表示
    this.appendDummyInput().appendField("の");

    // 日本語のテキスト「の正の平方根」を表示
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["正の平方根", "SQRT"], // 画面表示: 正の平方根 , 内部値: SQRT
        ["絶対値", "ABS"], // 画面表示: 絶対値 , 内部値: ABS
        ["逆数", "RECIPROCAL"], // 画面表示: 逆数 , 内部値: RECIPROCAL
      ]),
      "OP", // このドロップダウンの識別名（フィールド名）
    );
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

// ==========================================
// 7. 特殊な数学関数（床関数、天井関数、四捨五入）
// ==========================================
Blockly.Blocks["math_round_functions"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["切り上げ", "CEIL"],
        ["切り捨て", "FLOOR"],
        ["四捨五入", "ROUND"],
      ]),
      "OP",
    );
    this.appendValueInput("A").setCheck("Number");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour("#88dd88");
  },
};

// ==========================================
// 8. 対数関数ブロック
// ==========================================
Blockly.Blocks["logarithm"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["ln", "LN"], // 自然対数
        ["log10", "LOG10"], // 常用対数
      ]),
      "OP",
    );
    this.appendValueInput("A").setCheck("Number");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour("#88dd88");
  },
};

// ==========================================
// 9. 定数ブロック
// ==========================================
Blockly.Blocks["constant"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["π", "PI"], // 円周率
        ["e", "E"], // ネイピア数
      ]),
      "OP",
    );
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour("#a44a86");
  },
};

// ==========================================
// 10. 変数ブロック（定義）
// ==========================================
Blockly.Blocks["custom_variable_set"] = {
  init: function () {
    // 自由にタイピングできる変数名入力フィールド
    this.appendDummyInput()
      .appendField("変数")
      .appendField(new Blockly.FieldTextInput("a"), "VAR_NAME")
      .appendField("＝");

    // 右辺に接続する数値や数式の入力エリア
    this.appendValueInput("VALUE").setCheck("Number");

    // すべての要素を横一列に並べる設定
    this.setInputsInline(true);

    // 「Relation」ブロックと同じく独立した式（最外殻）にするため、
    // 上下の結合や setOutput は持たせない
    this.setColour("#a8aa52");
  },
};

// ==========================================
// 11. 変数ブロック（呼び出し）
// ==========================================
Blockly.Blocks["custom_variable"] = {
  init: function () {
    // ドロップダウンの選択肢をリアルタイムに生成する関数
    const dynamicOptions = function () {
      const options = [];
      const sourceBlock = this.getSourceBlock();
      const workspace = sourceBlock ? sourceBlock.workspace : null;

      if (workspace) {
        // ワークスペース上のすべてのブロックをスキャン
        const blocks = workspace.getAllBlocks(false);
        for (const block of blocks) {
          // 変数定義ブロック（custom_variable_set）を探す
          if (block.type === "custom_variable_set") {
            const varName = block.getFieldValue("VAR_NAME");
            // 空文字でなく、まだドロップダウンの選択肢に登録されていない名前なら追加
            if (varName && !options.some((opt) => opt[1] === varName)) {
              options.push([varName, varName]); // [画面表示名, 内部値]
            }
          }
        }
      }

      // 画面上に定義ブロックが1つもない場合のデフォルト表示
      if (options.length === 0) {
        options.push(["a", "a"]);
      }

      return options;
    };

    // 動的ドロップダウンをブロックにセット
    this.appendDummyInput()
      .appendField("変数")
      .appendField(new Blockly.FieldDropdown(dynamicOptions), "VAR_NAME");

    this.setInputsInline(true);
    this.setOutput(true, "Number"); // 数式ブロックに組み込めるようにする
    this.setColour("#a44a86"); // 変数用の紫色
  },
};
