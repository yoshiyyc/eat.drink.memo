import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function addSuggestion(suggestionData) {
  await addDoc(collection(db, 'suggestions'), {
    ...suggestionData,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
