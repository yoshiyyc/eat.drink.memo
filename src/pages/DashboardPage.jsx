import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReviewsByUser, deleteReview } from '../services/reviews';

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

export default function DashboardPage() {
  const { user, isLoggedIn, displayName } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    getReviewsByUser(user.uid)
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn, user, navigate]);

  async function handleDelete(review) {
    if (!window.confirm(`確定要刪除「${review.drinkName}」這筆紀錄嗎？`)) return;
    try {
      await deleteReview(review.id, review.shopId);
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold">我的紀錄</h1>
        <span className="text-sm text-muted">{displayName}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-border-light" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div>
          <p className="text-sm text-muted mb-4">還沒有紀錄</p>
          <Link
            to="/new-review"
            className="inline-block px-4 py-2 text-sm font-medium bg-text text-bg"
          >
            新增第一筆紀錄
          </Link>
        </div>
      ) : (
        <div>
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className={`py-3 ${i < reviews.length - 1 ? 'border-b border-border-light' : ''}`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <Link
                  to={`/shop/${review.shopId}`}
                  className="text-[15px] font-semibold hover:text-accent"
                >
                  <span className="text-accent">{review.shopName}</span>
                  <span className="font-normal text-border mx-1">·</span>
                  {review.drinkName}
                </Link>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <StarDisplay rating={review.rating} />
                  <span className="text-[13px] text-muted">{formatDate(review.createdAt)}</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
