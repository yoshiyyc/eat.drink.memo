# Phase 1: Foundation + Auth + Homepage 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 eat.drink.memo 的專案基礎、Firebase 整合、Google 登入 + 訪客模式、以及可運作的首頁（Hero + 店家卡片）並部署上線。

**Architecture:** Vite + React + Tailwind 為前端 SPA，Firebase Auth 處理 Google OAuth，Firestore 儲存店家資料，AuthContext 管理全域登入狀態。所有 Firebase 操作透過 SDK 在前端完成，無自訂後端。

**Tech Stack:** React 18, Vite, Tailwind CSS v3, React Router v6, Firebase v10 (Auth + Firestore + Hosting)

---

## 檔案結構

```
eat.drink.memo/
├── CLAUDE.md
├── .env                          # (git-ignored) Firebase 設定
├── .env.example                  # 範本（committed）
├── firebase.json                 # Firebase Hosting 設定（Task 12）
├── .firebaserc                   # Firebase 專案綁定（Task 12）
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                  # React 進入點
│   ├── App.jsx                   # Router + AuthProvider
│   ├── index.css                 # Tailwind 指令
│   ├── firebase.js               # Firebase 初始化，export auth, db
│   ├── contexts/
│   │   └── AuthContext.jsx       # 登入狀態、Google OAuth、訪客模式
│   ├── utils/
│   │   └── guestSession.js       # localStorage 暱稱讀寫
│   ├── services/
│   │   └── shops.js              # Firestore 店家查詢
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx        # 頁面外框（Navbar + Outlet）
│   │       └── Navbar.jsx        # 導覽列
│   └── pages/
│       ├── HomePage.jsx          # 首頁（Hero + 店家 + 佔位）
│       ├── ShopPage.jsx          # 暫存頁
│       ├── DrinkPage.jsx         # 暫存頁
│       ├── NewReviewPage.jsx     # 暫存頁
│       ├── DashboardPage.jsx     # 暫存頁
│       ├── SuggestPage.jsx       # 暫存頁
│       └── AdminPage.jsx         # 暫存頁
```

---

### Task 1: 初始化 Vite + React + Tailwind

**Files:**
- Create: `package.json`（Vite 產生）
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: 在專案目錄執行 Vite 初始化**

```bash
npm create vite@latest . -- --template react
```

詢問是否在現有目錄建立時，輸入 `y` 繼續。

- [ ] **Step 2: 安裝所有依賴**

```bash
npm install
npm install react-router-dom firebase
npm install -D tailwindcss postcss autoprefixer
```

- [ ] **Step 3: 初始化 Tailwind**

```bash
npx tailwindcss init -p
```

這個指令會自動建立 `tailwind.config.js` 和 `postcss.config.js`。

- [ ] **Step 4: 更新 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 5: 把 src/index.css 的內容完全換成 Tailwind 指令**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: 暫時清空 src/App.jsx 只留一行，用來驗證 Tailwind**

```jsx
export default function App() {
  return <div className="p-8 text-indigo-600 text-2xl font-bold">eat.drink.memo</div>
}
```

- [ ] **Step 7: 啟動開發伺服器驗證**

```bash
npm run dev
```

在瀏覽器開啟 `http://localhost:5173`，預期看到靛藍色粗體文字「eat.drink.memo」。看到就代表 Tailwind 設定成功。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: init Vite + React + Tailwind"
```

---

### Task 2: 建立 CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: 建立 CLAUDE.md**

```markdown
# eat.drink.memo

台灣飲料店紀錄平台。使用者可記錄在哪家店喝了什麼、客製化選項（糖度、冰塊、配料）、心得評分，以及下次想試什麼。

## 技術棧

- Frontend: React 18 + Vite + Tailwind CSS + React Router v6
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
├── contexts/      # AuthContext（全域登入狀態）
├── utils/         # 工具函式（guestSession 等）
├── services/      # Firestore CRUD（shops, drinks, reviews...）
├── components/layout/   # Navbar, Layout
└── pages/         # 各頁面元件
```

## 設計文件

詳見 `docs/superpowers/specs/2026-06-14-drink-memo-design.md`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md"
```

---

### Task 3: 建立 Firebase 專案（瀏覽器手動操作）

**這個 Task 全部在瀏覽器完成，沒有程式碼。請告訴 Claude 完成了哪些步驟，或遇到什麼問題。**

- [ ] **Step 1: 前往 Firebase Console**

