# MORIO LP — Claude Code 引き継ぎ資料

## プロジェクト概要

株式会社MORIO（不動産プロデュース）のランディングページ。  
フルページスクロール型。フレームワークなし、バニラ HTML / CSS / JS のみ。

- **本番URL**: Netlify 自動デプロイ（GitHub `main` ブランチ push で即反映）
- **リポジトリ**: https://github.com/abe1143/morio-lp
- **公開ディレクトリ**: `morio/`（このフォルダ以下が公開される）

---

## フォルダ構成

```
morio/
├── index.html          # トップページ（フルページスクロール）
├── vision.html         # Vision サブページ
├── business.html       # Business サブページ
├── projects.html       # Projects サブページ（グリッドギャラリー）
├── producing.html      # Produce サブページ
├── company.html        # Company サブページ
├── css/
│   └── style.css       # 全スタイル（index.html 用）
├── js/
│   └── main.js         # スクロール・イントロ・BGM・sync処理
├── images/
│   └── projects/       # 物件写真（ext-01.jpg〜 / int-01.jpg〜）
├── audio/
│   └── bgm.mp3         # BGM
└── CLAUDE.md           # この引き継ぎ資料
```

---

## よくある更新作業

### 画像を差し替える
`images/projects/` 内の該当ファイルを同じファイル名で上書きするだけ。  
ファイル名を変える場合は `index.html` と `projects.html` の `src` も変更。

### テキストを変える
各 `.html` ファイルを直接編集。  
ブランドの基本フレーズ「Real Estate Producing — Tokyo」はそのまま残すこと。

### 新しいセクション（スライド）を追加する
1. `index.html` にスライドの HTML を追加（`class="slide sN"` の N を連番に）
2. `css/style.css` に必要なスタイルを追加
3. nav の `data-goto` の番号も更新

### BGM を変える
`audio/bgm.mp3` を差し替えるだけ。ファイル名は `bgm.mp3` を維持。

---

## デプロイ方法

更新したら Claude Code に「コミットしてプッシュして」と言うだけ。  
GitHub push → Netlify 自動デプロイ（約30秒）。

---

## 技術的な注意点（触るときに知っておくべきこと）

### イントロ → ヒーロー位置同期
`main.js` の `syncHero()` 関数が、イントロアニメーションとヒーローの各要素の位置を `getBoundingClientRect()` で実測して `translateY` で合わせている。  
**`slides[0].classList.add('active')` より前に `syncHero()` を呼ぶこと**（後だと CSS transition が干渉する）。

### ヒーローの slide-sub（Real Estate Producing — Tokyo）
`.s1 .slide-sub` は `opacity: 0; transition: none` で非表示スタート。  
イントロが完全に退場した後（`intro.remove()` のタイミング）に `.reveal` クラスを付けて表示する。  
イントロとの二重描画による「文字が細くなる」現象を防ぐため。

### スクロールシステム
- イージング: `easeOutCubic`（初動が速く、終わりが緩やか）
- 遷移時間: `1000ms`
- ホイールロック: `200ms`

### hero-line のアニメーション
`transform: scaleX()` ではなく `width: 0 → 100px` で伸ばす。  
JS の `translateY` sync と transform が競合するのを防ぐため。

### CSS バージョン管理
`style.css?v=XX` と `main.js?v=XX` のクエリパラメータでキャッシュバスティング。  
大きな変更をしたときは番号を上げる（現在 v=17）。

---

## ブランドガイドライン

| 項目 | 値 |
|---|---|
| フォント（見出し） | Cormorant Garamond |
| フォント（本文・UI） | Montserrat |
| ゴールド | `#b09060` |
| ホワイト | `#f5f2ee` |
| 背景 | `#0a0a0a` |
| トーン | 高級・静謐・タイムレス |

---

## 連絡先・外部サービス

- **Netlify**: abe1143 アカウントで管理
- **GitHub**: https://github.com/abe1143/morio-lp
- **メール**: info@morio-realestate.com
