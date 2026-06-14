# 設計文件：eat.drink.memo 飲料筆記網站

**日期**：2026-06-14  
**作者**：yoshiyyc  
**狀態**：已確認，待實作

---

## 專案概述

台灣有大量連鎖與獨立飲料店（五十嵐、麻古茶坊、得正等），每家店有眾多品項，每杯飲料還可以客製糖度、冰塊。

**eat.drink.memo** 是一個讓使用者記錄飲料心得、分享給彼此的平台。使用者可以記錄在哪家店喝了什麼、喝完的感想、下次想怎麼調整，也可以看到其他人的紀錄作為參考。

---

## 技術棧

| 項目 | 技術 | 備註 |
|------|------|------|
| 前端框架 | React + Vite | 取代舊的 CRA，啟動快 |
| 樣式 | Tailwind CSS | 用 class 寫樣式 |
| 路由 | React Router | 頁面切換 |
| 身份驗證 | Firebase Auth (Google OAuth) | 免費 |
| 資料庫 | Firestore (NoSQL) | 免費，每日 5 萬次讀取 |
| 部署 | Firebase Hosting | 免費 |

> **費用說明**：全部使用 Firebase Spark 免費方案，對 Side Project 流量完全足夠。超過免費額度時才需升級，屆時會有警示。

---

## 使用者角色

### 訪客（Guest）
- 不需要登入，進入網站後輸入暱稱即可
- 暱稱儲存在瀏覽器 localStorage
- 可以：瀏覽所有店家、品項、紀錄；新增一筆飲料紀錄

### 會員（Member）
- 使用 Google 帳號一鍵登入（OAuth）
- 在網站內自訂顯示名稱與頭像（**不使用** Google 帳號的真實姓名）
- 除訪客功能外，還可以：編輯／刪除自己的紀錄、收藏品項、建立個人願望清單、查看個人儀表板

### 管理員（Admin，即開發者本人）
- 透過 Firebase 自訂 claims 識別
- 可以：新增／編輯店家和品項、審核使用者提交的建議

---

## 頁面規劃

| 路徑 | 頁面 | 可使用者 |
|------|------|----------|
| `/` | 首頁 | 所有人 |
| `/shop/:id` | 店家詳細頁 | 所有人 |
| `/drink/:id` | 品項詳細頁 | 所有人 |
| `/new-review` | 新增紀錄表單 | 所有人（訪客填暱稱） |
| `/dashboard` | 個人儀表板 | 登入會員 |
| `/suggest` | 建議新增店家或品項（也可從店家頁帶入預選店家） | 所有人 |
| `/admin` | 管理後台 | 管理員 |

---

## 首頁設計（B3 版型）

由上到下的四個區塊：

1. **Hero**：網站標題 + 一句說明 + 搜尋欄 + 快速篩選標籤（熱門／最新）
2. **店家卡片**：3 欄格狀排列，依 `reviewCount` 降冪排序，顯示前 5–6 家，超過的有「看全部」按鈕；使用店家 Logo（非 emoji）
3. **這週大家在喝**：本週紀錄數最多的前 3 個品項（格式：店家名・品項名 + 紀錄數）
4. **最新紀錄**：顯示所有人最新的評論，格式為：暱稱・店家名 品項名 + 星星數 + 評論文字

---

## 店家與品項的資料管理

- **只有管理員**可以新增／編輯店家和品項
- **所有使用者**可以透過 `/suggest` 頁面提交建議（例如新店家、季節限定品項）
- 管理員在後台審核建議後上架

---

## 新增紀錄表單（`/new-review`）

### 入口
- 首頁上方的「記錄這杯」按鈕
- 店家詳細頁的「記錄這家店」按鈕（帶入預選店家）
- 品項詳細頁的「記錄這杯」按鈕（帶入預選店家 + 品項）

### 必填欄位
| 欄位 | 類型 |
|------|------|
| 店家 | Dropdown（帶入預選值） |
| 品項 | Dropdown（依選擇店家篩選，帶入預選值；標示季節限定） |
| 甜度 | Radio：依該店 `sugarOptions` 動態產生 |
| 冰塊 | Radio：依該店 `iceOptions` 動態產生 |
| 容量 | Radio：中 / 大 |
| 配料 | Checkbox 多選：依該店 `toppingOptions` 動態產生（選填） |

### 選填欄位
| 欄位 | 類型 |
|------|------|
| 星星評分 | 1–5 顆星選擇器 |
| 評論留言 | 文字輸入框 |

### 下次想試（選填區塊）
| 欄位 | 類型 |
|------|------|
| 品項 | Dropdown（預設為當前品項，可換同店其他品項） |
| 甜度 | Radio |
| 冰塊 | Radio |

