import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShops } from '../services/shops';

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="text-sm text-muted">首頁</Link>
        <span className="text-border">/</span>
        <span className="text-sm font-medium">所有店家</span>
      </div>

      <h1 className="text-[22px] font-bold mb-6">所有店家</h1>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-border-light" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <p className="text-sm text-muted">尚未有店家資料</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {shops.map(shop => (
            <Link
              key={shop.id}
              to={`/shop/${shop.id}`}
              className="block p-3 text-center border border-border"
            >
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.name} className="w-8 h-8 mx-auto mb-2 object-contain" />
              ) : (
                <div className="w-8 h-8 mx-auto mb-2 bg-border-light" />
              )}
              <p className="text-sm">{shop.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
