const javascriptGenerator = Blockly.JavaScript;

//四則演算
Blockly.Blocks["math_operator"] = {
  init: function () {
    this.appendValueInput("A").setCheck("Number");

    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["+", "ADD"],
        ["−", "MINUS"],
        ["×", "MULT"],
        ["÷", "DIV"],
      ]),
      "OP",
    );

    this.appendValueInput("B").setCheck("Number");

    this.setInputsInline(true);

    this.setOutput(true, "Number");

    this.setColour("#88dd88");
  },
};

//べき乗
Blockly.Blocks["power"] = {
  init: function () {
    this.appendValueInput("A").setCheck("Number");

    this.appendDummyInput().appendField("の");

    this.appendValueInput("B").setCheck("Number");

    this.appendDummyInput().appendField("乗");

    this.setInputsInline(true);

    this.setOutput(true, "Number");

    this.setColour("#88dd88");
  },
};

//平方根
Blockly.Blocks["sqrt"] = {
  init: function () {
    this.appendValueInput("A").setCheck("Number");

    this.appendDummyInput().appendField("の平方根");

    this.setInputsInline(true);

    this.setOutput(true, "Number");

    this.setColour("#88dd88");
  },
};

//三角関数
Blockly.Blocks["trigonometry"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["sin", "SIN"],
        ["cos", "COS"],
        ["tan", "TAN"],
      ]),
      "OP",
    );
    this.appendValueInput("A").setCheck("Number");

    this.setInputsInline(true);

    this.setOutput(true, "Number");

    this.setColour("#88dd88");
  },
};

//関係式
Blockly.Blocks["Relation"] = {
  init: function () {
    this.appendValueInput("A").setCheck("Number");

    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["=", "EQ"],
        ["<", "LT"],
        ["<=", "LTE"],
        [">", "GT"],
        [">=", "GTE"],
      ]),
      "OP",
    );
    this.appendValueInput("B").setCheck("Number");

    this.setInputsInline(true);

    this.setColour("#a8aa52");
  },
};

//X,Y変数
Blockly.Blocks["XYVariable"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["x", "x"],
        ["y", "y"],
      ]),
      "OP",
    );

    this.setInputsInline(true);

    this.setOutput(true, "Number");

    this.setColour("#a44a86");
  },
};
