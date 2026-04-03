# komuworks.github.io

Astro で構築した公開サイトです。旧サイト（`old/`）は廃止済みで、現行実装のみを運用します。

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## 主なページ

- `/` Home
- `/blog/` Blog 一覧
- `/profile/` Profile
- `/profile/goals/` Goals
- `/typing/` Typing
- `/travel-map/` Travel Map

## Travel Map 最低限の確認項目

- [ ] Admin 1 の表示しきい値は `ADMIN1_VISIBLE_ZOOM = 2.5` で、`scale < 2.5` は Admin 0 のみ、`scale >= 2.5` で Admin 1 表示に切り替わる
- [ ] Admin 1 のステータス色が凡例と一致する
- [ ] Admin 0 色の集約結果が優先順位どおりになる
- [ ] `unknown` は「ステータス値が欠損・非文字列・未定義キー（正規化後に許可外）」の場合に適用される
- [ ] 初回ロード失敗時（`admin0Render` / `visitedStatus` 取得失敗）は「地図データを読み込めませんでした」が表示され、凡例は空のまま（項目なし）
- [ ] Admin 1 遅延ロード失敗時（ズームイン後 `admin1Render` 取得失敗）は同エラーメッセージが表示され、凡例は初回ロード成功時の表示状態のまま維持される
