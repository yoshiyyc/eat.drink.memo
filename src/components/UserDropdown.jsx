import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function UserDropdown({ onClose }) {
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut();
    onClose();
  }

  return (
    <div className="absolute right-0 top-full mt-1 bg-bg border border-border py-1 min-w-[120px] z-40">
      <Link
        to="/dashboard"
        onClick={onClose}
        className="block px-4 py-2 text-sm text-muted hover:text-text"
      >
        我的紀錄
      </Link>
      <button
        onClick={handleSignOut}
        className="w-full text-left px-4 py-2 text-sm text-muted hover:text-text"
      >
        登出
      </button>
    </div>
  );
}
