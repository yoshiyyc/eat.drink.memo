# Welcome Modal 設計規格

**日期：** 2026-06-14
**功能：** 入站歡迎 modal，讓使用者選擇 Google 登入或訪客繼續

---

## 背景

目前使用者進入網站時，必須主動點擊 Navbar 的「以訪客繼續」才能設定暱稱並使用功能。這造成兩個問題：
1. 使用者不知道可以不用登入就能用
2. Google 登入入口只在 Navbar，視覺權重不夠

新設計：進站自動顯示歡迎 modal，讓使用者立即選擇登入方式。

---

## 觸發條件

`needsGuestSetup: !user && !guestName`

- `user`：Firebase Auth 登入狀態
- `guestName`：localStorage 的 `edm_guest_nickname` 值

滿足條件時，Navbar 渲染 WelcomeModal。使用者完成選擇後，`guestName` 或 `user` 其中一個會有值，條件不再成立，modal 自動消失。

**記憶機制：** 使用者只要曾經完成選擇（確認名稱、X 關閉、或 Google 登入），localStorage 就有記錄，下次進站不再顯示 modal。

---

## 元件設計

### `src/components/WelcomeModal.jsx`（新增）

**Props：**
- `onClose?: () => void`：供 Navbar「訪客模式」chip 手動關閉用

**版面（單一畫面）：**

```
┌─────────────────────────────┐
│  歡迎使用 eat.drink.memo [X]│
│                             │
│  [ G  使用 Google 登入    ] │
│                             │
│  ──────── 或 ────────       │
│                             │
│  以訪客繼續                 │
│  [ 匿名__________________ ] │
│  [ 繼續                   ] │
└─────────────────────────────┘
```

**行為：**

| 動作 | 結果 |
|------|------|
| 點「使用 Google 登入」 | 呼叫 `signInWithGoogle()`；Firebase Auth 更新 `user`；`needsGuestSetup` 變 false；modal 自動消失；若 `needsProfileSetup` 則 ProfileSetupModal 接手 |
| 點「繼續」（訪客） | 呼叫 `setGuest(trimmedInput \|\| '匿名')`；modal 消失 |
| 點 X | 呼叫 `setGuest('匿名')`；modal 消失 |
| 點「訪客模式」chip（已設名後） | 重開 modal（由 Navbar 的 `showWelcomeModal` state 控制） |

**input 細節：**
- 預填「匿名」
- `maxLength={20}`
- 無驗證（空白 → 存「匿名」）

---

## AuthContext 變更

`src/contexts/AuthContext.jsx`：

```js
needsGuestSetup: !user && !guestName,  // 新增至 value 物件
```

其餘不變。`setGuest` / `guestSession.js` / localStorage 邏輯已存在，無需修改。

---

## Navbar 變更

`src/components/layout/Navbar.jsx`：

**移除：**
- `showGuestInput` state
- `nicknameInput` state
- `handleGuestSubmit` function
- 整個 inline guest form（`showGuestInput &&` 的區塊）
- 「以訪客繼續」按鈕

**新增：**
- `showWelcomeModal` state（控制手動重開）
- `needsGuestSetup` 從 `useAuth()` 取得
- 渲染邏輯：
  ```jsx
  {(needsGuestSetup || showWelcomeModal) && (
    <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
  )}
  ```

**Nav 右側三種狀態：**

```
已登入：  [displayName]  [我的紀錄]  [登出]
訪客：    [displayName]  [訪客模式]  [Google 登入]  [登出]
未設定：  [Google 登入]   ← modal 蓋在畫面上
```

「訪客模式」為灰色小文字按鈕，`onClick={() => setShowWelcomeModal(true)}`。

---

## 檔案清單

| 動作 | 路徑 |
|------|------|
| 新增 | `src/components/WelcomeModal.jsx` |
| 修改 | `src/contexts/AuthContext.jsx` |
| 修改 | `src/components/layout/Navbar.jsx` |

---

## 不在範圍內

- `guestSession.js` 不動
- `ProfileSetupModal.jsx` 不動
- Firestore security rules 不動
- 手機版 RWD 不特別處理（沿用現有 Tailwind 響應式）
