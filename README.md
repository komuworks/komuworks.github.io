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
  - `typing/index.html`: タイピング計測グラフ表示ページ（クリックで詳細へ遷移）。
  - `typing/detail.html`: 日別のタイピング詳細表示ページ。
  - `assets/js/typing.js`: 計測データJSONの読み込み、期間フィルタ、グラフ描画、詳細ページ遷移を制御。
  - `assets/js/typing-detail.js`: 指定日の詳細データ表示（率/WPM/KPM算出）を制御。
  - `assets/data/typing-metrics.json`: タイピング計測データ本体（計測時間と履歴）。
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


### 文字列描画時の注意（HTMLタグを含む場合）

- `assets/js/blog.js` では、記事タイトル・要約・タグ・本文を `textContent` ベースで描画しています。
- そのため `data/posts.json` の各文字列に `<b>`, `<script>` などのHTMLタグが含まれていても、タグとして解釈されず文字列のまま表示されます。

## タイピング期間フィルタの仕様

- `typing/index.html` の「直近7日 / 30日 / 90日」は **現在日付（当日0:00）** を基準に絞り込みます。
- 例: 「直近7日」は「本日を含む過去7日間」のデータを表示します。
- 選択期間内に該当データがない場合は、画面上に「現在日付基準で対象なし」のステータスを表示します。

## タイピング計測データの保存先とリセット手順

- 現行実装の計測データ保存先は `localStorage` ではなく `assets/data/typing-metrics.json` です。
- そのため `localStorage` キーは現状未使用（定義なし）です。

### リセット手順

- 計測データを完全リセットする場合: `assets/data/typing-metrics.json` の `history` を `[]`（空配列）にする。
- 特定日のみ削除する場合: 対象日のオブジェクトを削除して保存する。

### データ形式

`assets/data/typing-metrics.json` は以下の形式です。

```json
{
  "sessionMinutes": 5,
  "history": [
    {
      "date": "2026-03-10",
      "totalChars": 858,
      "correctChars": 1440,
      "errorChars": 64
    }
  ]
}
```

- `sessionMinutes`: 1回あたりの計測時間（分）。WPM/KPM算出に使用。
- `history[]`: 日別の計測結果。

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

## プロフィールTOPのデータ運用方法

プロフィールTOPは `data/profile.json` を編集することで内容を更新できます。`index.html` はデータ表示枠のみ持ち、描画は `assets/js/profile.js` が担当します。

### 管理ファイル

- `data/profile.json`: プロフィール本体（自己紹介 / スキルセット / 保有資格 / 個人目標）
- `assets/js/profile.js`: JSON読み込み、資格の有効期限判定、画面描画
- `index.html`: 各セクションの表示領域

### `data/profile.json` の構造

- `selfIntroduction`
  - `name`: 名前
  - `specialty`: 得意領域
  - `careerPreference`: 現在の志向
- `skillSet.categories[]`
  - `name`: カテゴリ名（例: 言語, FW, クラウド, DB, ツール）
  - `skills[]`
    - `name`: スキル名
    - `years`: 実務年数（数値）
    - `level`: レベル（1〜10）
- `certifications[]`
  - `name`: 資格名
  - `acquiredDate`: 取得日（`YYYY-MM-DD`）
  - `expiryDate`: 有効期限（`YYYY-MM-DD` または `null`）
- `personalGoals`
  - `goal`: 個人目標
  - `recentLearning`: 直近の学習内容

### スキルレベル表示ルール

- `level` は 1〜10 の10段階で管理します。
- 画面では 5つ星相当（例: 7 → `★★★☆・`）として表示し、合わせて数値（`7 / 10`）も表示します。

### 保有資格の表示ルール

- `expiryDate` が `null` の資格は常に表示します。
- `expiryDate` がある資格は、当日を過ぎると自動的に非表示になります。
- 期限切れ資格を残しておいても、画面上には出ません（履歴管理用途でJSONには保持可能）。

### 更新手順

1. `data/profile.json` を編集する。
2. 日付形式（`YYYY-MM-DD`）とカンマ位置を確認する。
3. ローカル表示または GitHub Pages 反映後、プロフィールTOPを確認する。
