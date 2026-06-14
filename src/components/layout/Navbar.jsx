import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSetupModal from '../ProfileSetupModal';

export default function Navbar() {
  const { isLoggedIn, isGuest, displayName, signInWithGoogle, signOut, setGuest, needsProfileSetup } = useAuth();
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
    <>
      {needsProfileSetup && <ProfileSetupModal />}

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
    </>
  );
}
