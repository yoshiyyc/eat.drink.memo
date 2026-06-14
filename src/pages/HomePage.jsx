import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShops } from '../services/shops';

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShops().then(data => {
      setShops(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
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
          className="w-full max-w-md mx-auto block bg-white text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
          readOnly
        />
        <div className="flex gap-2 justify-center mt-4">
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors">
            熱門
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm transition-colors">
            最新
          </button>
        </div>
      </section>

      {/* Shop Grid */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg">店家</h2>
          {hasMore && (
            <span className="text-indigo-600 text-sm cursor-pointer">看全部 →</span>
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
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="w-10 h-10 mx-auto mb-2 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 rounded-full mx-auto mb-2" />
                )}
                <p className="text-sm font-medium text-gray-800">{shop.name}</p>
              </Link>
            ))}
            {hasMore && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm cursor-pointer hover:bg-gray-100">
                +更多
              </div>
            )}
          </div>
        )}
      </section>

      {/* Weekly Trending */}
      <section className="mb-8">
        <h2 className="font-bold text-gray-800 text-lg mb-4">🔥 這週大家在喝</h2>
        <div className="bg-white border border-gray-200 rounded-xl">
          <p className="p-6 text-gray-400 text-sm text-center">
            還沒有紀錄，成為第一個留下心得的人！
          </p>
        </div>
      </section>

      {/* Latest Reviews */}
      <section>
        <h2 className="font-bold text-gray-800 text-lg mb-4">最新紀錄</h2>
        <div className="bg-white border border-gray-200 rounded-xl">
          <p className="p-6 text-gray-400 text-sm text-center">
            還沒有紀錄，成為第一個留下心得的人！
          </p>
        </div>
      </section>

    </div>
  );
}
