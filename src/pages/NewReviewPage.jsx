import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getShops } from '../services/shops';
import { getDrinksByShop } from '../services/drinks';
import { addReview, updateReview, getReviewById } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

function SearchableDrinkSelect({ drinks, value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = drinks.find(d => d.id === value);
  const filtered = drinks.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function onMouseDown(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={open ? query : (selected?.name ?? '')}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(''); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        placeholder="搜尋或選擇飲料"
        className="form-input"
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-10 w-full mt-1 max-h-56 overflow-y-auto bg-bg border border-border shadow-sm">
          {filtered.length > 0 ? filtered.map(drink => (
            <li key={drink.id}>
              <button
                type="button"
                onMouseDown={() => { onChange(drink.id); setOpen(false); setQuery(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-border-light"
              >
                {drink.name}{drink.isSeasonal ? ' 🌿' : ''}
              </button>
            </li>
          )) : (
            <li className="px-3 py-2 text-sm text-muted">沒有符合的飲料</li>
          )}
        </ul>
      )}
    </div>
  );
}

function RadioGroup({ label, options, value, onChange, disabled, note }) {
  return (
    <div>
      <p className="form-label">
        {label}
        {note && <span className="ml-1 text-xs text-muted font-normal">（{note}）</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            className={`option-btn${value === opt ? ' active' : disabled ? ' disabled' : ''}`}
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
      <p className="form-label">{label}（選填）</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`option-btn${value.includes(opt) ? ' active' : ''}`}
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
      <p className="form-label">評分（選填）</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={`text-2xl transition-colors ${n <= (value ?? 0) ? 'text-accent' : 'text-faded'}`}
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
    size: '',
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
            size: review.size ?? '',
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
        setForm(f => ({
          ...f,
          sugar: '',
          ice: '',
          size: shop.sizeOptions?.[0] ?? '',
          toppings: [],
        }));
      }
    }
  }, [form.shopId, shops, isEditMode]);

  // When drink changes, apply fixedOptions and resolve size
  useEffect(() => {
    if (!form.drinkId || !drinks.length || isEditMode) return;
    const drink = drinks.find(d => d.id === form.drinkId);
    if (!drink) return;

    const fixedSugar = drink.fixedOptions?.sugar;
    const fixedIce   = drink.fixedOptions?.ice;
    const sizeOpts   = drink.availableSizes ?? selectedShop?.sizeOptions ?? [];

    setForm(f => ({
      ...f,
      sugar: fixedSugar && fixedSugar !== '固定' ? fixedSugar : '',
      ice:   fixedIce   && fixedIce   !== '固定' ? fixedIce   : '',
      size:  sizeOpts.length === 1
        ? sizeOpts[0]
        : (sizeOpts.includes(f.size) ? f.size : (sizeOpts[0] ?? '')),
    }));
  }, [form.drinkId, drinks]);

  // Derive selected drink and effective options
  const selectedDrink       = drinks.find(d => d.id === form.drinkId) ?? null;
  const fixedSugar          = selectedDrink?.fixedOptions?.sugar ?? null;
  const fixedIce            = selectedDrink?.fixedOptions?.ice   ?? null;
  const effectiveSugarOpts  = selectedDrink?.sugarOptions   ?? selectedShop?.sugarOptions   ?? [];
  const effectiveIceOpts    = selectedDrink?.iceOptions     ?? selectedShop?.iceOptions     ?? [];
  const effectiveSizeOpts   = selectedDrink?.availableSizes ?? selectedShop?.sizeOptions    ?? [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shopId || !form.drinkId) { setError('請選擇店家和飲料'); return; }
    if (!isLoggedIn && !isGuest) { setError('請先輸入暱稱或登入'); return; }
    setError('');
    setSubmitting(true);

    try {
      if (isEditMode) {
        await updateReview(reviewId, {
          sugar:   form.sugar || null,
          ice:     form.ice   || null,
          size:    form.size  || null,
          toppings: form.toppings,
          rating:  form.rating,
          comment: form.comment.trim() || null,
        });
      } else {
        const shop  = shops.find(s => s.id === form.shopId);
        const drink = drinks.find(d => d.id === form.drinkId);
        await addReview({
          shopId:        form.shopId,
          shopName:      shop?.name ?? '',
          drinkId:       form.drinkId,
          drinkName:     drink?.name ?? '',
          userId:        isLoggedIn ? user.uid : null,
          guestNickname: isGuest ? guestName : null,
          displayName:   displayName ?? '匿名',
          sugar:         form.sugar || null,
          ice:           form.ice   || null,
          size:          form.size  || null,
          toppings:      form.toppings,
          rating:        form.rating,
          comment:       form.comment.trim() || null,
          nextTime:      null,
        });
      }
      navigate(form.shopId ? `/shop/${form.shopId}` : '/');
    } catch (err) {
      setError(`送出失敗：${err.message}`);
    }
    setSubmitting(false);
  }

  if (loadingReview) return <div className="p-8 text-sm text-muted">載入中...</div>;
  if (error && !form.shopId) return <div className="p-8 text-sm text-[#e57373]">{error}</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-[20px] font-bold mb-6">
        {isEditMode ? '編輯紀錄' : '新增紀錄'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="form-label">店家</label>
          {isEditMode ? (
            <p className="form-input text-muted">
              {shops.find(s => s.id === form.shopId)?.name ?? '載入中...'}
            </p>
          ) : (
            <select
              value={form.shopId}
              onChange={e => setForm(f => ({ ...f, shopId: e.target.value, drinkId: '' }))}
              className="form-input"
            >
              <option value="">請選擇店家</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          )}
        </div>

        {selectedShop && (
          <div>
            <label className="form-label">飲料</label>
            {isEditMode ? (
              <p className="form-input text-muted">
                {drinks.find(d => d.id === form.drinkId)?.name ?? '載入中...'}
              </p>
            ) : (
              <SearchableDrinkSelect
                drinks={drinks}
                value={form.drinkId}
                onChange={id => setForm(f => ({ ...f, drinkId: id }))}
              />
            )}
          </div>
        )}

        {selectedShop && (
          <>
            {effectiveSugarOpts.length > 0 && (
              <RadioGroup
                label="甜度"
                options={fixedSugar === '固定' ? ['固定'] : effectiveSugarOpts}
                value={fixedSugar === '固定' ? '固定' : form.sugar}
                onChange={v => setForm(f => ({ ...f, sugar: v }))}
                disabled={!!fixedSugar}
                note={fixedSugar && fixedSugar !== '固定' ? '固定' : null}
              />
            )}

            {effectiveIceOpts.length > 0 && (
              <RadioGroup
                label="冰塊"
                options={fixedIce === '固定' ? ['固定'] : effectiveIceOpts}
                value={fixedIce === '固定' ? '固定' : form.ice}
                onChange={v => setForm(f => ({ ...f, ice: v }))}
                disabled={!!fixedIce}
                note={fixedIce && fixedIce !== '固定' ? '固定' : null}
              />
            )}

            {effectiveSizeOpts.length > 0 && (
              <RadioGroup
                label="容量"
                options={effectiveSizeOpts}
                value={form.size}
                onChange={v => setForm(f => ({ ...f, size: v }))}
                disabled={effectiveSizeOpts.length === 1}
                note={effectiveSizeOpts.length === 1 ? '固定' : null}
              />
            )}

            {selectedShop.toppingOptions?.length > 0 && (
              <CheckboxGroup
                label="配料"
                options={selectedShop.toppingOptions}
                value={form.toppings}
                onChange={v => setForm(f => ({ ...f, toppings: v }))}
              />
            )}
          </>
        )}

        <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />

        <div>
          <label className="form-label">留言（選填）</label>
          <textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            placeholder="這杯怎麼樣呢？"
            rows={3}
            className="form-input resize-none"
          />
        </div>

        {error && <p className="text-sm text-[#e57373]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 text-[15px] font-medium bg-text text-bg disabled:opacity-50"
        >
          {submitting ? '送出中...' : isEditMode ? '儲存變更' : '送出紀錄'}
        </button>

      </form>
    </div>
  );
}
