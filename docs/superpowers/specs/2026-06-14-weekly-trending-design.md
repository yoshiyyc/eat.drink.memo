# 「這週大家在喝」Weekly Trending Design

## Goal

在首頁顯示過去 7 天內被記錄最多次的飲料排行，以店家 + 飲料 + 筆數呈現，不同店家的同名飲料分開計算。

## Data Model

Review 文件已有的欄位：
- `drinkId` — 飲料 doc ID（用作主分組鍵）
- `drinkName` — 飲料名稱（display 用，`drinkId` 缺失時也作 fallback 分組鍵）
- `shopId` — 店家 ID
- `shopName` — 店家名稱
- `createdAt` — Firestore Timestamp

不需要異動資料結構。

## Architecture

### Service Layer

在 `src/services/reviews.js` 新增：

```js
export async function getWeeklyTrending(topN = 5) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, 'reviews'),
    where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
  );
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map(d => d.data());

  // Group by drinkId (fallback: shopId + drinkName)
  const counts = {};
  for (const r of reviews) {
    const key = r.drinkId ?? `${r.shopId}::${r.drinkName}`;
    if (!counts[key]) {
      counts[key] = { shopName: r.shopName, drinkName: r.drinkName, count: 0 };
    }
    counts[key].count++;
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
```

Firestore 的單欄位 `createdAt` index（自動建立）支援此 inequality filter，不需另建 composite index。

### UI Layer

`src/pages/HomePage.jsx` 的「🔥 這週大家在喝」section：

- 載入狀態：3 個骨架 row（`animate-pulse`）
- 有資料：排行清單，每行 `#N  店家  飲料  ×count`
- 空狀態：「這週還沒有紀錄，快來第一個！」＋「立即記錄 →」連結

顯示前 5 名。

## Data Flow

```
HomePage mount
  → Promise.all([
      getShops(),
      getLatestReviews(5),
      getWeeklyTrending(5).catch(() => [])   // 獨立 fallback，不影響其他資料
    ])
  → setState({ shops, reviews, trending })
  → render trending section
```

## Error Handling

`getWeeklyTrending` 使用 `.catch(() => [])` 局部降級，避免單一 query 失敗拖垮整個 `Promise.all`。trending 為空陣列時顯示空狀態。

## Files Changed

- `src/services/reviews.js` — 新增 `getWeeklyTrending`
- `src/pages/HomePage.jsx` — 整合 `getWeeklyTrending`，替換 trending section 佔位符
