// ==========================================
// 1. グラフ描画・同期更新処理（Blockly から Desmos API への橋渡し）
// ==========================================
// 引数として渡されたBlocklyワークスペースの変更を監視し、リアルタイムにDesmosへと数式を送り込む関数
window.initGraphUpdater = function (targetWorkspace) {
  // ワークスペースのインスタンスが正常に存在しない場合は、以降の処理を行わず安全に終了
  if (!targetWorkspace) return;

  // ワークスペースに対してイベントリスナーを登録。ブロックの配置、移動、削除、値の変更などのタイミングで発火
  targetWorkspace.addChangeListener((event) => {
    // 【UIイベントの排除】
    // スクロール、ツリーの展開、ツールボックスの開閉など、数式の構造に影響しないUIの変更イベントはすべて無視
    if (event.isUiEvent) return;

    // 【パフォーマンス対策】
    // ユーザーがブロックを掴んでドラッグ移動させている最中は、1フレームごとに無駄な描画更新が走り負荷が
    // 高くなるため、ドラッグが完了してマウスが離されるまで一時的にコード生成とグラフ更新処理をスキップ
    if (event.type === Blockly.Events.BLOCK_MOVE && event.isDragging) return;

    // ワークスペースのルート（親ブロックを持たない、一番上に独立して置かれているブロック群）をすべて取得
    const topBlocks = targetWorkspace.getTopBlocks();

    // 【差分更新用セット】現在ワークスペース上に生き残っているトップブロックのDesmos式IDを記録するための器
    const currentTopBlockIds = new Set();

    // 取得したトップブロックの塊（数式ごとの独立した集まり）を、上から順にループ処理
    topBlocks.forEach((block) => {
      // 各ブロックの塊に対して、BlocklyのユニークなブロックIDを流用した「Desmos専用の識別子（ID）」を生成
      const desmosId = `blockly_graph_${block.id}`;
      // このIDを「現在生存しているブロック」としてセットに記録（後で削除された古い式を見つけるために使用）
      currentTopBlockIds.add(desmosId);

      let formula = "";
      try {
        // 先ほど定義した独自のLaTeXジェネレーターを呼び出し、対象ブロックとその子孫からLaTeX文字列を再帰的に生成
        const res = window.latexGenerator.blockToCode(block);

        // ジェネレーターが配列 [コード, 優先順位] を返した場合はコード（インデックス0）を抽出し、
        // 最外殻のように文字列単体で返した場合はそのまま代入する
        formula = Array.isArray(res) ? res[0] : res;
      } catch (e) {
        // 万が一、コード生成の途中で例外エラーが発生した場合はコンソールにエラーを出力し、このブロックの処理をスキップ
        console.error("LaTeX生成エラー:", e);
        return;
      }

      // ==========================================
      // 2. カッコの自動クレンジング・整形処理
      // ==========================================
      // Blocklyの生成仕様上、深くネストされた数式の前後に、人間やDesmosにとって不要な丸カッコ ( ) が
      // 過剰に付与される問題があるため、正規表現を用いてこれらのゴミを取り除く
      if (formula) {
        formula = formula.trim();
        const maxLoops = 25; // 無限ループに陥るのを防ぐためのセーフティ回数上限
        let previousFormula;
        let loopCount = 0;

        // 数式に変化が見られなくなるまで、最大10回繰り返しカッコを剥ぎ取る
        do {
          previousFormula = formula;

          // 三角関数などの正規の \left( \right) ではない、単純に式を囲っているだけの不要な丸カッコを正規表現で消去
          formula = formula.replace(
            /(?<!\\left)\(([^()]+)\)(?!\\right)/g,
            "$1",
          );

          // 式全体の最外殻が "(" で始まり ")" で終わっている場合、その両端の丸カッコを強制カット
          if (formula.startsWith("(") && formula.endsWith(")")) {
            formula = formula.substring(1, formula.length - 1).trim();
          }
          loopCount++;
        } while (formula !== previousFormula && loopCount < maxLoops);

        // --- 定義域まわりの丸カッコ徹底掃除ロジック ---
        // Desmos APIは定義域の中括弧 { } の内部や前後に丸カッコが少しでも残っていると、
        // 構文エラーと見なしてグラフ全体を画面から非表示にする極めて厳格な仕様（制約）があるため、個別にクレンジングを行う。

        // ① `{ ... }` の「内部」に入り込んでしまった不要な丸カッコ `( )` を完全に消去（例: { (x > 0) } を { x > 0 } へ）
        formula = formula.replace(/\{[^}]+\}/g, (match) =>
          match.replace(/[()]/g, ""),
        );

        // ② `{ ... }` の「直前」に自動付与されてしまった丸カッコを消去（例: (x){ x > 0 } を x{ x > 0 } へ）
        formula = formula.replace(/\(([^()]+)\)\s*\{/g, "$1{");

        // ③ 数式全体が `({ ... })` のように、定義域ごと大きな丸カッコに誤って包まれてしまった場合、冒頭の "(" を強制排除
        if (formula.startsWith("(") && formula.endsWith("}")) {
          formula = formula.substring(1).trim();
        }
      }

      // ==========================================
      // 3. Desmos への送信・上書き登録
      // ==========================================
      // 整形後の数式が空文字でないことを確認して、Desmosの電卓エンジンに受け渡す
      if (formula && formula.trim() !== "") {
        // 【重要：自動 y= 補完の判定制御】
        // 単に「x + 2」のような数式ブロックだけがポツンと置かれた場合、Desmosにそのまま投げてもグラフが描画されない。
        // そのため、頭に自動で「y = 」を補完する必要がある。
        // ただし、式自体がすでに等号・不等号を含んでいる関係式である場合、あるいは定義域ブロックが結合されて
        // すでに中括弧 `{` を含んでいる場合は、補完を行うと「y = y = x」や「y = x < 5」のような二重構文エラーを
        // 起こしてしまう。これを防ぐため、文字パターンおよびブロックタイプから「すでに式（Relation）であるか」を厳密に判定。
        const isRelation =
          /=|\\lt|\\gt|\\le|\\ge|\{/.test(formula) ||
          block.type === "Relation" ||
          block.type === "Relation_Range";

        // 関係式ではない（ただの数値や多項式である）場合のみ、頭に「y = 」を自動付加
        if (!isRelation) {
          formula = `y = ${formula}`;
        }

        // デバッグ確認用：すべての整形と補完が完了した、最終的な送信形LaTeXをブラウザのコンソールに出力
        console.log("Desmosに送信される最終LaTeX:", formula);

        // Desmos APIのメソッドを実行。
        // すでに同一の id が存在する場合は、その行の数式だけが「差分上書き（アップデート）」され、
        // 新しいブロックが追加された場合は、新しい行としてグラフ上に「新規描画」される。
        calculator.setExpression({
          id: desmosId,
          latex: formula,
        });
      }
    });

    // ==========================================
    // 4. ゴミ箱（削除）対応の差分クリーンアップ処理
    // ==========================================
    // ユーザーがブロックをゴミ箱に捨てた、あるいは別のブロックの下にくっつけたことで、
    // 「一番上のブロック（トップブロック）」ではなくなった数式データを、Desmosの画面上から消去する処理。
    calculator.getExpressions().forEach((expr) => {
      // ユーザーが手動で作成したスライダーや、別拡張機能が生成した数式を巻き添えで消してしまわないよう、
      // このプログラムが自動発行したプレフィックス（blockly_graph_）で始まるIDのみを安全に対象とする。
      // さらに、「現在ワークスペース上に生き残っているセット（currentTopBlockIds）」の中に含まれていないIDを発見した場合、
      // それは「削除された数式」であると確定し、Desmosエンジンから完全撤去する。
      if (
        expr.id.startsWith("blockly_graph_") &&
        !currentTopBlockIds.has(expr.id)
      ) {
        calculator.removeExpression(expr);
      }
    });
  });
};
