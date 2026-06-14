import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  updateDoc,
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
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function getReviewsByDrink(drinkId, limitCount = 20) {
  const q = query(
    collection(db, 'reviews'),
    where('drinkId', '==', drinkId),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function getReviewsByUser(userId, limitCount = 50) {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
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

export async function getReviewById(reviewId) {
  const snap = await getDoc(doc(db, 'reviews', reviewId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateReview(reviewId, updates) {
  await updateDoc(doc(db, 'reviews', reviewId), updates);
}

export async function deleteReview(reviewId, shopId) {
  const shopRef = doc(db, 'shops', shopId);
  const reviewRef = doc(db, 'reviews', reviewId);

  await runTransaction(db, async (transaction) => {
    const shopSnap = await transaction.get(shopRef);
    if (shopSnap.exists()) {
      const currentCount = shopSnap.data().reviewCount ?? 0;
      transaction.update(shopRef, { reviewCount: Math.max(0, currentCount - 1) });
    }
    transaction.delete(reviewRef);
  });
}
