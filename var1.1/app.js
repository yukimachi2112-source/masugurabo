// --- Blocklyの初期化オプションを画面の向き（縦・横）に応じて動的に生成する関数 ---
function getBlocklyOptions() {
  // 縦画面（ポートレート）と判定する条件：
  // 画面の横幅が767px以下、または、画面の高さが横幅よりも大きい場合
  const isPortrait =
    window.innerWidth <= 767 || window.innerHeight > window.innerWidth;

  return {
    // HTML側で定義されているツールボックス（カテゴリメニュー）のDOM要素を指定
    toolbox: document.getElementById("toolbox"),

    // Blocklyのレンダラー（見た目のテーマ）にScratch風の「zelos」を採用
    renderer: "zelos",

    // 【重要】縦画面と判定された場合は「横一列レイアウト（horizontalLayout: true）」を有効化
    horizontalLayout: isPortrait,

    // 【重要】縦画面なら画面の「下部（bottom）」に、横画面なら画面の「左側（start）」にツールボックスを配置
    toolboxPosition: isPortrait ? "bottom" : "start",

    // ワークスペースのズーム（拡大・縮小）に関する設定
    zoom: {
      controls: true, // 画面上に拡大・縮小・リセット用のボタンを表示する
      wheel: true, // マウスホイールによるズーム操作を許可する
      startScale: 1.0, // 初期表示時の拡大率（100%）
      maxScale: 3, // 最大拡大率（300%）
      minScale: 0.3, // 最大縮小率（30%）
    },

    // ワークスペースの移動・スクロールに関する設定
    move: {
      scrollbars: true, // スクロールバーを表示する
      drag: true, // 背景をドラッグしてワークスペースを動かせるようにする
      wheel: true, // マウスホイールでのスクロール（移動）を許可する
    },
  };
}

// --- 1. 初回のBlockly初期化 ---
// アプリ起動時の画面の向きに合わせた設定（options）を取得し、#blocklyDivにBlocklyを埋め込む
let workspace = Blockly.inject("blocklyDiv", getBlocklyOptions());

// --- 2. Desmosグラフの初期化 ---
// グラフを表示するためのコンテナ要素を取得
const elt = document.getElementById("graphDiv");

// Desmosのグラフ計算機（GraphingCalculator）を初期化して起動
const calculator = Desmos.GraphingCalculator(elt, {
  expressions: false, // 数式入力用の左側サイドバーを非表示にする
  keypad: false, // 画面下部の専用ソフトキーパッドを非表示にする
});

// --- 3. 画面サイズ・向きが変更（リサイズ）されたときの処理 ---
let resizeTimeout; // デバウンス（連続実行の抑制）用のタイマーIDを保持する変数

window.addEventListener("resize", () => {
  // ① 画面サイズが変わるたび、Desmosグラフの描画エリアを新しいサイズに追従させる
  calculator.resize();

  // ② Blocklyのレイアウト切り替え処理
  // スマホの画面回転やブラウザ幅のドラッグ中など、高頻度でBlocklyが破棄・再生成されるのを防ぐための制御
  clearTimeout(resizeTimeout); // 動いている最中の古いタイマーをキャンセル

  // サイズ変更が完全に止まってから0.2秒（200ミリ秒）後に1回だけ実行する
  resizeTimeout = setTimeout(() => {
    if (workspace) {
      // ユーザーが現在ワークスペース上に配置・作成しているブロック群を、一時的にXML（DOM）形式としてバックアップ
      const xml = Blockly.Xml.workspaceToDom(workspace);

      // 現在稼働しているBlocklyのインスタンスとメモリを一度きれいに破棄する
      workspace.dispose();

      // リサイズ後の最新の画面の向き（縦・横）に応じた設定を再計算し、Blocklyを新しく埋め込む
      workspace = Blockly.inject("blocklyDiv", getBlocklyOptions());

      // 退避させておいたバックアップ用のXMLから、ブロック群を新しいワークスペース上に寸分の狂いなく復元
      Blockly.Xml.domToWorkspace(xml, workspace);
    }
  }, 200); // 実行を遅延させる時間（ミリ秒）
});
