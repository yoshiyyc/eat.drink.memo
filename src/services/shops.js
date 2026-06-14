import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export async function getShops() {
  const q = query(collection(db, 'shops'), orderBy('reviewCount', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getShopById(shopId) {
  const snap = await getDoc(doc(db, 'shops', shopId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
