// ==========================================
// グラフ描画・更新処理 (Blockly ➔ Desmos)
// ==========================================

// app.js側から安全なタイミングで呼び出せるよう、全体を関数として定義します
window.initGraphUpdater = function(targetWorkspace) {
  if (!targetWorkspace) return;

  targetWorkspace.addChangeListener((event) => {
    // 【ガード句】スクロールやツールボックス開閉などのUI操作は、描画に影響しないため無視
    if (event.isUiEvent) return;
    
    // 【パフォーマンス対策】ユーザーがブロックをドラッグ移動している最中は
    // 描画処理をスキップし、手を離したタイミング（確定時）だけ更新して動作を軽くする
    if (event.type === Blockly.Events.BLOCK_MOVE && event.isDragging) return;

    // ワークスペース上にある、単独または結合された塊の「一番上のブロック」をすべて取得
    const topBlocks = targetWorkspace.getTopBlocks();

    // 【修正】Desmosの画面から登録された数式を一度リセット（削除されたブロックのグラフを画面から消すため）
    // ※ setBlank() を使うとズーム状態やアスペクト比まで完全初期化されてグラフが歪む原因になり、
    // また setExpressions([]) では古い式が消えず残り続けてしまうため、
    // ズームや縦横比の情報を完全に維持したまま、既存の数式だけをループで確実に一件ずつ削除します
    calculator.getExpressions().forEach((expr) => {
      calculator.removeExpression(expr);
    });

    // 各ブロックの塊（数式）を一つずつ処理
    topBlocks.forEach((block) => {
      let formula = "";
      
      try {
        // 拡張された window.latexGenerator を使ってブロックからLaTeX形式の数式を抽出
        const res = window.latexGenerator.blockToCode(block);
        
        // 【インデント修正】値ブロック（数字や変数など）は配列 [code, order] で返るため、数式文字列(0番目)を抽出
        if (Array.isArray(res)) {
          formula = res[0]; 
        } else {
          // Relationブロック（等式・不等式など）の場合は、文字列がそのまま返るのでそのまま代入
          formula = res;
        }
      } catch (e) {
        // ユーザーがブロックを組み立てている途中の、不完全な状態によるエラーはログに出してスルー
        console.error("LaTeX生成エラー:", e);
        return;
      }

      //数式が正常に抽出できていれば、余分なカッコを削る整形処理に入る
      if (formula) {
        formula = formula.trim();

        // 【最適化】不要なカッコを外すループの最大回数を、ブロックの「入れ子の深さ（高さ）」に設定
        // 最低1回は処理が走るように保証する
        // 【修正】block.getHeight() はエラーになるため、安全な固定上限値（10回）に変更して対策
        const maxLoops = 10; 
        
        let previousFormula;
        let loopCount = 0;
        
        do {
          // 処理前の文字列を記憶（置換前後で変化がなくなったらループを抜けるため）
          previousFormula = formula;
          
          // Desmosの命令語（\left( や \right)）として保護されていない、不要な単体カッコ ( ) を除去
          formula = formula.replace(/(?<!\\left)\(([^()]+)\)(?!\\right)/g, "$1");

          // 数式全体を囲んでいる最外殻のカッコ (例: "(x + 1)") があれば、それも両端1文字ずつ削る
          if (formula.startsWith("(") && formula.endsWith(")")) {
            formula = formula.substring(1, formula.length - 1).trim();
          }
          
          loopCount++;
        // 文字列に変化がある、かつブロックの入れ子レベルに達していない間だけ繰り返す（無限ループ防止）
        } while (formula !== previousFormula && loopCount < maxLoops); 
      }

      // 整形後の数式が空でなければ、Desmosへの登録判定へ
      if (formula && formula.trim() !== "") {
        
        // 【修正】数式自体に等号・不等号が含まれているか判定（y=5 などの定数関数も描画できるようにx, yチェックを緩和）
        const isRelation = /=|<|>|\\le|\\ge/.test(formula) || block.type === "Relation";
        
        // 一番外側のブロックが「Relation（等式・不等式）」以外（例：x+1 だけの式）なら、
        // グラフとして描画できるように頭に自動で「y =」を補完する
        if (!isRelation) {
          formula = `y = ${formula}`;
        }
        
        // 【バグ対策】Blocklyがブロックごとに割り振る一意の不変ID（block.id）を使用。
        // これにより、画面上でブロックを並び替えてもグラフの色が勝手に入れ替わらなくなる
        calculator.setExpression({
          id: `blockly_graph_${block.id}`,
          latex: formula,
        });
      }
    });
  });
};
