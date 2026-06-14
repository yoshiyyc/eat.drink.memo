import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShops } from '../services/shops';
import { getLatestReviews, getWeeklyTrending } from '../services/reviews';

function StarDisplay({ rating }) {
  if (!rating) return null;
  return <span className="text-yellow-400 text-xs">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getShops(),
      getLatestReviews(5),
      getWeeklyTrending(5).catch(() => []),
    ]).then(([shopsData, reviewsData, trendingData]) => {
      setShops(shopsData);
      setReviews(reviewsData);
      setTrending(trendingData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const topShops = shops.slice(0, 5);
  const hasMore = shops.length > 5;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      <section className="bg-indigo-600 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">喝什麼好呢？</h1>
        <p className="text-indigo-200 mb-6">記錄你喝過的飲料，找到下一杯最愛</p>
        <input
          type="text"
          placeholder="搜尋店家或飲料..."
          className="w-full max-w-md mx-auto block bg-white text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none mb-4"
          readOnly
        />
        <div className="flex gap-2 justify-center flex-wrap">
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors">
            熱門
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors">
            最新
          </button>
          <Link
            to="/new-review"
            className="bg-white text-indigo-600 font-medium px-4 py-1.5 rounded-full text-sm hover:bg-indigo-50 transition-colors"
          >
            + 記錄這杯
          </Link>
        </div>
      </section>

      {/* Shop Grid */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg">店家</h2>
          {hasMore && (
            <Link to="/shops" className="text-indigo-600 text-sm hover:underline">看全部 →</Link>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <p className="text-gray-400 text-sm">尚未有店家資料</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {topShops.map(shop => (
              <Link
                key={shop.id}
                to={`/shop/${shop.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md hover:border-indigo-200 transition-all"
              >
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-10 h-10 mx-auto mb-2 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 rounded-full mx-auto mb-2" />
                )}
                <p className="text-sm font-medium text-gray-800">{shop.name}</p>
              </Link>
            ))}
            {hasMore && (
              <Link
                to="/shops"
                className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm hover:bg-gray-100 hover:text-indigo-500 transition-colors flex items-center justify-center"
              >
                +更多
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Weekly Trending */}
      <section className="mb-8">
        <h2 className="font-bold text-gray-800 text-lg mb-4">🔥 這週大家在喝</h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-12 animate-pulse" />
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">這週還沒有紀錄，快來第一個！</p>
            <Link to="/new-review" className="text-indigo-600 text-sm hover:underline">
              立即記錄 →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {trending.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm font-bold text-gray-400 w-5 text-right">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400">{item.shopName}</span>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.drinkName}</p>
                </div>
                <span className="text-sm text-indigo-600 font-medium whitespace-nowrap">×{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest Reviews */}
      <section>
        <h2 className="font-bold text-gray-800 text-lg mb-4">最新紀錄</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">還沒有紀錄，成為第一個留下心得的人！</p>
            <Link to="/new-review" className="text-indigo-600 text-sm hover:underline">
              立即記錄 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <Link
                key={review.id}
                to={`/shop/${review.shopId}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{review.displayName}</span>
                  <StarDisplay rating={review.rating} />
                </div>
                <p className="text-sm text-gray-500">
                  <span className="text-gray-700 font-medium">{review.shopName}</span>
                  {' · '}
                  {review.drinkName}
                </p>
                {review.comment && (
                  <p className="text-sm text-gray-400 mt-1 truncate">{review.comment}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
