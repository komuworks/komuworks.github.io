# 移行対応表（old/ → Astro）

Astro 移行に伴う、旧パス（`old/`）と新パス（`src/pages/` から生成される公開パス）の対応表です。

## 旧パス → 新パス

| 旧パス | 新パス | 備考 |
| --- | --- | --- |
| `/`（`old/index.html`） | `/` | ホーム |
| `/pages/blog/index.html` | `/blog/` | ブログ一覧 |
| `/pages/blog/post.html?id=<id>` | `/blog/<slug>/` | 記事詳細。`id` クエリ運用から `slug` パス運用へ移行 |
| `/pages/profile/index.html` | `/profile/` | プロフィールTOP |
| `/pages/profile/skill-set.html` | `/profile/skills/` | スキル一覧 |
| `/pages/profile/certifications.html` | `/profile/certifications/` | 資格一覧 |
| `/pages/profile/personal-goals.html` | `/profile/goals/` | 個人目標一覧 |
| `/pages/profile/goal-detail.html?id=<id>` | `/profile/goals/<id>/` | 動的ルート `[id]` |
| `/pages/profile/learning-detail.html?id=<id>` | `/profile/learnings/<id>/` | 学習詳細。動的ルート `[id]` |
| `/pages/typing/index.html` | `/typing/` | タイピング一覧 |
| `/pages/typing/detail.html?date=<YYYY-MM-DD>` | `/typing/<date>/` | 動的ルート `[date]` |

## 旧URLから新URLへの遷移方針

- 外部公開済みの旧URLは、可能な限り `_redirects` で新URLへ 301 リダイレクトする。
- クエリ文字列運用（`?id=` / `?date=`）の旧URLは、受け口ページまたはホスティング設定で新しいパス形式へ誘導する。
- リダイレクト実装後は、主要導線（home/blog/profile/typing）と動的ルート（`[slug]`, `[id]`, `[date]`）の遷移を必ず再確認する。

## `old/` ディレクトリ運用ルール

移行完了チェック後の `old/` の扱いは次のルールに従う。

1. **削除可能条件**
   - 本ドキュメントの対応表にある旧URLのリダイレクト設定が完了している。
   - 「移行完了チェック」の全項目が完了し、運用担当者レビューで承認済みである。

2. **残置する場合**
   - 監査・比較検証のために旧実装を保持する必要がある場合は、`old/` を読み取り専用アーカイブとして残す。
   - 残置時は旧実装を更新対象にせず、修正は新実装（Astro）側のみに適用する。

3. **最終判断**
   - 原則は「削除可能条件を満たしたら `old/` を削除」。
   - ただし、運用上の要件（監査・障害切り戻し計画など）がある場合は、期限を決めて一時残置する。
