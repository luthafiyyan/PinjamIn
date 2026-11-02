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
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { isAdmin as checkIsAdmin } from '../lib/adminConfig';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isVerified: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (profileData: Omit<UserProfile, 'uid' | 'email' | 'role' | 'terverifikasi' | 'createdAt'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isClaimAdmin, setIsClaimAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Periksa apakah token JWT Firebase Auth membawa Custom Claim admin: true
          const tokenResult = await user.getIdTokenResult();
          setIsClaimAdmin(Boolean(tokenResult.claims.admin));
        } catch (err) {
          console.error('Error saat memeriksa custom claim token:', err);
          setIsClaimAdmin(false);
        }
      } else {
        setProfile(null);
        setIsClaimAdmin(false);
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
      // 1. Bersihkan sisa hash route di URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // 2. Putuskan sesi Firebase Auth
      await signOut(auth);

      // 3. Bersihkan seluruh web storage (localStorage & sessionStorage) untuk keamanan PC bersama di Lab
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageErr) {
        console.warn('Gagal membersihkan web storage saat logout:', storageErr);
      }

      // 4. Reset state pengguna di memori React
      setCurrentUser(null);
      setProfile(null);
      setIsClaimAdmin(false);
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
      nomorHp: profileData.noHp,
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

  // Superadmin ditentukan jika profil di database memiliki role 'superadmin'
  const isSuperAdmin = profile?.role === 'superadmin';
  // Admin aktif jika merupakan superadmin, memiliki role 'admin', atau membawa custom claim
  const isAdmin = isSuperAdmin || profile?.role === 'admin' || isClaimAdmin || checkIsAdmin(currentUser) || checkIsAdmin(profile);
  const isVerified = (profile?.terverifikasi === true) || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
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