開啟 `https://console.firebase.google.com`  
用你的 Google 帳號（Gmail）登入——不需要另外申請，Google 帳號即可使用 Firebase。

- [ ] **Step 2: 建立新專案**

1. 點「新增專案」
2. 專案名稱：`eat-drink-memo`
3. 詢問是否啟用 Google Analytics → 選「否」（Side Project 不需要）
4. 點「建立專案」，等待幾秒完成

- [ ] **Step 3: 啟用 Google 登入**

1. 左側選單 → **Authentication** → 開始使用
2. 點擊「Sign-in method」分頁
3. 點擊「Google」
4. 切換「啟用」開關
5. 填入你的 Email 作為「專案支援電子郵件」
6. 點「儲存」

- [ ] **Step 4: 建立 Firestore 資料庫**

1. 左側選單 → **Firestore Database** → 建立資料庫
2. 選「**以測試模式開始**」（未來上線前會修改安全規則）
3. 位置選 **`asia-east1`**（台灣最近的機房）
4. 點「啟用」，等待幾秒

- [ ] **Step 5: 取得 Firebase 設定**

1. 左上角齒輪圖示 → 「專案設定」
2. 滾到下方「您的應用程式」→ 點「`</>` 網頁」圖示
3. 應用程式暱稱填：`eat-drink-memo-web`
4. **不要**勾選「同時設定 Firebase Hosting」
5. 點「繼續下一步」直到看到 `firebaseConfig` 物件
6. 把整個 `firebaseConfig` 物件**複製貼到一個地方備用**（下個 Task 用）

---

### Task 4: 設定 Firebase 環境變數

**Files:**
- Modify: `.env.example`
- Create: `.env`（不 commit）
- Create: `src/firebase.js`

- [ ] **Step 1: 更新 .env.example 內容**

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

- [ ] **Step 2: 建立 .env，填入你從 Firebase 複製的實際值**

把 Task 3 Step 5 複製的 `firebaseConfig` 對應值填進去，例如：
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=eat-drink-memo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eat-drink-memo
VITE_FIREBASE_STORAGE_BUCKET=eat-drink-memo.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

- [ ] **Step 3: 建立 src/firebase.js**

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

- [ ] **Step 4: 在 App.jsx 加測試程式碼，確認能連上 Firebase**

把 `src/App.jsx` 暫時改成：
```jsx
import { useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function App() {
  useEffect(() => {
    getDocs(collection(db, 'shops')).then(snap => {
      console.log('✅ Firebase 連線成功，shops 筆數：', snap.size);
    }).catch(err => {
      console.error('❌ Firebase 連線失敗：', err.message);
    });
  }, []);

  return <div className="p-8 text-indigo-600 text-2xl font-bold">eat.drink.memo</div>
}
```

- [ ] **Step 5: 驗證 Firebase 連線**

```bash
npm run dev
```

開啟瀏覽器 DevTools（F12）→ Console，應看到：
```
✅ Firebase 連線成功，shops 筆數：0
```

若看到 `❌ Firebase 連線失敗`，通常是 `.env` 的值有誤，請對照 Firebase Console 重新確認。

- [ ] **Step 6: 移除測試程式碼，App.jsx 還原**

```jsx
export default function App() {
  return <div className="p-8 text-indigo-600 text-2xl font-bold">eat.drink.memo</div>
}
```

- [ ] **Step 7: Commit（只加 .env.example 和 firebase.js，不加 .env）**

```bash
git add .env.example src/firebase.js
git commit -m "feat: add Firebase config"
```

---

### Task 5: 在 Firestore 手動新增初始店家資料

**在 Firebase Console 手動操作，沒有程式碼。**

- [ ] **Step 1: 前往 Firestore Console**

Firebase Console → **Firestore Database** → 「資料」分頁

- [ ] **Step 2: 建立 shops collection，新增第一家店**

1. 點「+ 新增集合」
2. 集合名稱輸入：`shops`
3. 點「下一步」
4. 文件 ID 選「自動 ID」
5. 依序新增以下欄位（注意每個欄位的類型）：

| 欄位 | 類型 | 值 |
|------|------|----|
| name | string | 五十嵐 |
| logoUrl | string | （空字串，之後再填）|
| reviewCount | number | 0 |
| sugarOptions | array | 先點「新增欄位」，類型選 array，值依序加：無糖、一分、三分、五分、七分、全糖 |
| iceOptions | array | 去冰、少冰、正常冰、多冰 |
| toppingOptions | array | 珍珠、波霸、椰果、布丁、仙草、芋圓 |
| createdAt | timestamp | 點 timestamp，選目前時間 |

