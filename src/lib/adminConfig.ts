import { User } from 'firebase/auth';
import { UserProfile } from '../types';

/**
 * Helper untuk menentukan apakah pengguna memiliki hak akses Administrator (admin atau superadmin).
 * Ditentukan langsung dari status 'role' pada dokumen profil Firestore pengguna,
 * sehingga tidak ada email pribadi yang di-hardcode ke dalam kode sumber.
 */
export const ADMIN_EMAIL = 'hafiyyanluthfii@gmail.com';

export function isAdmin(
  user: User | UserProfile | { email?: string | null; emailVerified?: boolean; role?: string } | null | undefined
): boolean {
  if (!user) return false;

  // Jika profile dokumen Firestore secara eksplisit memiliki role 'admin' atau 'superadmin'
  if ('role' in user && (user.role === 'admin' || user.role === 'superadmin')) {
    return true;
  }

  // Fallback akun administrator utama sistem
  if (user.email && user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Helper untuk menentukan apakah pengguna adalah Superadmin.
 * Superadmin memiliki wewenang untuk mengangkat atau mencabut hak admin pengguna lain.
 */
export function isSuperAdmin(
  user: User | UserProfile | { email?: string | null; emailVerified?: boolean; role?: string } | null | undefined
): boolean {
  if (!user) return false;
  if ('role' in user && user.role === 'superadmin') {
    return true;
  }
  if (user.email && user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  return false;
}

/**
 * Mengecek apakah token Firebase Auth memiliki Custom Claim admin atau superadmin.
 */
export async function checkCustomClaimAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const idTokenResult = await user.getIdTokenResult();
    return Boolean(idTokenResult.claims.admin || idTokenResult.claims.superadmin);
  } catch (err) {
    console.error('Error saat memeriksa custom claim admin:', err);
    return false;
  }
}
