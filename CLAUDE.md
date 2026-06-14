# eat.drink.memo

台灣飲料店紀錄平台。使用者可記錄在哪家店喝了什麼、客製化選項（糖度、冰塊、配料）、心得評分，以及下次想試什麼。

## 技術棧

- Frontend: React 18 + Vite + Tailwind CSS v4 + React Router v6
- Auth: Firebase Auth (Google OAuth)
- Database: Firestore (NoSQL)
- Hosting: Firebase Hosting

## 環境變數

複製 `.env.example` 為 `.env`，填入 Firebase Console 的設定值。

## 常用指令

| 指令 | 用途 |
|------|------|
| `npm run dev` | 啟動開發伺服器（localhost:5173） |
| `npm run build` | 打包生產版本到 dist/ |
| `firebase deploy` | 部署到 Firebase Hosting |

## 目錄結構

```
src/
├── contexts/            # AuthContext（全域登入狀態）
├── utils/               # 工具函式（guestSession 等）
├── services/            # Firestore CRUD（shops, drinks, reviews...）
├── components/layout/   # Navbar, Layout
└── pages/               # 各頁面元件
```

## 設計文件

詳見 `docs/superpowers/specs/2026-06-14-drink-memo-design.md`
