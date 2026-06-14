import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDrinkById } from '../services/drinks';
import { getShopById } from '../services/shops';
import { getReviewsByDrink, deleteReview } from '../services/reviews';
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

export default function DrinkPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [drink, setDrink] = useState(null);
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const drinkData = await getDrinkById(id);
      setDrink(drinkData);
      if (drinkData) {
        const [shopData, reviewsData] = await Promise.all([
          getShopById(drinkData.shopId).catch(() => null),
          getReviewsByDrink(id).catch(() => []),
        ]);
        setShop(shopData);
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
  if (!drink) return <div className="p-8 text-sm text-muted">找不到品項</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* 麵包屑 */}
      {shop && (
        <div className="text-sm text-muted">
          <Link to={`/shop/${shop.id}`} className="text-accent">{shop.name}</Link>
          <span className="mx-1">›</span>
          <span>{drink.name}</span>
        </div>
      )}

      {/* 品項 Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold">{drink.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {shop?.name}
            {drink.isSeasonal && (
              <span className="ml-2 text-[11px] text-accent">季節限定</span>
            )}
          </p>
        </div>
        <Link
          to={`/new-review?shopId=${drink.shopId}&drinkId=${id}`}
          className="px-4 py-2 whitespace-nowrap text-[13px] font-medium bg-text text-bg"
        >
          紀錄這杯
        </Link>
      </div>

      {/* 評論列表 */}
      <section>
        <SectionLabel>
          大家的紀錄{reviews.length > 0 && (
            <span className="font-normal ml-[6px] text-[13px]">{reviews.length} 筆</span>
          )}
        </SectionLabel>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">
            還沒有人紀錄這杯，{' '}
            <Link to={`/new-review?shopId=${drink.shopId}&drinkId=${id}`} className="text-accent">
              成為第一個！
            </Link>
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
                {(review.sugar || review.ice || review.size || review.toppings?.length > 0) && (
                  <p className="text-[13px] text-muted mb-1">
                    {[review.sugar, review.ice, review.size && `${review.size}杯`]
                      .filter(Boolean)
                      .join(' · ')}
                    {review.toppings?.length > 0 && ` · ${review.toppings.join('、')}`}
                  </p>
                )}
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
