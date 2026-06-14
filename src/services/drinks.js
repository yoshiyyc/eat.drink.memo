import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export async function getDrinksByShop(shopId) {
  const q = query(
    collection(db, 'drinks'),
    where('shopId', '==', shopId),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDrinkById(drinkId) {
  const snap = await getDoc(doc(db, 'drinks', drinkId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
