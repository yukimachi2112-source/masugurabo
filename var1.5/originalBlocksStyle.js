// ==========================================
// 1. 四則演算ブロック
// ==========================================
// [A] [+] [B] のように、2つの数値の間に演算子を挟むブロック
Blockly.Blocks["math_operator"] = {
  init: function () {
    // 左辺（1つ目）の数値入力エリアを定義。数値（Number）型のみ結合可能
    this.appendValueInput("A").setCheck("Number");

    // 四則演算の記号を選択するドロップダウンメニューを中央に配置
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["+", "ADD"], // 画面表示: +  , 内部値: ADD
        ["−", "MINUS"], // 画面表示: −  , 内部値: MINUS
        ["×", "MULT"], // 画面表示: ×  , 内部値: MULT
        ["÷", "DIV"], // 画面表示: ÷  , 内部値: DIV
      ]),
      "OP", // プログラムから選択値を取得するためのフィールド識別名
    );

    // 右辺（2つ目）の数値入力エリアを定義。数値（Number）型のみ結合可能
    this.appendValueInput("B").setCheck("Number");

    // 入力スロットやドロップダウンを折り返さず、横一列に並べる
    this.setInputsInline(true);

    // ブロックの左側に突起（出力コネクタ）をつけ、数値（Number）を返すブロックとして定義
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 2. べき乗（累乗）ブロック
// ==========================================
// [底] の [指数] 乗 を表現するブロック
Blockly.Blocks["power"] = {
  init: function () {
    // 底（ベースとなる数）の入力エリア。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 画面上に日本語の助詞「の」のテキストを表示
    this.appendDummyInput().appendField("の");

    // 指数（何乗するか）の入力エリア。数値のみ許可
    this.appendValueInput("B").setCheck("Number");

    // 画面上に結びの「乗」のテキストを表示
    this.appendDummyInput().appendField("乗");

    // すべての要素を横一列に綺麗に並べる
    this.setInputsInline(true);

    // 計算結果として数値（Number）を返すための出力コネクタを設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 3. 平方根、絶対値、逆数ブロック
// ==========================================
// 1つの入力に対して、ルートや絶対値などの特殊な数学演算を適用するブロック
Blockly.Blocks["sqrt"] = {
  init: function () {
    // 計算対象となる数値を入力するエリア。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 日本語の接続テキスト「の」を表示
    this.appendDummyInput().appendField("の");

    // 適用する演算の種類を切り替えるドロップダウンメニューを配置
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["正の平方根", "SQRT"], // 画面表示: 正の平方根 , 内部値: SQRT
        ["絶対値", "ABS"], // 画面表示: 絶対値     , 内部値: ABS
        ["逆数", "RECIPROCAL"], // 画面表示: 逆数       , 内部値: RECIPROCAL
      ]),
      "OP", // フィールド識別名
    );

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 計算結果として数値（Number）を返す出力コネクタを設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 4. 三角関数ブロック
// ==========================================
// sin, cos, tan などの三角関数を適用するブロック
Blockly.Blocks["trigonometry"] = {
  init: function () {
    // 関数名を選択するドロップダウンメニューを配置
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["sin", "SIN"], // 内部値: SIN
        ["cos", "COS"], // 内部値: COS
        ["tan", "TAN"], // 内部値: TAN
      ]),
      "OP", // フィールド識別名
    );

    // 角度や値を入力するエリア。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 数値（Number）を返す出力コネクタを設定
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 5. 関係式（比較）ブロック
// ==========================================
// [左辺] [＝ / ＜ / ＞ 等] [右辺] の関係を表す独立した式を構築するブロック
Blockly.Blocks["Relation"] = {
  init: function () {
    // 左辺の入力エリア。数値のみ許可
    this.appendValueInput("A").setCheck("Number");

    // 比較演算子（等号・不等号）を選択するドロップダウン
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["=", "EQ"], // 等しい
        ["<", "LT"], // 未満
        ["<=", "LTE"], // 以下
        [">", "GT"], // 超える
        [">=", "GTE"], // 以上
      ]),
      "OP", // フィールド識別名
    );

    // 右辺の入力エリア。数値のみ許可
    this.appendValueInput("B").setCheck("Number");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // このブロックは数式（方程式・不等式）の「最外殻（完成形）」として単体で存在させるため、
    // 他のブロックに差し込むための出力（setOutput）や、縦に繋げるための接続口を持たせない
    this.setColour("#a8aa52"); // ブロックの色をくすんだ黄色に設定
  },
};

