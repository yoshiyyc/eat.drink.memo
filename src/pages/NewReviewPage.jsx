// src/pages/NewReviewPage.jsx
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
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              value === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : disabled
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
            }`}
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
      <p className="text-sm font-medium text-gray-700 mb-2">{label}（選填）</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              value.includes(opt)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
            }`}
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
      <p className="text-sm font-medium text-gray-700 mb-2">評分（選填）</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={`text-2xl transition-colors ${n <= (value ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`}
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
    getReviewById(reviewId).then(review => {
      if (review) {
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

  if (loadingReview) return <div className="p-8 text-gray-400 text-sm">載入中...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {isEditMode ? '編輯紀錄' : '新增紀錄'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 店家（編輯模式鎖定） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">店家</label>
          {isEditMode ? (
            <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              {shops.find(s => s.id === form.shopId)?.name ?? '載入中...'}
            </p>
          ) : (
            <select
              value={form.shopId}
              onChange={e => setForm(f => ({ ...f, shopId: e.target.value, drinkId: '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            >
              <option value="">請選擇店家</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* 飲料（編輯模式鎖定） */}
        {selectedShop && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">飲料</label>
            {isEditMode ? (
              <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {drinks.find(d => d.id === form.drinkId)?.name ?? '載入中...'}
              </p>
            ) : (
              <select
                value={form.drinkId}
                onChange={e => setForm(f => ({ ...f, drinkId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">留言（選填）</label>
          <textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            placeholder="這杯怎麼樣呢？"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '送出中...' : isEditMode ? '儲存變更' : '送出紀錄'}
        </button>
      </form>
    </div>
  );
}
