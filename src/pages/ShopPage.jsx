import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShopById } from '../services/shops';
import { getDrinksByShop } from '../services/drinks';
import { getReviewsByShop, deleteReview } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';

function StarDisplay({ rating }) {
  if (!rating) return null;
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
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

  if (loading) return <div className="p-8 text-gray-400 text-sm">載入中...</div>;
  if (!shop) return <div className="p-8 text-gray-400 text-sm">找不到店家</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* 店家 Header */}
      <div className="flex items-center gap-4 mb-6">
        {shop.logoUrl ? (
          <img src={shop.logoUrl} alt={shop.name} className="w-16 h-16 object-contain" />
        ) : (
          <div className="w-16 h-16 bg-indigo-100 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
          <p className="text-sm text-gray-400">{shop.reviewCount ?? 0} 筆紀錄</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            to={`/new-review?shopId=${id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            紀錄品項
          </Link>
          <Link
            to={`/suggest?shopId=${id}`}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            建議新品項
          </Link>
        </div>
      </div>

      {/* 飲料清單 */}
      <section className="mb-8">
        <h2 className="font-bold text-gray-800 text-lg mb-3">飲料清單</h2>
        {drinks.length === 0 ? (
          <p className="text-gray-400 text-sm">尚無飲料資料</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {drinks.map(drink => (
              <Link
                key={drink.id}
                to={`/drink/${drink.id}`}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors flex items-center justify-between"
              >
                <span>{drink.name}</span>
                {drink.isSeasonal && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">季節</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 大家的紀錄 */}
      <section>
        <h2 className="font-bold text-gray-800 text-lg mb-3">大家的紀錄</h2>
        {reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">還沒有紀錄，成為第一個！</p>
            <Link
              to={`/new-review?shopId=${id}`}
              className="text-indigo-600 text-sm hover:underline"
            >
              紀錄品項 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">
                    {review.displayName}
                  </span>
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    {user && review.userId === user.uid && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {review.drinkName}
                  {review.sugar && <span className="text-gray-400 ml-1">· {review.sugar}</span>}
                  {review.ice && <span className="text-gray-400 ml-1">· {review.ice}</span>}
                  {review.toppings?.length > 0 && (
                    <span className="text-gray-400 ml-1">· {review.toppings.join('、')}</span>
                  )}
                </p>
                {review.comment && (
                  <p className="text-sm text-gray-500">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