// ==========================================
// 6. X,Y変数ブロック
// ==========================================
// グラフの2次元座標系で用いる変数「x」および「y」を出力するブロック
Blockly.Blocks["XYVariable"] = {
  init: function () {
    // 変数名「x」と「y」を切り替えるドロップダウン
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["x", "x"], // 画面表示: x , 内部値: x
        ["y", "y"], // 画面表示: y , 内部値: y
      ]),
      "OP", // フィールド識別名
    );

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 数式の中に変数として組み込めるよう、数値（Number）型としての出力を許可
    this.setOutput(true, "Number");

    // ブロックの色を独自の紫色に設定
    this.setColour("#a44a86");
  },
};

// ==========================================
// 7. 特殊な数学関数（切り上げ、切り捨て、四捨五入）
// ==========================================
// ガウス記号（床関数・天井関数）に近い丸め処理を施すブロック
Blockly.Blocks["math_round_functions"] = {
  init: function () {
    // 丸め処理のアルゴリズムを選択するドロップダウン
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["切り上げ", "CEIL"], // 天井関数
        ["切り捨て", "FLOOR"], // 床関数
        ["四捨五入", "ROUND"], // 四捨五入
      ]),
      "OP", // フィールド識別名
    );

    // 対象となる数値の入力エリア
    this.appendValueInput("A").setCheck("Number");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 計算後の数値を返すため出力を許可
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 8. 対数関数ブロック
// ==========================================
// 自然対数（ln）および常用対数（log10）を定義するブロック
Blockly.Blocks["logarithm"] = {
  init: function () {
    // 対数の底（種類）を選択するドロップダウン
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["ln", "LN"], // 自然対数（底 e）
        ["log10", "LOG10"], // 常用対数（底 10）
      ]),
      "OP", // フィールド識別名
    );

    // 真数（対数の中身）を入力するエリア
    this.appendValueInput("A").setCheck("Number");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 数値（Number）型の出力を許可
    this.setOutput(true, "Number");

    // ブロックの色を薄い緑色に設定
    this.setColour("#88dd88");
  },
};

// ==========================================
// 9. 定数ブロック
// ==========================================
// 数学で頻繁に使用される主要な定数（円周率、ネイピア数）を出力するブロック
Blockly.Blocks["constant"] = {
  init: function () {
    // 定数の種類を選択するドロップダウン
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["π", "PI"], // 円周率 pi
        ["e", "E"], // 自然対数の底 e
      ]),
      "OP", // フィールド識別名
    );

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 数式にそのまま埋め込めるよう、数値（Number）型の出力を許可
    this.setOutput(true, "Number");

    // ブロックの色を定数・変数用の紫色に設定
    this.setColour("#a44a86");
  },
};

// ==========================================
// 10. 変数ブロック（定義用）
// ==========================================
// 任意の変数名（a, t など）に対して、右辺の値を代入・固定する最外殻ブロック
Blockly.Blocks["custom_variable_set"] = {
  init: function () {
    // 自由に入力可能なテキストフィールドで変数名を指定
    this.appendDummyInput()
      .appendField("変数")
      .appendField(new Blockly.FieldTextInput("a"), "VAR_NAME") // デフォルトは "a"
      .appendField("＝");

    // 代入する値（右辺）を入力するエリア。数値のみ許可
    this.appendValueInput("VALUE").setCheck("Number");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 独立した定義式（方程式）として扱うため、setOutput や上下の結合は持たせない
    this.setColour("#a8aa52"); // 関係式と同じくくすんだ黄色に設定
  },
};

