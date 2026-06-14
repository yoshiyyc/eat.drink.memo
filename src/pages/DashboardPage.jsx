import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReviewsByUser, deleteReview } from '../services/reviews';

function StarDisplay({ rating }) {
  if (!rating) return null;
  return <span className="text-yellow-400 text-sm">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
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
        <h1 className="text-xl font-bold text-gray-900">我的紀錄</h1>
        <span className="text-sm text-gray-500">{displayName}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm mb-4">還沒有紀錄</p>
          <Link
            to="/new-review"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            新增第一筆紀錄
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-1">
                <Link
                  to={`/shop/${review.shopId}`}
                  className="text-sm font-medium text-gray-800 hover:text-indigo-600"
                >
                  {review.shopName} · {review.drinkName}
                </Link>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <StarDisplay rating={review.rating} />
                  <Link
                    to={`/new-review?reviewId=${review.id}&shopId=${review.shopId}&drinkId=${review.drinkId}`}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    編輯
                  </Link>
                  <button
                    onClick={() => handleDelete(review)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    刪除
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                {[review.sugar, review.ice, review.size && `${review.size}杯`]
                  .filter(Boolean)
                  .join(' · ')}
                {review.toppings?.length > 0 && ` · ${review.toppings.join('、')}`}
              </p>
              {review.comment && (
                <p className="text-sm text-gray-500">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
