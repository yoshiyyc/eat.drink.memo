import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShopById } from '../services/shops';
import { getDrinksByShop } from '../services/drinks';
import { getReviewsByShop, deleteReview } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

function SectionLabel({ children }) {
  return (
    <div className="mb-3">
      <p style={{
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--color-accent)',
        marginBottom: '6px',
      }}>
        {children}
      </p>
      <div style={{ height: '1px', background: 'var(--color-border)' }} />
    </div>
  );
}

function StarDisplay({ rating }) {
  if (!rating) return null;
  return (
    <span className="text-sm">
      <span style={{ color: 'var(--color-accent)' }}>{'★'.repeat(rating)}</span>
      <span style={{ color: 'var(--color-faded)' }}>{'☆'.repeat(5 - rating)}</span>
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

  if (loading) return <div className="p-8" style={{ fontSize: '14px', color: 'var(--color-muted)' }}>載入中...</div>;
  if (!shop) return <div className="p-8" style={{ fontSize: '14px', color: 'var(--color-muted)' }}>找不到店家</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* 店家 Header */}
      <div className="flex items-center gap-4">
        {shop.logoUrl ? (
          <img src={shop.logoUrl} alt={shop.name} className="w-14 h-14 object-contain flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 flex-shrink-0" style={{ background: 'var(--color-border-light)' }} />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold" style={{ fontSize: '22px', color: 'var(--color-text)' }}>{shop.name}</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{shop.reviewCount ?? 0} 筆紀錄</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to={`/new-review?shopId=${id}`}
            className="px-4 py-2"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
            }}
          >
            紀錄品項
          </Link>
          <Link
            to={`/suggest?shopId=${id}`}
            className="px-4 py-2"
            style={{
              fontSize: '13px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            建議新品項
          </Link>
        </div>
      </div>

      {/* 飲料清單 */}
      <section>
        <SectionLabel>飲料清單</SectionLabel>
        {drinks.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>尚無飲料資料</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {drinks.map(drink => (
              <Link
                key={drink.id}
                to={`/drink/${drink.id}`}
                className="flex items-center justify-between px-3 py-2"
                style={{
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                }}
              >
                <span>{drink.name}</span>
                {drink.isSeasonal && (
                  <span style={{ fontSize: '11px', color: 'var(--color-accent)' }}>季節</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 大家的紀錄 */}
      <section>
        <SectionLabel>大家的紀錄</SectionLabel>
        {reviews.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
            還沒有紀錄，{' '}
            <Link to={`/new-review?shopId=${id}`} style={{ color: 'var(--color-accent)' }}>
              成為第一個！
            </Link>
          </p>
        ) : (
          <div>
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className="py-3"
                style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {review.displayName || '訪客'}
                  </span>
                  <div className="flex items-center gap-3">
                    <StarDisplay rating={review.rating} />
                    {review.createdAt && (
                      <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                        {formatDate(review.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-1" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                  {review.drinkName}
                  {review.sugar && (
                    <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: '4px' }}>· {review.sugar}</span>
                  )}
                  {review.ice && (
                    <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: '4px' }}>· {review.ice}</span>
                  )}
                  {review.toppings?.length > 0 && (
                    <span style={{ fontWeight: 400, color: 'var(--color-muted)', marginLeft: '4px' }}>· {review.toppings.join('、')}</span>
                  )}
                </p>
                {review.comment && (
                  <p style={{ fontSize: '14px', color: '#666' }}>「{review.comment}」</p>
                )}
                {user && review.userId === user.uid && (
                  <div className="flex gap-3 mt-1">
                    <Link
                      to={`/new-review?reviewId=${review.id}&shopId=${review.shopId}&drinkId=${review.drinkId}`}
                      style={{ fontSize: '12px', color: 'var(--color-accent)' }}
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(review)}
                      style={{ fontSize: '12px', color: '#e57373' }}
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