// ==========================================
// 11. 変数ブロック（呼び出し用）
// ==========================================
// 定義ブロック（custom_variable_set）で作成された変数を、数式内で再利用するためのブロック
Blockly.Blocks["custom_variable"] = {
  init: function () {
    // ワークスペース上の変数定義をスキャンしてドロップダウンの選択肢を動的に生成する関数
    const dynamicOptions = function () {
      const options = [];
      const sourceBlock = this.getSourceBlock();
      const workspace = sourceBlock ? sourceBlock.workspace : null;

      if (workspace) {
        // ワークスペース上に存在するすべてのブロックを配列として取得
        const blocks = workspace.getAllBlocks(false);
        for (const block of blocks) {
          // 変数定義ブロック（custom_variable_set）のみを抽出
          if (block.type === "custom_variable_set") {
            const varName = block.getFieldValue("VAR_NAME");
            // 定義名が空でなく、かつドロップダウンリストにまだ重複がない場合のみ追加
            if (varName && !options.some((opt) => opt[1] === varName)) {
              options.push([varName, varName]); // [画面に表示する名前, プログラムが受け取る内部値]
            }
          }
        }
      }
      // 画面に変数の定義が1つも存在しない場合のフォールバック（デフォルト値）
      if (options.length === 0) {
        options.push(["a", "a"]);
      }
      return options;
    };

    // 動的に生成された選択肢を持つドロップダウンを配置
    this.appendDummyInput()
      .appendField("変数")
      .appendField(new Blockly.FieldDropdown(dynamicOptions), "VAR_NAME");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 数式の中に組み込めるよう、数値（Number）型としての出力を許可
    this.setOutput(true, "Number");

    // ブロックの色を変数用の紫色に設定
    this.setColour("#a44a86");
  },
};

// ==========================================
// 12. 関係式（比較）ブロック（定義域付き）
// ==========================================
// [左辺] [関係演算子] [右辺] に対して、特定の変数の「変域（範囲制限）」をドッキングできる最外殻ブロック
Blockly.Blocks["Relation_Range"] = {
  init: function () {
    // 主となる数式の左辺の入力エリア
    this.appendValueInput("A").setCheck("Number");

    // 主となる数式の比較演算子（等号・不等号）を選択するドロップダウン
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["=", "EQ"], // 等しい
        ["<", "LT"], // 未満
        ["<=", "LTE"], // 以下
        [">", "GT"], // 超える
        [">=", "GTE"], // 以上
      ]),
      "OP", // フィールド識別名
    );

    // 主となる数式の右辺の入力エリア
    this.appendValueInput("B").setCheck("Number");

    // 定義域ブロックを繋げるためのガイドテキストを配置
    this.appendDummyInput().appendField("  ただし、");

    // 定義域（変域）パーツ専用の結合口。接続できるのは Range 型を出力するブロックのみ
    this.appendValueInput("RANGE").setCheck("Range");

    // 文末のガイドテキストを表示
    this.appendDummyInput().appendField("の範囲");

    // すべての要素を横一列に一直線に並べる
    this.setInputsInline(true);

    // このブロック自体が完結した1本のグラフ（数式）となるため、上下左右の結合口や出力は持たない
    this.setColour("#a8aa52"); // ブロックの色をくすんだ黄色に設定
  },
};

// ==========================================
// 13. 関係式（比較）ブロック（定義域用パーツ）
// ==========================================
// 定義域付きブロックの「RANGE」スロットに差し込んで使用する、範囲制限専用の条件式ブロック
Blockly.Blocks["range"] = {
  init: function () {
    // 範囲制限の左辺（例: 0）を入力するエリア
    this.appendValueInput("A").setCheck("Number");

    // 範囲制限に用いる不等号を選択するドロップダウン（定義域に等号単体は使用しないため除外）
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["<", "LT"], // 未満
        ["<=", "LTE"], // 以下
        [">", "GT"], // 超える
        [">=", "GTE"], // 以上
      ]),
      "OP", // フィールド識別名
    );

    // 範囲制限の右辺（例: x）を入力するエリア
    this.appendValueInput("B").setCheck("Number");

    // 要素を横一列に並べる
    this.setInputsInline(true);

    // 定義域入力スロットにのみ結合を制限するため、独自の「Range」型を出力として定義
    this.setOutput(true, "Range");

    // 関係式グループに属するため、色をくすんだ黄色に設定
    this.setColour("#a8aa52");
  },
};
