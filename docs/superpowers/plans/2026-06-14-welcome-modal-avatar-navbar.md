# Welcome Modal + Avatar Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 進站自動顯示歡迎 modal（Google 登入或訪客），Navbar 全改為 avatar 入口，已登入則顯示 dropdown。

**Architecture:** AuthContext 加 `needsGuestSetup` flag；新增 WelcomeModal（入站選擇）和 UserDropdown（已登入 dropdown）兩個元件；Navbar 移除所有文字按鈕，改為單一 avatar 按鈕控制所有 auth 流程。

**Tech Stack:** React 18, React Router v6, Tailwind CSS v4, Firebase Auth

---

## 檔案結構

| 動作 | 路徑 | 說明 |
|------|------|------|
| 修改 | `src/contexts/AuthContext.jsx` | 加入 `needsGuestSetup` |
| 新增 | `src/components/WelcomeModal.jsx` | 入站歡迎 modal |
| 新增 | `src/components/UserDropdown.jsx` | 已登入 avatar dropdown |
| 修改 | `src/components/layout/Navbar.jsx` | 全改為 avatar 入口 |

---

### Task 1：AuthContext 加入 `needsGuestSetup`

**Files:**
- Modify: `src/contexts/AuthContext.jsx`

- [ ] **Step 1：在 value 物件加入 `needsGuestSetup`**

找到 `src/contexts/AuthContext.jsx` 中的 `const value = {` 區塊，加入一行：

```javascript
const value = {
  user,
  profile,
  guestName,
  isLoggedIn: !!user,
  isGuest: !user && !!guestName,
  displayName: profile?.displayName ?? guestName ?? user?.email ?? null,
  needsProfileSetup: !!user && !profile,
  needsGuestSetup: !user && !guestName,   // ← 新增這行
  signInWithGoogle,
  createProfile,
  setGuest,
  signOut: handleSignOut,
};
```

- [ ] **Step 2：Commit**

```bash
git add src/contexts/AuthContext.jsx
git commit -m "feat: add needsGuestSetup flag to AuthContext"
```

---

### Task 2：WelcomeModal 元件

**Files:**
- Create: `src/components/WelcomeModal.jsx`

- [ ] **Step 1：建立 WelcomeModal.jsx**

```jsx
// src/components/WelcomeModal.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeModal({ onClose }) {
  const { signInWithGoogle, setGuest } = useAuth();
  const [nickname, setNickname] = useState('匿名');
  const [loggingIn, setLoggingIn] = useState(false);

  function handleClose() {
    setGuest('匿名');
    onClose?.();
  }

  async function handleGoogleLogin() {
    setLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setLoggingIn(false);
    }
  }

  function handleGuestSubmit(e) {
    e.preventDefault();
    setGuest(nickname.trim() || '匿名');
    onClose?.();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">歡迎使用 eat.drink.memo</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loggingIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.49-1.63.78-2.7.78-2.07 0-3.83-1.4-4.46-3.29H1.88v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.52 10.53c-.16-.48-.25-.98-.25-1.53s.09-1.06.25-1.53V5.4H1.88A8 8 0 0 0 .98 9c0 1.29.31 2.51.9 3.6l2.64-2.07z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.1 4.4l2.64 2.07c.63-1.89 2.39-3.29 4.46-3.29z"/>
          </svg>
          {loggingIn ? '登入中...' : '使用 Google 登入'}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">或</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleGuestSubmit} className="space-y-3">
          <p className="text-sm text-gray-600">以訪客繼續</p>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            繼續
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2：Commit**

```bash
git add src/components/WelcomeModal.jsx
git commit -m "feat: add WelcomeModal for first-visit onboarding"
```

---

### Task 3：UserDropdown 元件

**Files:**
- Create: `src/components/UserDropdown.jsx`

- [ ] **Step 1：建立 UserDropdown.jsx**

```jsx
// src/components/UserDropdown.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserDropdown({ onClose }) {
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut();
    onClose();
  }

  return (
    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[120px] z-40">
      <Link
        to="/dashboard"
        onClick={onClose}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        我的紀錄
      </Link>
      <button
        onClick={handleSignOut}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        登出
      </button>
    </div>
  );
}
```

- [ ] **Step 2：Commit**

```bash
git add src/components/UserDropdown.jsx
git commit -m "feat: add UserDropdown for logged-in avatar menu"
```

---

### Task 4：Navbar 全改為 avatar 入口

**Files:**
- Modify: `src/components/layout/Navbar.jsx`

- [ ] **Step 1：完整替換 Navbar.jsx**

```jsx
// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSetupModal from '../ProfileSetupModal';
import WelcomeModal from '../WelcomeModal';
import UserDropdown from '../UserDropdown';

export default function Navbar() {
  const { user, profile, isLoggedIn, needsProfileSetup, needsGuestSetup } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(e) {
      if (!dropdownRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const avatarSrc = profile?.avatarUrl ?? user?.photoURL ?? null;

  function handleAvatarClick() {
    if (isLoggedIn) {
      setShowDropdown(v => !v);
    } else {
      setShowWelcomeModal(true);
    }
  }

  return (
    <>
      {needsProfileSetup && <ProfileSetupModal />}
      {!user && (needsGuestSetup || showWelcomeModal) && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-tight text-gray-900">
            eat.drink.memo
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleAvatarClick}
              className="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
              aria-label="帳號選單"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {isLoggedIn && showDropdown && (
              <UserDropdown onClose={() => setShowDropdown(false)} />
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 2：Commit**

```bash
git add src/components/layout/Navbar.jsx
git commit -m "feat: replace navbar text buttons with avatar entry point"
```

---

### Task 5：Dev 驗證

- [ ] **Step 1：啟動 dev server**

```bash
npm run dev
```

- [ ] **Step 2：測試第一次進站流程**

1. 清除 localStorage（DevTools → Application → Local Storage → 全刪）
2. 重整頁面
3. 預期：WelcomeModal 自動出現，有 Google 登入按鈕 + 訪客名稱 input（預填「匿名」）
4. 點 X → modal 消失，localStorage 有 `edm_guest_nickname = 匿名`
5. 重整頁面 → modal 不再出現

- [ ] **Step 3：測試訪客流程**

1. 清除 localStorage，重整
2. WelcomeModal 出現 → 改名為「測試用戶」→ 點「繼續」
3. modal 消失
4. 點 Navbar 右側灰色頭像 → WelcomeModal 重開（可改名或登入）

- [ ] **Step 4：測試已登入流程**

1. 點「使用 Google 登入」完成登入
2. Navbar 右側出現 Google 頭像
3. 點頭像 → 出現 dropdown（我的紀錄、登出）
4. 點 dropdown 外部 → dropdown 關閉
5. 點「我的紀錄」→ 跳至 `/dashboard`
6. 點「登出」→ 登出，頭像變回灰色

- [ ] **Step 5：確認 RWD**

1. DevTools 切至手機尺寸（375px）
2. Navbar 仍顯示 logo 和頭像，不破版
3. WelcomeModal input 可正常輸入（touch-friendly）
