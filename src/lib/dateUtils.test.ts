import { describe, it, expect } from 'vitest';
import { 
  isDateRangeOverlapping, 
  checkItemBookingConflicts, 
  formatDateIndo 
} from './dateUtils';
import { Loan } from '../types';

describe('Sistem Booking Kalender & Validasi Tanggal (QA Tests)', () => {
  describe('isDateRangeOverlapping (Buffer 0 Hari)', () => {
    it('mengizinkan Si B pinjam Rabu-Kamis saat Si A sudah booking Jumat-Senin (Tidak Bentrok)', () => {
      const siAPinjam = '2026-10-23'; // Jumat
      const siAKembali = '2026-10-26'; // Senin

      const siBPinjam = '2026-10-21'; // Rabu
      const siBKembali = '2026-10-22'; // Kamis

      const bentrok = isDateRangeOverlapping(siBPinjam, siBKembali, siAPinjam, siAKembali);
      expect(bentrok).toBe(false);
    });

    it('menolak pengajuan jika rentang tanggal bertabrakan sebagian (Bentrok)', () => {
      const siAPinjam = '2026-10-23'; // Jumat
      const siAKembali = '2026-10-26'; // Senin

      const siCPinjam = '2026-10-22'; // Kamis
      const siCKembali = '2026-10-24'; // Sabtu (bentrok hari Jumat & Sabtu)

      const bentrok = isDateRangeOverlapping(siCPinjam, siCKembali, siAPinjam, siAKembali);
      expect(bentrok).toBe(true);
    });

    it('mengizinkan peminjaman di masa depan setelah jadwal sebelumnya selesai (Tidak Bentrok)', () => {
      const siAPinjam = '2026-10-23'; // Jumat
      const siAKembali = '2026-10-26'; // Senin

      const siDPinjam = '2026-10-27'; // Selasa
      const siDKembali = '2026-10-29'; // Kamis

      const bentrok = isDateRangeOverlapping(siDPinjam, siDKembali, siAPinjam, siAKembali);
      expect(bentrok).toBe(false);
    });

    it('menolak jika tanggal sama persis (Bentrok)', () => {
      const tgl1 = '2026-10-23';
      const tgl2 = '2026-10-25';

      const bentrok = isDateRangeOverlapping(tgl1, tgl2, tgl1, tgl2);
      expect(bentrok).toBe(true);
    });
  });

  describe('checkItemBookingConflicts (Deteksi Konflik Multi-Barang)', () => {
    const mockLoans: Loan[] = [
      {
        id: 'loan-1',
        userId: 'user-a',
        peminjam: {
          nama: 'Si A',
          email: 'sia@fit.edu',
          noHp: '0812345678',
          tipePeminjam: 'mahasiswa',
          nomorIdentitas: '6701220001',
          unitAsal: 'D3 RPLA',
        },
        jenisKeperluan: 'tugas_kuliah',
        keperluan: 'Praktikum Embedded',
        penanggungJawab: null,
        tglPinjam: '2026-10-23', // Jumat
        tglRencanaKembali: '2026-10-26', // Senin
        tglKembaliAktual: null,
        status: 'disetujui',
        items: [
          {
            itemId: 'item-osiloskop-01',
            kodeAset: 'ELK-001',
            nama: 'Osiloskop Digital Rigol',
            kondisiPinjam: 'baik',
          },
        ],
        itemIds: ['item-osiloskop-01'],
        noInvoice: 'PIN-20261021-001',
        dikembalikanOleh: null,
        catatanPengembalian: null,
      },
      {
        id: 'loan-2',
        userId: 'user-old',
        peminjam: {
          nama: 'User Lama',
          email: 'lama@fit.edu',
          noHp: '0812345679',
          tipePeminjam: 'mahasiswa',
          nomorIdentitas: '6701220002',
          unitAsal: 'D3 RPLA',
        },
        jenisKeperluan: 'tugas_kuliah',
        keperluan: 'Praktikum Selesai',
        penanggungJawab: null,
        tglPinjam: '2026-10-20',
        tglRencanaKembali: '2026-10-22',
        tglKembaliAktual: '2026-10-22',
        status: 'dikembalikan', // Status dikembalikan tidak boleh memicu bentrok
        items: [
          {
            itemId: 'item-osiloskop-01',
            kodeAset: 'ELK-001',
            nama: 'Osiloskop Digital Rigol',
            kondisiPinjam: 'baik',
          },
        ],
        itemIds: ['item-osiloskop-01'],
        noInvoice: 'PIN-20261020-001',
        dikembalikanOleh: 'Laboran',
        catatanPengembalian: 'Oke',
      },
    ];

    it('Si B dapat meminjam osiloskop untuk hari Rabu-Kamis sebelum Si A (0 konflik)', () => {
      const conflicts = checkItemBookingConflicts(
        ['item-osiloskop-01'],
        '2026-10-21',
        '2026-10-22',
        mockLoans
      );
      expect(conflicts).toHaveLength(0);
    });

    it('Si C yang mencoba pinjam osiloskop di hari Jumat langsung terdeteksi bentrok dengan Si A', () => {
      const conflicts = checkItemBookingConflicts(
        ['item-osiloskop-01'],
        '2026-10-23',
        '2026-10-24',
        mockLoans
      );
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].itemName).toBe('Osiloskop Digital Rigol');
      expect(conflicts[0].noInvoice).toBe('PIN-20261021-001');
      expect(conflicts[0].status).toBe('disetujui');
    });

    it('Alat lain yang tidak dipinjam Si A bebas dipinjam di rentang tanggal yang sama', () => {
      const conflicts = checkItemBookingConflicts(
        ['item-kamera-sony-01'],
        '2026-10-23',
        '2026-10-25',
        mockLoans
      );
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('formatDateIndo', () => {
    it('memformat tanggal YYYY-MM-DD ke Bahasa Indonesia yang rapi', () => {
      expect(formatDateIndo('2026-10-24')).toBe('24 Okt 2026');
      expect(formatDateIndo('2026-01-05')).toBe('5 Jan 2026');
      expect(formatDateIndo(null)).toBe('-');
    });
  });
});
