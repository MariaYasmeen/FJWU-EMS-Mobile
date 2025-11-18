import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {  db } from '../firebase';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth" 
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { isValidFjwuEmail } from '../utils/validators';



const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // If not email verified, sign out and set message
        if (!u.emailVerified) {
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setMessage('Email not verified. Please check your inbox for the verification link.');
          setLoading(false);
          return;
        }

        setUser(u);
        try {
          const userRef = doc(db, 'users', u.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            // Robust fallback: create a minimal profile if missing
            const minimal = {
              uid: u.uid,
              email: (u.email || '').toLowerCase().trim(),
              name: u.displayName || '',
              role: 'student',
              createdAt: serverTimestamp(),
            };
            await setDoc(userRef, minimal);
            setProfile(minimal);
          }
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async ({ firstName, lastName, email, department, semester, password, role }) => {
    setMessage(null);
    if (!isValidFjwuEmail(email)) {
      throw new Error('University email must end with .fjwu.edu.pk');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Create Firestore user profile
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: email.toLowerCase().trim(),
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      department,
      semester,
      role: role === 'manager' ? 'manager' : 'student',
      createdAt: serverTimestamp(),
      profileComplete: role === 'manager' ? false : true,
    });

    try { await sendEmailVerification(cred.user); } catch (e) {}
    await signOut(auth);
    setMessage('Verification email sent. Please verify before logging in.');
    return true;
  };

  const login = async ({ email, password, role }) => {
    setMessage(null);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Enforce verification
    if (!cred.user.emailVerified) {
      try { await sendEmailVerification(cred.user); } catch (e) {}
      await signOut(auth);
      throw new Error(`Verification email resent to ${email}. Please check inbox or spam.`);
    }
    // Enforce role selection matches stored role
    const userRef = doc(db, 'users', cred.user.uid);
    let snap = await getDoc(userRef);
    if (!snap.exists()) {
      // Create missing profile to avoid login dead-end
      const dataToCreate = {
        uid: cred.user.uid,
        email: (cred.user.email || '').toLowerCase().trim(),
        name: cred.user.displayName || '',
        role: role === 'manager' ? 'manager' : 'student',
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, dataToCreate);
      snap = await getDoc(userRef);
    }
    const data = snap.data();
    if (data.role !== role) {
      await signOut(auth);
      throw new Error(`Role mismatch. You signed up as ${data.role}. Switch tab to ${data.role}.`);
    }
    return true;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, profile, loading, message, signup, login, logout }), [user, profile, loading, message]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}