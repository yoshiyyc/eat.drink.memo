import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReviewsByUser } from '../services/reviews';

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
              <div className="flex items-center justify-between mb-1">
                <Link
                  to={`/shop/${review.shopId}`}
                  className="text-sm font-medium text-gray-800 hover:text-indigo-600"
                >
                  {review.shopName} · {review.drinkName}
                </Link>
                <StarDisplay rating={review.rating} />
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
