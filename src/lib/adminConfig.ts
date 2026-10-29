import { User } from 'firebase/auth';
import { UserProfile } from '../types';

/**
 * Email tunggal akun Google administrator sistem PinjamIn Laboratorium FIT.
 */
export const ADMIN_EMAIL = 'hafiyyanluthfii@gmail.com';

/**
 * Helper untuk menentukan apakah pengguna adalah Administrator.
 * Membandingkan email user (huruf kecil semua) dengan ADMIN_EMAIL
 * dan memastikan status email terverifikasi (emailVerified).
 */
export function isAdmin(
  user: User | UserProfile | { email?: string | null; emailVerified?: boolean; role?: string } | null | undefined
): boolean {
  if (!user) return false;

  // Jika profile dokumen Firestore secara eksplisit memiliki role 'admin'
  if ('role' in user && user.role === 'admin') {
    return true;
  }

  if (!user.email) return false;

  const normalizedUserEmail = user.email.trim().toLowerCase();
  const normalizedAdminEmail = ADMIN_EMAIL.toLowerCase();

  // Jika objek memiliki field emailVerified (seperti Firebase Auth User), pastikan nilainya true
  const isEmailVerified = 'emailVerified' in user ? Boolean(user.emailVerified) : true;

  return normalizedUserEmail === normalizedAdminEmail && isEmailVerified;
}
