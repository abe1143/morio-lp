# MORIO LP — Claude Code 引き継ぎ資料 v3

## プロジェクト概要

株式会社MORIO（不動産プロデュース）のランディングページ。  
スクロール型ロングページ（index.html）+ THE STUMP 特設ページ（the-stump.html）の2ページ構成。フレームワークなし、バニラ HTML / CSS / JS のみ。

- **本番URL**: https://www.morio-realestate.com/
- **リポジトリ**: https://github.com/abe1143/morio-lp
- **公開ディレクトリ**: `morio/`（このフォルダ以下が公開される）
- **ホスティング**: Netlify Personal プラン（$9/月・帯域1TB）
- **デプロイ**: GitHub `main` ブランチ push → Netlify 自動デプロイ（約30秒）

---

## ページ構成

| ファイル | URL | 備考 |
|---|---|---|
| index.html | / | トップページ（ロングスクロール） |
| the-stump.html | /the-stump | THE STUMP 特設ページ |

---

## フォルダ構成

```
morio/
├── index.html
├── the-stump.html
├── admin/
│   ├── index.html        # Decap CMS エントリーポイント
│   └── config.yml        # CMS フィールド定義
├── data/
│   ├── home.json         # index.html テキストデータ
│   └── the-stump.json    # the-stump.html テキストデータ
├── assets/
│   ├── morio.css         # メインスタイルシート
│   ├── morio.js          # メインJS（ナビ・パララックス・アニメーション）
│   ├── motion.css        # モーション制御CSS
│   ├── motion.js         # スクロール出現アニメーションJS
│   ├── audio/
│   │   └── morio-theme.mp3   # BGM
│   └── img/                  # 全画像
│       ├── v2-facade.jpg
│       ├── v2-suite.jpg
│       ├── tower.jpg
│       ├── v2-arches.jpg
│       ├── interior-gallery.png
│       ├── interior-living.jpg
│       ├── devils-tower.png
│       ├── producer-bw.jpg
│       ├── pyramid-giza.png
│       ├── notredame.png
│       └── temple-kiyomizu.png
└── CLAUDE.md             # この引き継ぎ資料
```

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
2. `morio/data/home.json` または `morio/data/the-stump.json` に書き込まれる
3. 各 HTML ページが `fetch('/data/xxx.json')` で読み込んで `data-cms-text` / `data-cms-html` 属性を持つ要素に反映
4. GitHub にコミット履歴が残る

### CMSで編集できる範囲（index.html）
- ヒーロー タグライン・見出し
- ステートメント本文
- セクション01・02 本文
- 6つのケイパビリティ（英語名・日本語名・説明）
- 実績3項目（数値・ラベル・説明）
- プロデューサー 引用・本文・名前・肩書き
- 会社概要 全項目（住所・連絡先等）
- フッター CTA 見出し

### CMSで編集できる範囲（the-stump.html）
- エピグラフ
- セクション01〜07 ラベル・見出し・本文
- パトロンフレーム
- フィナーレ 本文・サブテキスト
- CTA ラベル・ボタン・注記

### ⚠️ CMS編集時の注意
`⚠️ HTMLタグを含みます` と表示されているフィールドには `<br>`（改行）や `<em>`（斜体）が含まれる。**タグは削除・変更しないこと。**

---

## よくある更新作業

### テキストをCMSで変える
`/admin/` にアクセス → Googleログイン → 該当ページを選択して編集・保存。

### テキストをコードで直接変える
`morio/data/home.json` または `morio/data/the-stump.json` を編集してプッシュ。

### 画像を差し替える
`assets/img/` 内の該当ファイルを同じファイル名で上書き。

### BGM を変える
`assets/audio/morio-theme.mp3` を差し替えるだけ。ファイル名は `morio-theme.mp3` を維持。

### デプロイする
```
コミットしてプッシュして
```
と Claude Code に言うだけ。

---

## ブランドガイドライン

| 項目 | 値 |
|---|---|
| フォント（見出し） | Cormorant Garamond |
| フォント（本文） | Noto Serif JP |
| フォント（UI・ラベル） | Jost / Outfit |
| ゴールド | `#c2a25f` / `#c9a96e` |
| クリーム | `#ece7dd` |
| 背景 | `#0b0b0c` |
| トーン | 高級・静謐・タイムレス |

---

## インフラ・外部サービス

| サービス | 用途 | アカウント |
|---|---|---|
| Netlify | ホスティング・自動デプロイ | abe1143 |
| GitHub | ソースコード管理 | abe1143/morio-lp |
| Netlify Identity | CMS認証（Googleログイン） | Netlify上で管理 |
| Decap CMS | テキスト編集UI | /admin/ |
| Xサーバー | ドメイン（www.morio-realestate.com）管理 | — |
