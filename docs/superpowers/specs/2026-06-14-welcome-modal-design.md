# Welcome Modal + Navbar Avatar 設計規格

**日期：** 2026-06-14
**功能：** 入站歡迎 modal + Navbar 全面改為 avatar 入口

---

## 背景

原本使用者必須主動點擊 Navbar 的「以訪客繼續」才能設定暱稱。新設計：

1. 進站自動顯示歡迎 modal，讓使用者選擇 Google 登入或訪客繼續
2. Navbar 改為 avatar icon，桌機與手機一致
3. 未登入 / 訪客：灰色預設頭像，點擊開啟 WelcomeModal
4. 已登入：Google 帳號頭像，點擊開啟 dropdown

---

## 整體架構

```
Navbar
  ├─ [Logo]                         左側
  └─ [Avatar]                       右側
        ├─ 未設定 / 訪客（灰色圓圈）
        │     click → WelcomeModal
        └─ 已登入（Google photoURL）
              click → UserDropdown
                        ├─ 我的紀錄
                        └─ 登出
```

---

## 元件一：`WelcomeModal.jsx`（新增）

**觸發：** `!user && (needsGuestSetup || showWelcomeModal)`

- `needsGuestSetup: !user && !guestName`（AuthContext）
- `showWelcomeModal`：Navbar 的 local state，由 avatar 點擊觸發

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
| 點「使用 Google 登入」 | `signInWithGoogle()` → `user` 被設定 → `!user` 條件不成立 → modal 自動消失 → ProfileSetupModal 接手（若第一次登入） |
| 點「繼續」（訪客） | `setGuest(trimmedInput \|\| '匿名')` → `guestName` 被設定 → modal 消失 |
| 點 X | `setGuest('匿名')` → modal 消失 |

**記憶機制：** 訪客名稱存於 `localStorage` (`edm_guest_nickname`)。有值即不再自動觸發 modal。

**Props：**
- `onClose?: () => void`：訪客回訪重開時使用

---

## 元件二：`UserDropdown.jsx`（新增）

只在 `isLoggedIn` 時顯示，由 Navbar avatar 點擊觸發。

**版面：**

```
          ┌──────────────┐
          │  我的紀錄    │
          │  登出        │
          └──────────────┘
```

- 位置：avatar 正下方，右對齊
- 關閉：點選項、點 modal 外部（click-outside）
- 樣式：白色卡片、`shadow-lg`、`rounded-xl`、`border border-gray-200`

---

## 元件三：Navbar Avatar

**頭像邏輯：**

```
已登入：profile?.avatarUrl ?? user?.photoURL → 圓形圖片
訪客 / 未登入：灰色預設圓圈（CSS，無圖片）
```

**點擊行為：**

```
isLoggedIn → toggle UserDropdown
else       → setShowWelcomeModal(true)
```

**Navbar 右側（桌機與手機一致）：**

```
[Avatar]
```

移除所有文字按鈕（displayName、我的紀錄、以訪客繼續、Google 登入、登出），功能全部收進 avatar 入口。

---

## AuthContext 變更

`src/contexts/AuthContext.jsx`：加入 `needsGuestSetup` 至 value：

```js
needsGuestSetup: !user && !guestName,
```

---

## Navbar 變更

`src/components/layout/Navbar.jsx`：

**移除：**
- `showGuestInput` state
- `nicknameInput` state
- `handleGuestSubmit` function
- inline guest form
- 所有文字按鈕

**新增：**
- `showWelcomeModal` state
- `showDropdown` state
- Avatar 元素（圓形，36–40px）
- `{!user && (needsGuestSetup || showWelcomeModal) && <WelcomeModal onClose={...} />}`
- `{isLoggedIn && showDropdown && <UserDropdown onClose={...} />}`
- ProfileSetupModal 渲染保留不動

---

## 檔案清單

| 動作 | 路徑 |
|------|------|
| 新增 | `src/components/WelcomeModal.jsx` |
| 新增 | `src/components/UserDropdown.jsx` |
| 修改 | `src/contexts/AuthContext.jsx` |
| 修改 | `src/components/layout/Navbar.jsx` |

---

## 不在範圍內

- 自訂頭像上傳（`profile.avatarUrl` 有欄位但此次不實作上傳）
- 手機版 hamburger menu
- Navbar 其他連結（建議、搜尋等）
