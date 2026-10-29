import { Loan, LoanStatus, ItemBooking } from '../types';

/**
 * Memeriksa apakah dua rentang tanggal bersinggungan (overlap) secara inklusif dengan buffer 0 hari.
 * Format tanggal input harus ISO string 'YYYY-MM-DD'.
 *
 * Rumus Overlap:
 * Bentrok jika dan hanya jika: (startA <= endB) && (endA >= startB)
 */
export function isDateRangeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  return startA <= endB && endA >= startB;
}

export interface BookingConflict {
  itemId: string;
  itemName: string;
  loanId: string;
  noInvoice: string;
  tglPinjam: string;
  tglRencanaKembali: string;
  status: LoanStatus;
}

/**
 * Status peminjaman yang dianggap mengunci jadwal (booking aktif atau barang sedang dibawa).
 */
export const ACTIVE_BOOKING_STATUSES: LoanStatus[] = [
  'menunggu_persetujuan',
  'disetujui',
  'dipinjam',
];

/**
 * Memeriksa apakah ada peminjaman lain yang bentrok dengan daftar item dan rentang tanggal yang diminta.
 */
export function checkItemBookingConflicts(
  itemIds: string[],
  startDate: string,
  endDate: string,
  existingLoans: (Loan | ItemBooking)[],
  excludeLoanId?: string
): BookingConflict[] {
  const conflicts: BookingConflict[] = [];

  for (const loan of existingLoans) {
    const loanUniqueId = 'loanId' in loan && loan.loanId ? loan.loanId : loan.id;
    if (excludeLoanId && loanUniqueId === excludeLoanId) continue;
    if (!ACTIVE_BOOKING_STATUSES.includes(loan.status)) continue;

    // Periksa apakah rentang tanggal bersinggungan
    if (isDateRangeOverlapping(startDate, endDate, loan.tglPinjam, loan.tglRencanaKembali)) {
      // Periksa item mana saja yang sama
      for (const it of loan.items) {
        if (itemIds.includes(it.itemId)) {
          conflicts.push({
            itemId: it.itemId,
            itemName: it.nama,
            loanId: loanUniqueId,
            noInvoice: loan.noInvoice,
            tglPinjam: loan.tglPinjam,
            tglRencanaKembali: loan.tglRencanaKembali,
            status: loan.status,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Format tanggal YYYY-MM-DD ke format lokal Indonesia (misal: "24 Okt 2026").
 */
export function formatDateIndo(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      return `${day} ${months[monthIndex] || parts[1]} ${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Format tanggal YYYY-MM-DD ke format lengkap Indonesia dengan nama bulan penuh (misal: "29 Oktober 2026").
 */
export function formatDateIndoFull(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${day} ${months[monthIndex] || parts[1]} ${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD lokal.
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
