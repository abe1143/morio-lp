# MORIO LP — Claude Code 引き継ぎ資料 v2

## プロジェクト概要

株式会社MORIO（不動産プロデュース）のランディングページ。  
フルページスクロール型トップ＋サブページ構成。フレームワークなし、バニラ HTML / CSS / JS のみ。

- **本番URL**: https://www.morio-realestate.com/
- **リポジトリ**: https://github.com/abe1143/morio-lp
- **公開ディレクトリ**: `morio/`（このフォルダ以下が公開される）
- **ホスティング**: Netlify Personal プラン（$9/月・帯域1TB）
- **デプロイ**: GitHub `main` ブランチ push → Netlify 自動デプロイ（約30秒）

---

## ページ構成

| ファイル | URL | 備考 |
|---|---|---|
| index.html | / | トップページ（フルページスクロール） |
| vision.html | /vision | Vision サブページ |
| design-philosophy.html | /design-philosophy | Design Philosophy サブページ |
| projects.html | /projects | Projects グリッドギャラリー |
| producing.html | /producing | Produce サブページ |
| the-stump.html | /the-stump | THE STUMP サブページ |
| company.html | /company | 会社概要 |
| business.html | — | ナビ非公開（ファイルは残存） |
| services.html | — | ナビ非公開（ファイルは残存） |

---

## フォルダ構成

```
morio/
├── index.html
├── vision.html
├── design-philosophy.html
├── projects.html
├── producing.html
├── the-stump.html
├── company.html
├── admin/
│   ├── index.html        # Decap CMS エントリーポイント
│   └── config.yml        # CMS フィールド定義
├── data/
│   ├── home.json         # トップページ テキストデータ
│   ├── vision.json
│   ├── philosophy.json
│   ├── producing.json
│   ├── the-stump.json
│   ├── projects.json
│   └── company.json
├── css/
│   └── style.css         # 全スタイル（index.html 用）
├── js/
│   └── main.js           # スクロール・イントロ・BGM・sync処理
├── images/
│   └── projects/         # 物件写真（ext-01.jpg〜 / int-01.jpg〜）
├── audio/
│   └── bgm.mp3
└── CLAUDE.md             # この引き継ぎ資料
```

---

## ナビゲーション構成（全ページ共通）

```html
<nav class="site-nav">
  <a href="index.html" class="nav-logo">MORIO</a>
  <div class="nav-links-sub">
    <a href="index.html">home</a>
    <a href="vision.html">vision</a>
    <a href="design-philosophy.html">philosophy</a>
    <a href="projects.html">projects</a>
    <a href="producing.html">produce</a>
    <a href="the-stump.html">the stump</a>
    <a href="company.html">company</a>
  </div>
</nav>
```

現在のページには `class="current"` を付ける。全7ページで統一済み。

---

## CMS（Decap CMS）

CEOがブラウザからテキストを直接編集できる仕組み。

| 項目 | 内容 |
|---|---|
| 管理画面URL | https://www.morio-realestate.com/admin/ |
| ログイン方法 | Googleアカウント（Netlify Identity経由） |
| 保存先 | GitHub の `morio/data/*.json` に自動コミット |
| デプロイ | 保存 → GitHub push → Netlify 自動デプロイ（約30秒〜2分） |

### CMSの仕組み
1. 管理画面で編集・保存
2. `morio/data/` 以下の JSON ファイルに書き込まれる
3. 各 HTML ページが `fetch('/data/xxx.json')` で読み込んで `innerHTML` に反映
4. GitHub にコミット履歴が残る（誰がいつ何を変えたか追跡可能）

### CMSで編集できる範囲
- 各ページのテキスト（見出し・本文・ラベル等）
- プロジェクト名・ステータス
- 会社概要の各項目

### ⚠️ CMS編集時の注意
`⚠️ HTMLタグを含みます` と表示されているフィールドには `<br>`（改行）や `<em>`（斜体）が含まれる。**タグは削除・変更しないこと。**

