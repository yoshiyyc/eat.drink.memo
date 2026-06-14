// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSetupModal from '../ProfileSetupModal';
import WelcomeModal from '../WelcomeModal';
import UserDropdown from '../UserDropdown';

export default function Navbar() {
  const { user, profile, isLoggedIn, isGuest, displayName, needsProfileSetup, needsGuestSetup } = useAuth();
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

          <div className="flex items-center gap-2" ref={dropdownRef}>
            {(isLoggedIn || isGuest) && displayName && (
              <span className="hidden sm:block text-sm text-gray-600">{displayName}</span>
            )}
            <div className="relative">
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
        </div>
      </nav>
    </>
  );
}
