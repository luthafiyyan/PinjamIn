import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';

/**
 * PENGUJIAN DINAMIS SECURITY RULES (FIREBASE EMULATOR SUITE)
 * Menguji kepatuhan Firestore Security Rules & Storage Rules terhadap 6 skenario ancaman utama:
 * 1. Pengguna tak terautentikasi (Unauthenticated Access)
 * 2. Insecure Direct Object References (IDOR antar-pengguna)
 * 3. Eskalasi Hak Akses Mandiri (Privilege Escalation: role, admin, terverifikasi)
 * 4. Injeksi Skema Liar & Payload Ukuran Besar (Schema Validation & Oversized Payload)
 * 5. Query List Liar tanpa Filter Data Pribadi (Unrestricted Collection Query)
 * 6. Eksploitasi Cloud Storage tanpa Izin (Storage Default Deny)
 * 
 * Catatan Pengujian:
 * Memerlukan Java Runtime Environment (JRE) pada sistem operasi lokal untuk menjalankan:
 * $ firebase emulators:exec "npm run test:security"
 */

const PROJECT_ID = 'ai-studio-pinjamin-test-defense';
let testEnv: RulesTestEnvironment;

describe('Audit Keamanan Defensif: Firebase Security Rules', () => {
  beforeAll(async () => {
    const firestoreRules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    const storageRules = readFileSync(resolve(process.cwd(), 'storage.rules'), 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: firestoreRules,
        host: '127.0.0.1',
        port: 8080,
      },
      storage: {
        rules: storageRules,
        host: '127.0.0.1',
        port: 9199,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  // SKENARIO 1: Pengguna tanpa login (Unauthenticated) mencoba read/write setiap collection
  describe('Skenario 1: Akses Tanpa Login (Unauthenticated Access)', () => {
    it('Harus menolak akses baca dan tulis pada koleksi /users', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(unauthDb, 'users', 'target_user')));
      await assertFails(setDoc(doc(unauthDb, 'users', 'target_user'), { role: 'admin' }));
    });

    it('Harus menolak akses baca dan tulis pada koleksi /loans dan /invoices', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(unauthDb, 'loans', 'loan_123')));
      await assertFails(getDoc(doc(unauthDb, 'invoices', 'inv_123')));
      await assertFails(setDoc(doc(unauthDb, 'loans', 'loan_123'), { status: 'dipinjam' }));
    });

    it('Harus menolak akses baca katalog /items untuk pengguna tanpa login', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(unauthDb, 'items', 'item_1')));
      await assertFails(getDocs(collection(unauthDb, 'items')));
    });
  });

  // SKENARIO 2: User A mencoba membaca/mengubah/menghapus data milik User B (IDOR)
  describe('Skenario 2: Perlindungan IDOR Antar-Pengguna (User Isolation)', () => {
    beforeEach(async () => {
      // Setup data awal menggunakan Admin Context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'users', 'user_b'), {
          uid: 'user_b',
          email: 'userb@example.com',
          nama: 'User B',
          nomorHp: '081234567890',
          tipePeminjam: 'mahasiswa',
          nomorIdentitas: '1202200002',
          unitAsal: 'S1 Sistem Informasi',
          role: 'peminjam',
          terverifikasi: true,
        });

        await setDoc(doc(adminDb, 'loans', 'loan_b'), {
          userId: 'user_b',
          status: 'dipinjam',
          items: [{ itemId: 'item_1' }],
          itemIds: ['item_1'],
          tglPinjam: '2026-11-17',
          tglRencanaKembali: '2026-11-18',
        });
      });
    });

    it('User A tidak boleh membaca profil User B', async () => {
      const userADb = testEnv.authenticatedContext('user_a', { email: 'usera@example.com' }).firestore();
      await assertFails(getDoc(doc(userADb, 'users', 'user_b')));
    });

    it('User A tidak boleh mengubah profil User B', async () => {
      const userADb = testEnv.authenticatedContext('user_a', { email: 'usera@example.com' }).firestore();
      await assertFails(updateDoc(doc(userADb, 'users', 'user_b'), { nomorHp: '0899999999' }));
    });

    it('User A tidak boleh membaca atau mengubah peminjaman milik User B', async () => {
      const userADb = testEnv.authenticatedContext('user_a', { email: 'usera@example.com' }).firestore();
      await assertFails(getDoc(doc(userADb, 'loans', 'loan_b')));
      await assertFails(updateDoc(doc(userADb, 'loans', 'loan_b'), { status: 'dikembalikan' }));
      await assertFails(deleteDoc(doc(userADb, 'loans', 'loan_b')));
    });
  });

  // SKENARIO 3: User biasa mencoba mengubah field role/admin/saldo miliknya sendiri
  describe('Skenario 3: Pencegahan Eskalasi Hak Akses Mandiri (Privilege Escalation)', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'users', 'user_regular'), {
          uid: 'user_regular',
          email: 'reg@example.com',
          nama: 'Regular User',
          nomorHp: '081234567890',
          tipePeminjam: 'mahasiswa',
          nomorIdentitas: '1202200003',
          unitAsal: 'S1 Informatika',
          role: 'peminjam',
          terverifikasi: false,
        });
      });
    });

    it('User biasa tidak boleh mengubah role-nya menjadi superadmin atau admin', async () => {
      const userDb = testEnv.authenticatedContext('user_regular', { email: 'reg@example.com' }).firestore();
      await assertFails(updateDoc(doc(userDb, 'users', 'user_regular'), { role: 'superadmin' }));
      await assertFails(updateDoc(doc(userDb, 'users', 'user_regular'), { role: 'admin' }));
    });

    it('User biasa tidak boleh mengubah status terverifikasi miliknya sendiri', async () => {
      const userDb = testEnv.authenticatedContext('user_regular', { email: 'reg@example.com' }).firestore();
      await assertFails(updateDoc(doc(userDb, 'users', 'user_regular'), { terverifikasi: true }));
    });

    it('User biasa tidak boleh menyuntikkan field ekstra seperti isAdmin atau saldo', async () => {
      const userDb = testEnv.authenticatedContext('user_regular', { email: 'reg@example.com' }).firestore();
      await assertFails(updateDoc(doc(userDb, 'users', 'user_regular'), { isAdmin: true }));
      await assertFails(updateDoc(doc(userDb, 'users', 'user_regular'), { saldo: 1000000 }));
    });
  });

  // SKENARIO 4: Menulis dokumen dengan field ekstra, tipe salah, atau ukuran string sangat besar
  describe('Skenario 4: Validasi Skema & Batasan Ukuran Payload', () => {
    it('Registrasi profil baru dengan field ekstra liar harus ditolak', async () => {
      const userDb = testEnv.authenticatedContext('new_user_1', { email: 'new1@example.com' }).firestore();
      await assertFails(setDoc(doc(userDb, 'users', 'new_user_1'), {
        uid: 'new_user_1',
        email: 'new1@example.com',
        nama: 'New User',
        noHp: '081234567890',
        tipePeminjam: 'mahasiswa',
        nomorIdentitas: '1202200004',
        unitAsal: 'S1 Informatika',
        role: 'peminjam',
        terverifikasi: false,
        createdAt: '2026-11-17',
        isVipMember: true, // Field ekstra ilegal
      }));
    });

    it('Update nomorHp dengan teks melebihi 20 karakter atau tipe salah harus ditolak', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'users', 'user_schema'), {
          uid: 'user_schema',
          email: 'schema@example.com',
          nomorHp: '08123',
          unitAsal: 'FIT',
          role: 'peminjam',
          terverifikasi: true,
        });
      });

      const userDb = testEnv.authenticatedContext('user_schema', { email: 'schema@example.com' }).firestore();
      // Payload raksasa
      await assertFails(updateDoc(doc(userDb, 'users', 'user_schema'), {
        nomorHp: '081234567890123456789099999999999999999999',
      }));
      // Tipe salah (array)
      await assertFails(updateDoc(doc(userDb, 'users', 'user_schema'), {
        nomorHp: ['081234567890'],
      }));
    });
  });

  // SKENARIO 5: Query list tanpa filter pada collection berisi data pribadi
  describe('Skenario 5: Pembatasan Query List pada Data Pribadi', () => {
    it('Pengguna biasa tidak boleh melakukan list seluruh user pada koleksi /users', async () => {
      const userDb = testEnv.authenticatedContext('regular_user', { email: 'reg@example.com' }).firestore();
      await assertFails(getDocs(collection(userDb, 'users')));
    });

    it('Pengguna biasa tidak boleh melakukan list /loans tanpa filter userId miliknya', async () => {
      const userDb = testEnv.authenticatedContext('user_a', { email: 'usera@example.com' }).firestore();
      await assertFails(getDocs(collection(userDb, 'loans')));
    });

    it('Pengguna biasa diizinkan query /loans dengan klausa where userId == request.auth.uid', async () => {
      const userDb = testEnv.authenticatedContext('user_a', { email: 'usera@example.com' }).firestore();
      const q = query(collection(userDb, 'loans'), where('userId', '==', 'user_a'));
      await assertSucceeds(getDocs(q));
    });
  });

  // SKENARIO 6: Upload file ke Storage dengan tipe/ukuran tidak diizinkan
  describe('Skenario 6: Pencegahan Akses Liar Cloud Storage', () => {
    it('Upload file ke bucket Storage harus ditolak karena kebijakan default-deny', async () => {
      const userStorage = testEnv.authenticatedContext('user_a').storage();
      const storageRef = userStorage.ref('uploads/test.exe');
      const dummyBuffer = Buffer.from('malicious payload');
      await assertFails(storageRef.put(dummyBuffer));
    });
  });
});
