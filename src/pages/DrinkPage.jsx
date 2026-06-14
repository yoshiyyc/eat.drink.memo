import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDrinkById } from '../services/drinks';
import { getShopById } from '../services/shops';
import { getReviewsByDrink } from '../services/reviews';

function StarDisplay({ rating }) {
  if (!rating) return null;
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function DrinkPage() {
  const { id } = useParams();
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

  if (loading) return <div className="p-8 text-gray-400 text-sm">載入中...</div>;
  if (!drink) return <div className="p-8 text-gray-400 text-sm">找不到品項</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* 麵包屑 */}
      {shop && (
        <div className="text-sm text-gray-400 mb-4">
          <Link to={`/shop/${shop.id}`} className="hover:text-indigo-600">{shop.name}</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-700">{drink.name}</span>
        </div>
      )}

      {/* 品項 Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{drink.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {shop?.name}
            {drink.isSeasonal && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">季節限定</span>
            )}
          </p>
        </div>
        <Link
          to={`/new-review?shopId=${drink.shopId}&drinkId=${id}`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 whitespace-nowrap"
        >
          紀錄這杯
        </Link>
      </div>

      {/* 評論列表 */}
      <section>
        <h2 className="font-bold text-gray-800 text-lg mb-3">
          大家的紀錄
          {reviews.length > 0 && <span className="text-sm font-normal text-gray-400 ml-2">{reviews.length} 筆</span>}
        </h2>
        {reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">還沒有人紀錄這杯，成為第一個！</p>
            <Link
              to={`/new-review?shopId=${drink.shopId}&drinkId=${id}`}
              className="text-indigo-600 text-sm hover:underline"
            >
              紀錄這杯 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800">{review.displayName}</span>
                  <StarDisplay rating={review.rating} />
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  {[review.sugar, review.ice, review.size && `${review.size}杯`]
                    .filter(Boolean)
                    .join(' · ')}
                  {review.toppings?.length > 0 && ` · ${review.toppings.join('、')}`}
                </p>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
