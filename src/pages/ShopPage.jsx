import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShopById } from '../services/shops';
import { getDrinksByShop } from '../services/drinks';
import { getReviewsByShop, deleteReview } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

function SectionLabel({ children }) {
  return (
    <div className="mb-3">
      <p className="section-label">{children}</p>
      <div className="h-px bg-border" />
    </div>
  );
}

function StarDisplay({ rating }) {
  if (!rating) return null;
  return (
    <span className="text-sm">
      <span className="text-accent">{'★'.repeat(rating)}</span>
      <span className="text-faded">{'☆'.repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  if (d.getFullYear() === now.getFullYear()) return `${mm}.${dd}`;
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export default function ShopPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drinkSearch, setDrinkSearch] = useState('');

  function pageSize() {
    return window.matchMedia('(min-width: 640px)').matches ? 30 : 20;
  }
  const [visibleCount, setVisibleCount] = useState(() => pageSize());

  useEffect(() => {
    async function load() {
      const shopData = await getShopById(id);
      setShop(shopData);
      if (shopData) {
        const [drinksData, reviewsData] = await Promise.all([
          getDrinksByShop(id).catch(() => []),
          getReviewsByShop(id, 10).catch(() => []),
        ]);
        setDrinks(drinksData);
        setReviews(reviewsData);
      }
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, [id]);

  async function handleDelete(review) {
    if (!window.confirm(`確定要刪除「${review.drinkName}」這筆紀錄嗎？`)) return;
    try {
      await deleteReview(review.id, review.shopId);
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  }

  if (loading) return <div className="p-8 text-sm text-muted">載入中...</div>;
  if (!shop) return <div className="p-8 text-sm text-muted">找不到店家</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* 店家 Header */}
      <div className="flex items-center gap-4">
        {shop.logoUrl ? (
          <img src={shop.logoUrl} alt={shop.name} className="w-14 h-14 object-contain shrink-0" />
        ) : (
          <div className="w-14 h-14 shrink-0 bg-border-light" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] font-bold">{shop.name}</h1>
          <p className="text-[13px] text-muted">{shop.reviewCount ?? 0} 筆紀錄</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/new-review?shopId=${id}`}
            className="px-4 py-2 text-[13px] font-medium bg-text text-bg"
          >
            紀錄品項
          </Link>
          <Link
            to={`/suggest?shopId=${id}`}
            className="px-4 py-2 text-[13px] border border-border text-muted"
          >
            建議新品項
          </Link>
        </div>
      </div>

      {/* 飲料清單 */}
      <section>
        <SectionLabel>飲料清單</SectionLabel>
        {drinks.length === 0 ? (
          <p className="text-sm text-muted">尚無飲料資料</p>
        ) : (() => {
          const filtered = drinks.filter(d =>
            d.name.toLowerCase().includes(drinkSearch.toLowerCase())
          );
          const display = filtered.slice(0, visibleCount);
          const hasMore = filtered.length > visibleCount;
          return (
            <>
              <input
                type="text"
                value={drinkSearch}
                onChange={e => { setDrinkSearch(e.target.value); setVisibleCount(pageSize()); }}
                placeholder="搜尋飲料..."
                className="form-input mb-3"
              />
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {display.map(drink => (
                    <Link
                      key={drink.id}
                      to={`/drink/${drink.id}`}
                      className="flex items-center justify-between px-3 py-2 text-sm border border-border"
                    >
                      <span>{drink.name}</span>
                      {drink.isSeasonal && (
                        <span className="text-[11px] text-accent">季節</span>
                      )}
                    </Link>
                  ))}
                </div>
                {hasMore && (
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
                )}
              </div>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(c => c + pageSize())}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-2 text-[13px] text-muted hover:text-text transition-colors"
                >
                  展開更多
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </>
          );
        })()}
      </section>

      {/* 大家的紀錄 */}
      <section>
        <SectionLabel>大家的紀錄</SectionLabel>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">
            還沒有紀錄，{' '}
            <Link to={`/new-review?shopId=${id}`} className="text-accent">成為第一個！</Link>
          </p>
        ) : (
          <div>
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className={`py-3 ${i < reviews.length - 1 ? 'border-b border-border-light' : ''}`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[15px] font-semibold">{review.displayName || '訪客'}</span>
                  <div className="flex items-center gap-3">
                    <StarDisplay rating={review.rating} />
                    {review.createdAt && (
                      <span className="text-[13px] text-muted">{formatDate(review.createdAt)}</span>
                    )}
                  </div>
                </div>
                <p className="text-[15px] font-semibold mb-1">
                  {review.drinkName}
                  {review.sugar && <span className="font-normal text-muted ml-1">· {review.sugar}</span>}
                  {review.ice && <span className="font-normal text-muted ml-1">· {review.ice}</span>}
                  {review.toppings?.length > 0 && <span className="font-normal text-muted ml-1">· {review.toppings.join('、')}</span>}
                </p>
                {review.comment && (
                  <p className="text-sm text-[#666]">「{review.comment}」</p>
                )}
                {user && review.userId === user.uid && (
                  <div className="flex gap-3 mt-1">
                    <Link
                      to={`/new-review?reviewId=${review.id}&shopId=${review.shopId}&drinkId=${review.drinkId}`}
                      className="text-xs text-accent"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(review)}
                      className="text-xs text-[#e57373]"
                    >
                      刪除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
