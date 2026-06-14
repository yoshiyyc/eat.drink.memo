import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileSetupModal() {
  const { user, createProfile } = useAuth();
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('請輸入暱稱');
      return;
    }
    setSaving(true);
    try {
      await createProfile(user.uid, trimmed);
    } catch (err) {
      setError(`儲存失敗：${err.message}`);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-1">設定你的暱稱</h2>
        <p className="text-sm text-gray-500 mb-5">
          這個名字會顯示在你的紀錄上，不會使用你的 Google 真實姓名。
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={nickname}
            onChange={e => { setNickname(e.target.value); if (error) setError(''); }}
            placeholder="輸入暱稱..."
            maxLength={20}
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? '儲存中...' : '開始使用'}
          </button>
        </form>
      </div>
    </div>
  );
}
