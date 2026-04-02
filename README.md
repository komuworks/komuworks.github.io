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

- [ ] ズームアウトで Admin 1 が非表示、Admin 0 のみ表示される
- [ ] ズームインで Admin 1 が表示される
- [ ] Admin 1 のステータス色が凡例と一致する
- [ ] Admin 0 色の集約結果が優先順位どおりになる
- [ ] ステータス未設定地域が `unknown` 色で表示される
