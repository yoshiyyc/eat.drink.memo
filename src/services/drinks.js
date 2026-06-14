import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export async function getDrinksByShop(shopId) {
  const q = query(collection(db, 'drinks'), where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
}

export async function getDrinkById(drinkId) {
  const snap = await getDoc(doc(db, 'drinks', drinkId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
