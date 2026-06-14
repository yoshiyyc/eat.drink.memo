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
