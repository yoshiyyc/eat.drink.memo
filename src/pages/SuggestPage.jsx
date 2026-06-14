import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getShops } from '../services/shops';
import { addSuggestion } from '../services/suggestions';
import { useAuth } from '../contexts/AuthContext';

export default function SuggestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isGuest, displayName, guestName } = useAuth();

  const [shops, setShops] = useState([]);
  const [type, setType] = useState('drink');
  const [form, setForm] = useState({
    shopId: searchParams.get('shopId') ?? '',
    name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getShops().then(setShops);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('請填寫名稱'); return; }
    if (type === 'drink' && !form.shopId) { setError('建議新品項時請選擇所屬店家'); return; }
    if (!isLoggedIn && !isGuest) { setError('請先輸入暱稱或登入'); return; }
    setError('');
    setSubmitting(true);
    try {
      await addSuggestion({
        type,
        name: form.name.trim(),
        shopId: type === 'drink' ? form.shopId : null,
        submittedBy: isLoggedIn ? user.uid : (guestName ?? '匿名'),
        displayName: displayName ?? '匿名',
      });
      setDone(true);
    } catch (err) {
      setError(`送出失敗：${err.message}`);
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-[18px] font-bold mb-2">感謝你的建議！</h2>
        <p className="text-sm text-muted mb-6">管理員審核後會盡快上架。</p>
        <button onClick={() => navigate(-1)} className="text-sm text-accent hover:underline">
          ← 返回
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-[20px] font-bold mb-6">建議新增</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <p className="form-label">建議類型</p>
          <div className="flex gap-2">
            {[
              { value: 'drink', label: '新品項' },
              { value: 'shop', label: '新店家' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setType(opt.value); setForm(f => ({ ...f, shopId: '' })); }}
                className={`option-btn${type === opt.value ? ' active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {type === 'drink' && (
          <div>
            <label className="form-label">所屬店家</label>
            <select
              value={form.shopId}
              onChange={e => setForm(f => ({ ...f, shopId: e.target.value }))}
              className="form-input"
            >
              <option value="">請選擇店家</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="form-label">
            {type === 'drink' ? '飲料名稱' : '店家名稱'}
          </label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={type === 'drink' ? '例如：黑糖珍珠拿鐵' : '例如：清心福全'}
            className="form-input"
          />
        </div>

        {error && <p className="text-sm text-[#e57373]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 text-[15px] font-medium bg-text text-bg disabled:opacity-50"
        >
          {submitting ? '送出中...' : '送出建議'}
        </button>
      </form>
    </div>
  );
}