6. 點「儲存」

- [ ] **Step 3: 再新增 2 家店（重複 Step 2 流程）**

新增「麻古茶坊」和「得正」，欄位值暫時和五十嵐一樣（之後再調整各店實際選項）。

- [ ] **Step 4: 在瀏覽器重新整理開發伺服器**

```bash
npm run dev
```

暫時在 `App.jsx` 的 useEffect 改 log 看一下筆數（或直接看 Firestore Console 確認有 3 筆）。

---

### Task 6: 建立 Guest Session 工具

**Files:**
- Create: `src/utils/guestSession.js`

- [ ] **Step 1: 建立 src/utils/guestSession.js**

```javascript
const KEY = 'edm_guest_nickname';

export function getGuestNickname() {
  return localStorage.getItem(KEY);
}

export function setGuestNickname(nickname) {
  localStorage.setItem(KEY, nickname);
}

export function clearGuestNickname() {
  localStorage.removeItem(KEY);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/guestSession.js
git commit -m "feat: add guest session utility"
```

---

### Task 7: 建立 AuthContext（全域登入狀態）

**Files:**
- Create: `src/contexts/AuthContext.jsx`

- [ ] **Step 1: 建立 src/contexts/AuthContext.jsx**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  getGuestNickname,
  setGuestNickname,
  clearGuestNickname,
} from '../utils/guestSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // Firebase Auth user
  const [profile, setProfile] = useState(null);     // Firestore 自訂 profile
  const [guestName, setGuestName] = useState(() => getGuestNickname());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 回傳 { user, isNewUser }，讓呼叫端決定是否要引導設定 profile
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, 'users', result.user.uid));
    return { user: result.user, isNewUser: !snap.exists() };
  }

  // 首次登入後呼叫，建立 Firestore profile（自訂暱稱，不用 Google 真名）
  async function createProfile(uid, displayName, avatarUrl = null) {
    const data = { uid, displayName, avatarUrl, createdAt: serverTimestamp() };
    await setDoc(doc(db, 'users', uid), data);
    setProfile(data);
  }

  function setGuest(nickname) {
    setGuestNickname(nickname);
    setGuestName(nickname);
  }

  function handleSignOut() {
    signOut(auth);
    clearGuestNickname();
    setGuestName(null);
  }

  const value = {
    user,
    profile,
    guestName,
    isLoggedIn: !!user,
    isGuest: !user && !!guestName,
    displayName: profile?.displayName ?? guestName ?? null,
    signInWithGoogle,
    createProfile,
    setGuest,
    signOut: handleSignOut,
  };

  if (loading) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 內使用');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/AuthContext.jsx
