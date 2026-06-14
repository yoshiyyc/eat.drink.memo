import { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  getGuestNickname,
  setGuestNickname,
  clearGuestNickname,
} from '../utils/guestSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [guestName, setGuestName] = useState(() => getGuestNickname());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, 'users', result.user.uid));
    return { user: result.user, isNewUser: !snap.exists() };
  }

  async function createProfile(uid, displayName, avatarUrl = null) {
    const data = { uid, displayName, avatarUrl, createdAt: serverTimestamp() };
    await setDoc(doc(db, 'users', uid), data);
    setProfile(data);
  }

  function setGuest(nickname) {
    setGuestNickname(nickname);
    setGuestName(nickname);
  }

  function handleSignOut() {
    signOut(auth);
    clearGuestNickname();
    setGuestName(null);
  }

  const value = {
    user,
    profile,
    guestName,
    isLoggedIn: !!user,
    isGuest: !user && !!guestName,
    displayName: profile?.displayName ?? guestName ?? user?.email ?? null,
    needsProfileSetup: !!user && !profile,
    needsGuestSetup: !user && !guestName,
    signInWithGoogle,
    createProfile,
    setGuest,
    signOut: handleSignOut,
  };

  if (loading) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 內使用');
  return ctx;
}
