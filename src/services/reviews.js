import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export async function addReview(reviewData) {
  const shopRef = doc(db, 'shops', reviewData.shopId);

  const reviewRef = await runTransaction(db, async (transaction) => {
    const shopSnap = await transaction.get(shopRef);
    if (!shopSnap.exists()) throw new Error('店家不存在');

    const currentCount = shopSnap.data().reviewCount ?? 0;
    transaction.update(shopRef, { reviewCount: currentCount + 1 });

    const newRef = doc(collection(db, 'reviews'));
    transaction.set(newRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
    return newRef;
  });

  return reviewRef.id;
}

export async function getReviewsByShop(shopId, limitCount = 20) {
  const q = query(
    collection(db, 'reviews'),
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getReviewsByUser(userId, limitCount = 50) {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getLatestReviews(limitCount = 5) {
  const q = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
