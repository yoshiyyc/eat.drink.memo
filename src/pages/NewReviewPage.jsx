import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getShops } from '../services/shops';
import { getDrinksByShop } from '../services/drinks';
import { addReview, updateReview, getReviewById } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

const SIZES = ['中', '大'];

function RadioGroup({ label, options, value, onChange, disabled }) {
  return (
    <div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            style={{
              padding: '6px 14px',
              fontSize: '14px',
              border: value === opt
                ? '1px solid var(--color-text)'
                : disabled
                ? '1px solid var(--color-border-light)'
                : '1px solid var(--color-border)',
              background: value === opt ? 'var(--color-text)' : 'transparent',
              color: value === opt
                ? 'var(--color-bg)'
                : disabled
                ? 'var(--color-muted)'
                : 'var(--color-text)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, value, onChange }) {
  function toggle(opt) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }
  return (
    <div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>{label}（選填）</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '6px 14px',
              fontSize: '14px',
              border: value.includes(opt) ? '1px solid var(--color-text)' : '1px solid var(--color-border)',
              background: value.includes(opt) ? 'var(--color-text)' : 'transparent',
              color: value.includes(opt) ? 'var(--color-bg)' : 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>評分（選填）</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className="text-2xl transition-colors"
            style={{ color: n <= (value ?? 0) ? 'var(--color-accent)' : 'var(--color-faded)' }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isGuest, displayName, guestName } = useAuth();

  const reviewId = searchParams.get('reviewId');
  const isEditMode = !!reviewId;

  const [shops, setShops] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingReview, setLoadingReview] = useState(isEditMode);

  const [form, setForm] = useState({
    shopId: searchParams.get('shopId') ?? '',
    drinkId: searchParams.get('drinkId') ?? '',
    sugar: '',
    ice: '',
    size: '中',
    toppings: [],
    rating: null,
    comment: '',
  });

  useEffect(() => {
    getShops().then(setShops);
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    getReviewById(reviewId)
      .then(review => {
        if (review) {
          if (user && review.userId !== user.uid) {
            setError('你沒有權限編輯這筆紀錄。');
            setLoadingReview(false);
            return;
          }
          setForm({
            shopId: review.shopId,
            drinkId: review.drinkId,
            sugar: review.sugar ?? '',
            ice: review.ice ?? '',
            size: review.size ?? '中',
            toppings: review.toppings ?? [],
            rating: review.rating ?? null,
            comment: review.comment ?? '',
          });
        }
        setLoadingReview(false);
      })
      .catch(() => {
        setLoadingReview(false);
        setError('無法載入紀錄，請重試。');
      });
  }, [reviewId, isEditMode]);

  useEffect(() => {
    if (!form.shopId) {
      setSelectedShop(null);
      setDrinks([]);
      return;
    }
    const shop = shops.find(s => s.id === form.shopId);
    setSelectedShop(shop ?? null);
    if (shop) {
      getDrinksByShop(form.shopId).then(setDrinks);
      if (!isEditMode) {
        setForm(f => ({ ...f, sugar: '', ice: '', toppings: [] }));
      }
    }
  }, [form.shopId, shops, isEditMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shopId || !form.drinkId) {
      setError('請選擇店家和飲料');
      return;
    }
    if (!isLoggedIn && !isGuest) {
      setError('請先輸入暱稱或登入');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      if (isEditMode) {
        await updateReview(reviewId, {
          sugar: form.sugar || null,
          ice: form.ice || null,
          size: form.size,
          toppings: form.toppings,
          rating: form.rating,
          comment: form.comment.trim() || null,
        });
      } else {
        const shop = shops.find(s => s.id === form.shopId);
        const drink = drinks.find(d => d.id === form.drinkId);
        await addReview({
          shopId: form.shopId,
          shopName: shop?.name ?? '',
          drinkId: form.drinkId,
          drinkName: drink?.name ?? '',
          userId: isLoggedIn ? user.uid : null,
          guestNickname: isGuest ? guestName : null,
          displayName: displayName ?? '匿名',
          sugar: form.sugar || null,
          ice: form.ice || null,
          size: form.size,
          toppings: form.toppings,
          rating: form.rating,
          comment: form.comment.trim() || null,
          nextTime: null,
        });
      }
      navigate(form.shopId ? `/shop/${form.shopId}` : '/');
    } catch (err) {
      setError(`送出失敗：${err.message}`);
    }
    setSubmitting(false);
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid var(--color-border)',
    padding: '8px 12px',
    fontSize: '14px',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    outline: 'none',
  };

  if (loadingReview) return <div className="p-8" style={{ fontSize: '14px', color: 'var(--color-muted)' }}>載入中...</div>;
  if (error && !form.shopId) return <div className="p-8" style={{ fontSize: '14px', color: '#e57373' }}>{error}</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-bold mb-6" style={{ fontSize: '20px', color: 'var(--color-text)' }}>
        {isEditMode ? '編輯紀錄' : '新增紀錄'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 店家 */}
        <div>
          <label className="block font-medium mb-2" style={{ fontSize: '14px', color: 'var(--color-text)' }}>店家</label>
          {isEditMode ? (
            <p style={{ ...inputStyle, color: 'var(--color-muted)' }}>
              {shops.find(s => s.id === form.shopId)?.name ?? '載入中...'}
            </p>
          ) : (
            <select
              value={form.shopId}
              onChange={e => setForm(f => ({ ...f, shopId: e.target.value, drinkId: '' }))}
              style={inputStyle}
            >
              <option value="">請選擇店家</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* 飲料 */}
        {selectedShop && (
          <div>
            <label className="block font-medium mb-2" style={{ fontSize: '14px', color: 'var(--color-text)' }}>飲料</label>
            {isEditMode ? (
              <p style={{ ...inputStyle, color: 'var(--color-muted)' }}>
                {drinks.find(d => d.id === form.drinkId)?.name ?? '載入中...'}
              </p>
            ) : (
              <select
                value={form.drinkId}
                onChange={e => setForm(f => ({ ...f, drinkId: e.target.value }))}
                style={inputStyle}
              >
                <option value="">請選擇飲料</option>
                {drinks.map(drink => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name}{drink.isSeasonal ? ' 🌿' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* 客製選項 */}
        {selectedShop?.sugarOptions?.length > 0 && (
          <RadioGroup
            label="甜度"
            options={selectedShop.sugarOptions}
            value={form.sugar}
            onChange={v => setForm(f => ({ ...f, sugar: v }))}
          />
        )}
        {selectedShop?.iceOptions?.length > 0 && (
          <RadioGroup
            label="冰塊"
            options={selectedShop.iceOptions}
            value={form.ice}
            onChange={v => setForm(f => ({ ...f, ice: v }))}
          />
        )}
        <RadioGroup
          label="容量"
          options={SIZES}
          value={form.size}
          onChange={v => setForm(f => ({ ...f, size: v }))}
        />
        {selectedShop?.toppingOptions?.length > 0 && (
          <CheckboxGroup
            label="配料"
            options={selectedShop.toppingOptions}
            value={form.toppings}
            onChange={v => setForm(f => ({ ...f, toppings: v }))}
          />
        )}

        {/* 評分 & 留言 */}
        <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
        <div>
          <label className="block font-medium mb-2" style={{ fontSize: '14px', color: 'var(--color-text)' }}>留言（選填）</label>
          <textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            placeholder="這杯怎麼樣呢？"
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        {error && <p style={{ fontSize: '14px', color: '#e57373' }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 font-medium disabled:opacity-50"
          style={{
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            fontSize: '15px',
          }}
        >
          {submitting ? '送出中...' : isEditMode ? '儲存變更' : '送出紀錄'}
        </button>

      </form>
    </div>
  );
}
