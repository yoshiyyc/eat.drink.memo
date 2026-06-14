import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function getShops() {
  const snapshot = await getDocs(collection(db, 'shops'));
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
}

export async function getShopById(shopId) {
  const snap = await getDoc(doc(db, 'shops', shopId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
