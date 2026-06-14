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
    if (!trimmed) { setError('請輸入暱稱'); return; }
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
      <div className="bg-bg border border-border w-full max-w-sm p-6">
        <h2 className="text-[18px] font-bold mb-1">設定你的暱稱</h2>
        <p className="text-sm text-muted mb-5">
          這個名字會顯示在你的紀錄上，不會使用你的 Google 真實姓名。
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={nickname}
            onChange={e => { setNickname(e.target.value); if (error) setError(''); }}
            placeholder="輸入暱稱..."
            maxLength={20}
            autoFocus
            className="form-input"
          />
          {error && <p className="text-xs text-[#e57373]">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 text-sm font-medium bg-text text-bg disabled:opacity-50"
          >
            {saving ? '儲存中...' : '開始使用'}
          </button>
        </form>
      </div>
    </div>
  );
}
