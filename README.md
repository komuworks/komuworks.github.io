# komuworks.github.io

GitHub Pages 向けの静的サイトです（HTML/CSS/Vanilla JS）。

## サイト構成とファイル役割

- TOP（プロフィール）
  - `index.html`: サイトの入口ページ。
- ブログ
  - `blog/index.html`: 記事一覧ページ（タグ絞り込みUIを表示）。
  - `blog/post.html`: 記事詳細ページ（クエリ `?id=...` で対象記事を表示）。
  - `assets/js/blog.js`: `data/posts.json` を読み込み、一覧表示・詳細表示・タグ絞り込みを制御。
  - `data/posts.json`: ブログ記事データ本体。
- タイピング
  - `typing/index.html`: タイピング計測グラフ表示ページ。
  - `assets/js/typing.js`: 計測データJSONの読み込み、期間フィルタ、グラフ描画を制御。
  - `assets/data/typing-metrics.json`: タイピング計測データ本体。
- 共通
  - `assets/js/layout.js`: ヘッダー／フッターの共通描画。
  - `assets/css/style.css`: 全ページ共通スタイル。

## ブログ記事追加手順（`data/posts.json`）

1. `data/posts.json` を開き、配列の末尾に新しい記事オブジェクトを追加する。
2. 追加後、JSONのカンマ位置や配列構造が壊れていないことを確認する。
3. ページ表示時に `assets/js/blog.js` が日付降順で並び替え、`title` から自動でslug（URL用ID）を生成するため、slugの手動入力は不要。

### 必須フィールド

各記事は以下のフィールドを必ず持たせてください。

- `title`（文字列）: 記事タイトル
- `date`（文字列）: `YYYY-MM-DD` 形式の日付
- `tags`（文字列配列）: 1件以上のタグ
- `summary`（文字列）: 一覧に表示する要約
- `body`（文字列）: 本文（空行で段落区切り）

### 記事オブジェクト例

```json
{
  "title": "記事タイトル",
  "date": "2026-03-10",
  "tags": ["運用", "メモ"],
  "summary": "一覧用の短い説明文です。",
  "body": "1段落目\n\n2段落目"
}
```

## タイピング計測データの保存先とリセット手順

- 現行実装の計測データ保存先は `localStorage` ではなく `assets/data/typing-metrics.json` です。
- そのため `localStorage` キーは現状未使用（定義なし）です。

### リセット手順

- 計測データを完全リセットする場合: `assets/data/typing-metrics.json` を `[]`（空配列）にする。
- 特定日のみ削除する場合: 対象日のオブジェクトを削除して保存する。

## GitHub Pages で公開する手順

1. GitHub リポジトリの **Settings** を開く。
2. 左メニューの **Pages** を開く。
3. **Build and deployment** の **Source** で **Deploy from a branch** を選択する。
4. Branch を `main`（または公開対象ブランチ）/ `/ (root)` に設定して保存する。
5. 数分待って公開 URL にアクセスし、表示を確認する。

### 公開URL例

- リポジトリ名が `komuworks.github.io` の場合（ユーザーサイト）
  - `https://komuworks.github.io/`
- プロジェクトサイトの場合（例: `my-site`）
  - `https://<GitHubユーザー名>.github.io/my-site/`

### 更新反映の確認方法

1. 変更を `main` に push する。
2. GitHub の **Actions** タブ、または **Settings > Pages** でデプロイ完了を確認する。
3. 公開URLをハードリロード（Windows/Linux: `Ctrl + F5`, macOS: `Cmd + Shift + R`）して最新化を確認する。
4. 反映されない場合は数分待って再読込し、必要に応じてブラウザキャッシュを削除する。
