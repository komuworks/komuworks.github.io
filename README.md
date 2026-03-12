# komuworks.github.io

GitHub Pages 向けの静的サイトです（HTML/CSS/Vanilla JS）。

## サイト構成とファイル役割

- ホーム
  - `index.html`: サイトの入口ページ（ホーム）。
- プロフィール
  - `pages/profile/index.html`: プロフィールTOPページ。
  - `pages/profile/skill-set.html`: スキルセット一覧ページ。
  - `pages/profile/certifications.html`: 保有資格一覧ページ。
  - `pages/profile/personal-goals.html`: 個人目標・学習一覧ページ。
  - `assets/js/profile.js`: プロフィールTOP向けのデータ読み込みと描画制御。
  - `assets/js/skill-set-list.js`: スキルセット一覧ページ向け描画制御。
  - `assets/js/certification-list.js`: 保有資格一覧ページ向け描画制御。
  - `assets/js/personal-goal-list.js`: 個人目標・学習一覧ページ向け描画制御。
- ブログ
  - `pages/blog/index.html`: 記事一覧ページ（タグ絞り込みUIを表示）。
  - `pages/blog/post.html`: 記事詳細ページ（クエリ `?id=...` で対象記事を表示）。
  - `assets/js/blog.js`: `assets/data/posts.json` を読み込み、一覧表示・詳細表示・タグ絞り込みを制御。
  - `assets/data/posts.json`: ブログ記事データ本体。
- タイピング
  - `pages/typing/index.html`: タイピング記録グラフ表示ページ（クリックで詳細へ遷移）。
  - `pages/typing/detail.html`: 日別のタイピング詳細表示ページ。
  - `assets/js/typing.js`: 計測データJSONの読み込み、期間フィルタ、グラフ描画、詳細ページ遷移を制御。
  - `assets/js/typing-detail.js`: 指定日の詳細データ表示（率/WPM/KPM算出）を制御。
  - `assets/data/typing-metrics.json`: タイピング記録データ本体（計測時間と履歴）。
- 共通
  - `assets/js/layout.js`: ヘッダー／フッターの共通描画。
  - `assets/css/style.css`: 全ページ共通スタイル。

## ブログ記事追加手順（`assets/data/posts.json`）

1. `assets/data/posts.json` を開き、配列の末尾に新しい記事オブジェクトを追加する。
2. 追加後、JSONのカンマ位置や配列構造が壊れていないことを確認する。
3. 各記事に `id`（不変・一意のURL用ID）を設定してください。ページ表示時に `assets/js/blog.js` が日付降順で並び替え、リンクと詳細検索は `?id=<post.id>` を使用します。

### 必須フィールド

各記事は以下のフィールドを必ず持たせてください。

- `id`（文字列）: 記事ID（不変・一意。URLクエリ `?id=...` に利用）
- `title`（文字列）: 記事タイトル
- `date`（文字列）: `YYYY-MM-DD` 形式の日付
- `tags`（文字列配列）: 1件以上のタグ
- `summary`（文字列）: 一覧に表示する要約
- `body`（文字列）: 本文（空行で段落区切り）

### 記事オブジェクト例

```json
{
  "id": "example-post-id",
  "title": "記事タイトル",
  "date": "2026-03-10",
  "tags": ["運用", "メモ"],
  "summary": "一覧用の短い説明文です。",
  "body": "1段落目\n\n2段落目"
}
```


### 文字列描画時の注意（HTMLタグを含む場合）

- `assets/js/blog.js` では、記事タイトル・要約・タグ・本文を `textContent` ベースで描画しています。
- そのため `assets/data/posts.json` の各文字列に `<b>`, `<script>` などのHTMLタグが含まれていても、タグとして解釈されず文字列のまま表示されます。

## タイピング期間フィルタの仕様

- `pages/typing/index.html` の「直近7日 / 30日 / 90日」は **現在日付（当日0:00）** を基準に絞り込みます。
- 例: 「直近7日」は「本日を含む過去7日間」のデータを表示します。
- 選択期間内に該当データがない場合は、画面上に「現在日付基準で対象なし」のステータスを表示します。

## タイピング記録データの保存先とリセット手順

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
      "correctKeys": 1440,
      "errorKeys": 64
    }
  ]
}
```

- `sessionMinutes`: 1回あたりの計測時間（分）。WPM/KPM算出に使用。
- `history[]`: 日別の計測結果。
  - `date`: 計測日（`YYYY-MM-DD`）。
  - `totalChars`: 入力文字数（完成した文字数）。
  - `correctKeys`: 正タイプ数（正しく押下したキー数）。
  - `errorKeys`: 誤タイプ数（誤って押下したキー数）。
- 実装では `総タイプ数 = correctKeys + errorKeys` で統一して扱います。

### WPM / KPM 算出

- `WPM = totalChars / sessionMinutes`
- `KPM = correctKeys / sessionMinutes`
- `正タイプ率(%) = correctKeys / (correctKeys + errorKeys) * 100`
- `誤タイプ率(%) = errorKeys / (correctKeys + errorKeys) * 100`

### 整合性チェック（validateMetrics）

`assets/js/typing.js` / `assets/js/typing-detail.js` では、以下に当てはまるデータを不整合として除外し、画面ステータスに警告件数を表示します。

- 必須項目（`date`, `totalChars`, `correctKeys`, `errorKeys`）が欠けている。
- 数値が負数または有限数でない。
- `correctKeys + errorKeys <= 0`。
- `totalChars > correctKeys`（入力文字数が正タイプ数を超えている）。

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

プロフィールTOPは `assets/data/profile.json` を編集することで内容を更新できます。`pages/profile/index.html` はデータ表示枠のみ持ち、描画は `assets/js/profile.js` が担当します。

※ 旧 `assets/js/profile-list.js` は未参照だったため削除し、一覧ページは `skill-set-list.js` / `certification-list.js` / `personal-goal-list.js` の個別スクリプトで運用します。

### 管理ファイル

- `assets/data/profile.json`: プロフィール本体（自己紹介 / スキルセット / 保有資格 / 個人目標）
- `assets/js/profile.js`: JSON読み込み、資格の有効期限判定、画面描画
- `pages/profile/index.html`: 各セクションの表示領域

### `assets/data/profile.json` の構造

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
  - `id`: 資格詳細ページ用ID
  - `organizer`: 主催名
  - `name`: 資格名
  - `result`: 合格名 / 認定名 / 取得名
  - `acquiredDate`: 取得日（`YYYY-MM`）
  - `expiryDate`: 有効期限（`YYYY-MM` または `null`）
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

1. `assets/data/profile.json` を編集する。
2. 日付形式（`YYYY-MM`）とカンマ位置を確認する。
3. ローカル表示または GitHub Pages 反映後、プロフィールTOPを確認する。
