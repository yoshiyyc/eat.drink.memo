import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShops } from '../services/shops';
import { getLatestReviews, getWeeklyTrending } from '../services/reviews';

function SectionLabel({ children }) {
  return (
    <div className="mb-3">
      <p style={{
        fontSize: '15px',
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

      {/* Action Banner */}
      <div className="py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="font-bold mb-5" style={{ fontSize: '28px', color: 'var(--color-text)', lineHeight: 1.2 }}>
          今天喝了什麼？
        </h2>
        <Link
          to="/new-review"
          className="inline-block px-8 py-3 font-medium"
          style={{ fontSize: '15px', background: 'var(--color-text)', color: 'var(--color-bg)' }}
        >
          + 紀錄這杯
        </Link>
      </div>

      {/* Shop Grid */}
      <section>
        <SectionLabel>店家</SectionLabel>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse" style={{ background: 'var(--color-border-light)' }} />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>尚未有店家資料</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {topShops.map(shop => (
              <Link
                key={shop.id}
                to={`/shop/${shop.id}`}
                className="block p-3 text-center"
                style={{ border: '1px solid var(--color-border)' }}
              >
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-8 h-8 mx-auto mb-2 object-contain" />
                ) : (
                  <div className="w-8 h-8 mx-auto mb-2" style={{ background: 'var(--color-border-light)' }} />
                )}
                <p style={{ fontSize: '14px', color: 'var(--color-text)' }}>{shop.name}</p>
              </Link>
            ))}
            {hasMore && (
              <Link
                to="/shops"
                className="block p-3 flex items-center justify-center"
                style={{
                  border: '1px dashed var(--color-border)',
                  color: 'var(--color-accent)',
                  fontSize: '14px',
                }}
              >
                看全部 →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Weekly Trending */}
      <section>
        <SectionLabel>本週熱門</SectionLabel>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse" style={{ background: 'var(--color-border-light)' }} />
            ))}
          </div>
        ) : trending.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
            這週還沒有紀錄，{' '}
            <Link to="/new-review" style={{ color: 'var(--color-accent)' }}>快來第一個！</Link>
          </p>
        ) : (
          <div>
            {trending.map((item, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between py-2"
                style={{ borderBottom: i < trending.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--color-accent)',
                    minWidth: '18px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--color-accent)',
                    flexShrink: 0,
                  }}>
                    {item.shopName}
                  </span>
                  <span style={{ color: 'var(--color-border)', flexShrink: 0 }}>·</span>
                  <span
                    className="truncate"
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    {item.drinkName}
                  </span>
                </div>
                <span
                  className="whitespace-nowrap ml-4"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    flexShrink: 0,
                  }}
                >
                  ×{item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest Reviews */}
      <section>
        <SectionLabel>最新紀錄</SectionLabel>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse" style={{ background: 'var(--color-border-light)' }} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
            還沒有紀錄，{' '}
            <Link to="/new-review" style={{ color: 'var(--color-accent)' }}>成為第一個留下心得的人！</Link>
          </p>
        ) : (
          <div>
            {reviews.map((review, i) => (
              <Link
                key={review.id}
                to={`/shop/${review.shopId}`}
                className="block py-3"
                style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {review.displayName || '訪客'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="min-w-0 truncate mr-2">
                    <span style={{ fontSize: '14px', color: 'var(--color-accent)' }}>{review.shopName}</span>
                    <span style={{ color: 'var(--color-border)', margin: '0 4px' }}>·</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{review.drinkName}</span>
                  </span>
                  {review.rating && (
                    <span className="whitespace-nowrap ml-2 flex-shrink-0">
                      <StarDisplay rating={review.rating} />
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p style={{ fontSize: '14px', color: '#666' }}>「{review.comment}」</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