### CEOアカウントの追加方法
Netlify ダッシュボード → サイト選択 → Project configuration → Identity → Users → Invite users

---

## よくある更新作業

### 画像を差し替える
`images/projects/` 内の該当ファイルを同じファイル名で上書き。  
ファイル名を変える場合は `index.html`（ランダム配列）と `projects.html` の `src` も変更。

### テキストをCMSで変える
`/admin/` にアクセス → Googleログイン → 該当ページを選択して編集・保存。  
ブランドの基本フレーズ「Real Estate Producing — Tokyo」はそのまま残すこと。

### テキストをコードで直接変える
`morio/data/` 以下の JSON ファイルを編集してプッシュ。

### 新しいセクション（スライド）を追加する
1. `index.html` にスライドの HTML を追加（`class="slide sN"` の N を連番に）
2. `css/style.css` に必要なスタイルを追加
3. nav の `data-goto` の番号も更新

### BGM を変える
`audio/bgm.mp3` を差し替えるだけ。ファイル名は `bgm.mp3` を維持。

### デプロイする
```
コミットしてプッシュして
```
と Claude Code に言うだけ。

---

## 技術的な注意点

### ヒーロー画像ランダム表示（index.html）
トップページのヒーロー画像は `images/projects/` 内の18枚からランダム表示。  
`<img class="hero-img">` に src なし → 直後のインラインスクリプトで配列からランダム選択して代入。  
src を先に書くと画像が一瞬フラッシュするため、この順番を変えないこと。

### ナビサイズのちらつき防止
全ページの `html` に `scrollbar-gutter: stable` を設定済み。  
これを外すとページ遷移時にナビ幅がちらつく。

### ヒーロー画像アニメーション
```css
@keyframes heroZoom { from{transform:scale(1)} to{transform:scale(1.08)} }
.hero-img { animation: heroZoom 20s cubic-bezier(.22,1,.36,1) forwards }
```
ページを開いた瞬間から自動でゆっくりズームイン。

### イントロ → ヒーロー位置同期
`main.js` の `syncHero()` 関数が位置を `getBoundingClientRect()` で実測して `translateY` で合わせている。  
**`slides[0].classList.add('active')` より前に `syncHero()` を呼ぶこと**（後だと CSS transition が干渉する）。

### スクロールシステム
- イージング: `easeOutCubic`（初動が速く、終わりが緩やか）
- 遷移時間: `1000ms`
- ホイールロック: `200ms`

### CSS バージョン管理
`style.css?v=XX` と `main.js?v=XX` のクエリパラメータでキャッシュバスティング。  
大きな変更をしたときは番号を上げる（現在 v=17）。

---

## ブランドガイドライン

| 項目 | 値 |
|---|---|
| フォント（見出し） | Cormorant Garamond |
| フォント（本文） | Noto Serif JP |
| フォント（UI・ラベル） | Outfit |
| ゴールド | `#c9a96e` |
| ホワイト | `#f5f3f0` |
| クリーム | `#e8e4df` |
| 背景 | `#0a0a0a` |
| トーン | 高級・静謐・タイムレス |

---

## インフラ・外部サービス

| サービス | 用途 | アカウント |
|---|---|---|
| Netlify | ホスティング・自動デプロイ | abe1143 |
| GitHub | ソースコード管理 | abe1143/morio-lp |
| Netlify Identity | CMS認証（Googleログイン） | Netlify上で管理 |
| Decap CMS | テキスト編集UI | /admin/ |

### Netlifyプラン
- Personal $9/月
- 帯域：1TB/月（画像圧縮済みで実質余裕あり）
- ビルド：500分/月（1デプロイ約1〜2分）

---

## リスク管理

| リスク | 対策 |
|---|---|
| CMSとローカルの編集競合 | CEOがCMS編集中はpushしない |
| CMSでHTMLタグを誤削除 | フィールドに警告ヒント表示済み |
| 帯域超過 | 1TBプランで当面不要・Netlifyダッシュボードで確認可能 |
| 誤ったデプロイ | GitHubの履歴から任意のコミットに戻せる |