git commit -m "feat: add AuthContext with Google OAuth and guest mode"
```

---

### Task 8: 建立所有暫存頁面

**Files:**
- Create: `src/pages/ShopPage.jsx`
- Create: `src/pages/DrinkPage.jsx`
- Create: `src/pages/NewReviewPage.jsx`
- Create: `src/pages/DashboardPage.jsx`
- Create: `src/pages/SuggestPage.jsx`
- Create: `src/pages/AdminPage.jsx`

- [ ] **Step 1: 建立 6 個暫存頁面（每個只有一行）**

`src/pages/ShopPage.jsx`:
```jsx
export default function ShopPage() {
  return <div className="p-8 text-gray-400">店家詳細頁（Phase 2 建置）</div>
}
```

`src/pages/DrinkPage.jsx`:
```jsx
export default function DrinkPage() {
  return <div className="p-8 text-gray-400">品項詳細頁（Phase 2 建置）</div>
}
```

`src/pages/NewReviewPage.jsx`:
```jsx
export default function NewReviewPage() {
  return <div className="p-8 text-gray-400">新增紀錄（Phase 2 建置）</div>
}
```

`src/pages/DashboardPage.jsx`:
```jsx
export default function DashboardPage() {
  return <div className="p-8 text-gray-400">個人儀表板（Phase 3 建置）</div>
}
```

`src/pages/SuggestPage.jsx`:
```jsx
export default function SuggestPage() {
  return <div className="p-8 text-gray-400">建議新增（Phase 2 建置）</div>
}
```

`src/pages/AdminPage.jsx`:
```jsx
export default function AdminPage() {
  return <div className="p-8 text-gray-400">管理後台（Phase 4 建置）</div>
}
```

- [ ] **Step 2: 建立暫時的 HomePage（之後 Task 11 換掉）**

`src/pages/HomePage.jsx`:
```jsx
export default function HomePage() {
  return <div className="p-8 text-gray-400">首頁（即將建置）</div>
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/
git commit -m "feat: add stub pages"
```

---

### Task 9: 設定 App.jsx 路由 + Layout + Navbar

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Create: `src/components/layout/Layout.jsx`
- Create: `src/components/layout/Navbar.jsx`

- [ ] **Step 1: 確認 src/main.jsx 正確**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: 建立 src/components/layout/Navbar.jsx**

```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isLoggedIn, isGuest, displayName, signInWithGoogle, signOut, setGuest } = useAuth();
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  function handleGuestSubmit(e) {
    e.preventDefault();
    const trimmed = nicknameInput.trim();
    if (trimmed) {
      setGuest(trimmed);
      setShowGuestInput(false);
      setNicknameInput('');
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight text-gray-900">
          eat.drink.memo
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {isLoggedIn || isGuest ? (
            <>
              <span className="text-gray-600">{displayName}</span>
              {isLoggedIn && (
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  我的紀錄
                </Link>
              )}
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-gray-700"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowGuestInput(v => !v)}
                className="text-gray-600 hover:text-gray-900"
              >
                以訪客繼續
              </button>
              <button
                onClick={signInWithGoogle}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                Google 登入
              </button>
            </>
          )}
        </div>
      </div>

      {showGuestInput && (
        <div className="max-w-5xl mx-auto mt-2">
          <form onSubmit={handleGuestSubmit} className="flex gap-2">
            <input
              value={nicknameInput}
              onChange={e => setNicknameInput(e.target.value)}
              placeholder="你的暱稱..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:border-indigo-400"
              autoFocus
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
            >
              確認
            </button>
            <button
              type="button"
              onClick={() => setShowGuestInput(false)}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              取消
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 3: 建立 src/components/layout/Layout.jsx**

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: 更新 src/App.jsx（完整路由設定）**

```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import DrinkPage from './pages/DrinkPage';
import NewReviewPage from './pages/NewReviewPage';
import DashboardPage from './pages/DashboardPage';
import SuggestPage from './pages/SuggestPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop/:id" element={<ShopPage />} />
            <Route path="drink/:id" element={<DrinkPage />} />
            <Route path="new-review" element={<NewReviewPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="suggest" element={<SuggestPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 5: 驗證路由和 Navbar 正常**

```bash
npm run dev
```

確認：
1. 首頁顯示 Navbar（「eat.drink.memo」logo + 右側按鈕）
2. 點「以訪客繼續」→ 輸入暱稱 → 按確認 → 右側顯示暱稱 + 登出
3. 按「登出」→ 還原未登入狀態
4. 手動前往 `http://localhost:5173/shop/test` 顯示「店家詳細頁（Phase 2 建置）」
5. 手動前往 `http://localhost:5173/dashboard` 顯示「個人儀表板（Phase 3 建置）」

Google 登入按鈕需要真實 Firebase 設定才能運作（已在 Task 4 完成）。

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add routing, Layout, and Navbar"
```

---

### Task 10: 建立 Shop Service

**Files:**
- Create: `src/services/shops.js`

- [ ] **Step 1: 建立 src/services/shops.js**

```javascript
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export async function getShops() {
  const q = query(collection(db, 'shops'), orderBy('reviewCount', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getShopById(shopId) {
  const snap = await getDoc(doc(db, 'shops', shopId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/shops.js
git commit -m "feat: add shop Firestore service"
```

---

### Task 11: 建立完整首頁

**Files:**
- Modify: `src/pages/HomePage.jsx`

- [ ] **Step 1: 更新 src/pages/HomePage.jsx**

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShops } from '../services/shops';

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShops().then(data => {
      setShops(data);
      setLoading(false);
    });
  }, []);

  const topShops = shops.slice(0, 5);
  const hasMore = shops.length > 5;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      <section className="bg-indigo-600 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">喝什麼好呢？</h1>
        <p className="text-indigo-200 mb-6">記錄你喝過的飲料，找到下一杯最愛</p>
        <input
          type="text"
          placeholder="搜尋店家或飲料..."
          className="w-full max-w-md mx-auto block bg-white text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
          readOnly
        />
        <div className="flex gap-2 justify-center mt-4">
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors">
            熱門
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors">
            最新
          </button>
        </div>
      </section>

      {/* Shop Grid */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg">店家</h2>
          {hasMore && (
            <span className="text-indigo-600 text-sm cursor-pointer">看全部 →</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <p className="text-gray-400 text-sm">尚未有店家資料</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {topShops.map(shop => (
              <Link
                key={shop.id}
                to={`/shop/${shop.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md hover:border-indigo-200 transition-all"
              >
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="w-10 h-10 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 rounded-full mx-auto mb-2" />
                )}
                <p className="text-sm font-medium text-gray-800">{shop.name}</p>
              </Link>
            ))}
            {hasMore && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm cursor-pointer hover:bg-gray-100">
                +更多
              </div>
            )}
          </div>
        )}
      </section>

      {/* Weekly Trending */}
      <section className="mb-8">
        <h2 className="font-bold text-gray-800 text-lg mb-4">🔥 這週大家在喝</h2>
        <div className="bg-white border border-gray-200 rounded-xl">
          <p className="p-6 text-gray-400 text-sm text-center">
            還沒有紀錄，成為第一個留下心得的人！
          </p>
        </div>
      </section>

      {/* Latest Reviews */}
      <section>
        <h2 className="font-bold text-gray-800 text-lg mb-4">最新紀錄</h2>
        <div className="bg-white border border-gray-200 rounded-xl">
          <p className="p-6 text-gray-400 text-sm text-center">
            還沒有紀錄，成為第一個留下心得的人！
          </p>
        </div>
      </section>

    </div>
  );
}
```

- [ ] **Step 2: 驗證首頁**

```bash
npm run dev
```

確認：
1. Hero 區塊顯示標題、搜尋欄、熱門／最新按鈕
2. 店家區塊顯示 Task 5 新增的店家（五十嵐、麻古茶坊、得正）
3. 點店家卡片跳到 `/shop/:id`（顯示暫存頁文字）
4. Loading 時顯示灰色骨架動畫（`animate-pulse`）

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat: build homepage with hero, shop grid, and placeholders"
```

---

### Task 12: 部署到 Firebase Hosting

**Files:**
- Create: `firebase.json`（firebase init 自動產生）
- Create: `.firebaserc`（firebase init 自動產生）

- [ ] **Step 1: 安裝 Firebase CLI**

```bash
npm install -g firebase-tools
```

- [ ] **Step 2: 登入 Firebase**

```bash
firebase login
```

瀏覽器會打開 Google 授權頁面，登入同一個 Google 帳號即可。

- [ ] **Step 3: 初始化 Firebase Hosting**

```bash
firebase init hosting
```

出現問題時依序回答：
- "Which Firebase project?" → 選 `eat-drink-memo`
- "What do you want to use as your public directory?" → 輸入 `dist`
- "Configure as a single-page app (rewrite all urls to /index.html)?" → `y`
- "Set up automatic builds and deploys with GitHub?" → `N`
- 如果詢問是否覆蓋 `dist/index.html` → `N`

- [ ] **Step 4: 打包並部署**

```bash
npm run build
firebase deploy --only hosting
```

成功後會顯示：
```
✔ Deploy complete!
Hosting URL: https://eat-drink-memo.web.app
```

- [ ] **Step 5: 確認線上版本正常**

在瀏覽器開啟顯示的 Hosting URL，確認：
1. 首頁正常顯示（Hero + 店家卡片）
2. 店家資料從 Firestore 讀取成功
3. 訪客暱稱功能正常

- [ ] **Step 6: Commit**

```bash
git add firebase.json .firebaserc
git commit -m "feat: configure Firebase Hosting and deploy Phase 1"
```

---

## Phase 1 完成後的狀態

- ✅ 網站在 Firebase Hosting 上線（有公開網址）
- ✅ 首頁：Hero 區塊、店家卡片（從 Firestore 讀取）、佔位區塊
- ✅ 訪客模式：輸入暱稱即可使用
- ✅ Google 登入功能
- ✅ Navbar 顯示登入狀態與登出

## 下一步（Phase 2）

Phase 2 將實作：
- 店家詳細頁（品項列表）
- 品項詳細頁（所有人的評論）
- 新增紀錄表單（糖度、冰塊、配料等動態選項）
- 建議新增功能

Phase 2 計畫在 Phase 1 完成並確認上線後另行產生。
