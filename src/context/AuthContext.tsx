import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import { UserProfile } from '../types';
import { isAdmin as checkIsAdmin } from '../lib/adminConfig';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (profileData: Omit<UserProfile, 'uid' | 'email' | 'role' | 'terverifikasi' | 'createdAt'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribeProfile = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<UserProfile, 'uid'>;
          setProfile({
            uid: currentUser.uid,
            ...data,
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user profile snapshot:', error);
        setLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [currentUser]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Error saat login dengan Google:', error);
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error saat logout:', error);
    }
  };

  const saveProfile = async (
    profileData: Omit<UserProfile, 'uid' | 'email' | 'role' | 'terverifikasi' | 'createdAt'>
  ) => {
    if (!currentUser) return;

    const newProfile: UserProfile = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      nama: profileData.nama || currentUser.displayName || 'Pengguna',
      noHp: profileData.noHp,
      tipePeminjam: profileData.tipePeminjam,
      nomorIdentitas: profileData.nomorIdentitas,
      unitAsal: profileData.unitAsal,
      angkatan: profileData.angkatan || '',
      role: 'peminjam',
      terverifikasi: false,
      createdAt: serverTimestamp(),
    };

    const docPath = `users/${currentUser.uid}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), newProfile);
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  };

  const isAdmin = checkIsAdmin(currentUser);
  const isVerified = (profile?.terverifikasi === true) || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        isAdmin,
        isVerified,
        loginWithGoogle,
        logout,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
