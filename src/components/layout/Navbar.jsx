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

      <nav
        className="px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--color-text)', background: 'var(--color-bg)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="tracking-tight"
            style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}
          >
            eat.drink.memo
          </Link>

          <div className="flex items-center gap-3" ref={dropdownRef}>
            <Link
              to="/new-review"
              className="px-3 py-1.5"
              style={{
                fontSize: '12px',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                fontWeight: 500,
              }}
            >
              + 記錄這杯
            </Link>

            <div className="relative">
              <button
                onClick={handleAvatarClick}
                className="w-8 h-8 rounded-full overflow-hidden focus:outline-none"
                aria-label="帳號選單"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--color-border)' }}
                  >
                    <svg className="w-4 h-4" style={{ color: 'var(--color-muted)' }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