> **首頁 / 品項頁只顯示評論留言**。「下次想試」的內容只在個人儀表板和品項詳細頁顯示。

---

## 資料模型（Firestore）

### `shops/{shopId}`
```json
{
  "name": "五十嵐",
  "logoUrl": "https://...",
  "reviewCount": 120,
  "sugarOptions": ["無糖", "一分", "三分", "五分", "七分", "全糖"],
  "iceOptions": ["去冰", "少冰", "正常冰", "多冰"],
  "toppingOptions": ["珍珠", "波霸", "椰果", "布丁", "仙草", "芋圓"],
  "createdAt": "timestamp"
}
```
> `reviewCount` 由系統自動維護：新增紀錄時 +1，刪除時 -1（client-side Firestore 事務更新）。首頁店家依 `reviewCount` 降冪排序。  
> `sugarOptions`、`iceOptions`、`toppingOptions` 由管理員建立店家時設定，反映各店實際提供的選項。

### `drinks/{drinkId}`
```json
{
  "shopId": "string",
  "name": "四季春拿鐵",
  "isSeasonal": false,
  "createdAt": "timestamp"
}
```

### `reviews/{reviewId}`
```json
{
  "drinkId": "string",
  "shopId": "string",
  "userId": "string | null",
  "guestNickname": "string | null",
  "sugar": "三分",
  "ice": "少冰",
  "size": "大",
  "toppings": ["珍珠", "椰果"],
  "rating": 4,
  "comment": "香氣很好，不會太甜",
  "nextTime": {
    "drinkId": "string",
    "sugar": "一分",
    "ice": "去冰"
  },
  "createdAt": "timestamp"
}
```
> `toppings` 選填，預設空陣列 `[]`。`rating`、`comment`、`nextTime` 均為選填，可為 `null`。

### `users/{userId}`
```json
{
  "uid": "Firebase Auth UID",
  "displayName": "自訂暱稱",
  "avatarUrl": "string | null",
  "createdAt": "timestamp"
}
```

### `wishlists/{id}`
```json
{
  "userId": "string",
  "drinkId": "string",
  "shopId": "string",
  "note": "string | null",
  "createdAt": "timestamp"
}
```

### `favorites/{id}`
```json
{
  "userId": "string",
  "drinkId": "string",
  "createdAt": "timestamp"
}
```

### `suggestions/{id}`
```json
{
  "type": "shop | drink",
  "name": "string",
  "shopId": "string | null",
  "submittedBy": "userId 或 guestNickname",
  "status": "pending | approved | rejected",
  "createdAt": "timestamp"
}
```

---

## 身份驗證流程

### 訪客
1. 點擊「以訪客繼續」
2. 輸入暱稱
3. 暱稱儲存在 `localStorage`
4. 可以新增紀錄，紀錄顯示該暱稱

### 會員（Google 登入）
1. 點擊「Google 登入」
2. Firebase Auth 處理 OAuth 流程
3. **首次登入**：引導設定自訂顯示名稱和頭像，儲存至 Firestore `users` collection
4. 後續登入：直接進入，使用已設定的顯示名稱（不顯示 Google 真實姓名）

### 管理員
- Firebase custom claims 設定 `role: "admin"`
- `/admin` 路由會檢查此 claim，否則重導至首頁

---

## 會員專屬功能

| 功能 | 說明 |
|------|------|
| 編輯紀錄 | 只能編輯自己的紀錄 |
| 刪除紀錄 | 只能刪除自己的紀錄 |
| 收藏品項 | 加入 `favorites`，在儀表板可查看 |
| 願望清單 | 加入 `wishlists`，可附加備註，在儀表板可查看 |
| 個人儀表板 | 顯示自己的所有紀錄、收藏、願望清單 |

---

## 未來可擴充的功能（MVP 後再考慮）

- 個人公開頁（`/profile/:name`）
- 飲料類型分類
- 篩選標籤擴充（如「無糖推薦」，自動從紀錄中計算）
- 支援餐廳（不只飲料）
- 圖片上傳（紀錄附照片）
- 社交功能（按讚、回覆）

---

## 設計風格

- 目標氛圍：**文青、活力**，有個性、不像 AI 套版
- 避免：過於制式的圓角卡片、預設 Material UI 感、無聊的藍白配色
- 設計細節（字體、色系、間距）在開始刻 UI 前另行討論確認

## 開發前置作業

1. **CLAUDE.md**：記錄專案說明、技術棧、目錄結構（由 AI 協助維護）
2. **Firebase 設定**：逐步引導建立，需確認是否有既有帳號、是否有舊專案
3. **初始資料**：店家與品項清單，計畫透過爬蟲或 OCR 讀取菜單建立，細節待實作階段討論
