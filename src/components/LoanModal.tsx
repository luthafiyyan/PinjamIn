import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { 
  runTransaction, 
  doc, 
  collection, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Item, JenisKeperluan, PeminjamanSettings, RuleSetting } from '../types';
import { isAdmin as checkIsAdmin } from '../lib/adminConfig';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Item[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSuccess: (loanId: string) => void;
}

const DEFAULT_SETTINGS: PeminjamanSettings = {
  mahasiswa: { maxDurasiHari: 3, maxBarang: 2, wajibPenanggungJawab: true },
  dosen: { maxDurasiHari: 7, maxBarang: 5, wajibPenanggungJawab: false },
  tendik: { maxDurasiHari: 7, maxBarang: 5, wajibPenanggungJawab: false },
};

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onClearCart,
  onSuccess,
}) => {
  const { profile, currentUser } = useAuth();

  // Settings
  const [settings, setSettings] = useState<RuleSetting>(
    profile?.tipePeminjam ? DEFAULT_SETTINGS[profile.tipePeminjam] : DEFAULT_SETTINGS.mahasiswa
  );

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [tglPinjam, setTglPinjam] = useState(todayStr);
  const [tglRencanaKembali, setTglRencanaKembali] = useState('');
  const [jenisKeperluan, setJenisKeperluan] = useState<JenisKeperluan>('tugas_kuliah');
  const [keperluan, setKeperluan] = useState('');
  const [penanggungJawabNama, setPenanggungJawabNama] = useState('');
  const [penanggungJawabNip, setPenanggungJawabNip] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch settings from Firestore
  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'peminjaman'));
        if (snap.exists() && profile?.tipePeminjam) {
          const data = snap.data() as PeminjamanSettings;
          if (data[profile.tipePeminjam]) {
            setSettings(data[profile.tipePeminjam]);
          }
        }
      } catch (err) {
        console.warn('Menggunakan pengaturan default:', err);
      }
    }
    if (isOpen) {
      loadSettings();
      // Set initial jenis keperluan
      if (profile?.tipePeminjam === 'mahasiswa') {
        setJenisKeperluan('tugas_kuliah');
      } else if (profile?.tipePeminjam === 'tendik') {
        setJenisKeperluan('kegiatan_unit');
      } else {
        setJenisKeperluan('penelitian');
      }

      // Default tgl kembali: today + 1 day
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setTglRencanaKembali(tmrw.toISOString().split('T')[0]);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Options for jenis keperluan based on user type
  const getJenisKeperluanOptions = () => {
    const opts: { value: JenisKeperluan; label: string }[] = [];
    if (profile?.tipePeminjam === 'mahasiswa') {
      opts.push({ value: 'tugas_kuliah', label: 'Tugas Kuliah / Praktikum' });
    }
    opts.push({ value: 'penelitian', label: 'Penelitian / Tugas Akhir / Riset' });
    opts.push({ value: 'kegiatan_organisasi', label: 'Kegiatan Organisasi Mahasiswa / Himpunan' });
    if (profile?.tipePeminjam === 'tendik') {
      opts.push({ value: 'kegiatan_unit', label: 'Kegiatan Unit Kerja / Layanan Lab' });
    }
    opts.push({ value: 'lainnya', label: 'Keperluan Lainnya' });
    return opts;
  };

  // Calculate duration
  const getDurationDays = () => {
    if (!tglPinjam || !tglRencanaKembali) return 0;
    const start = new Date(tglPinjam);
    const end = new Date(tglRencanaKembali);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const durationDays = getDurationDays();
  const isDurationExceeded = durationDays > settings.maxDurasiHari;
  const isItemsCountExceeded = cart.length > settings.maxBarang;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentUser) {
      setErrorMsg('Pengguna tidak valid. Silakan login kembali.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Pilih minimal satu barang untuk dipinjam.');
      return;
    }

    if (isItemsCountExceeded) {
      setErrorMsg(`Maksimal ${settings.maxBarang} barang untuk ${profile.tipePeminjam}. Silakan kurangi barang di keranjang.`);
      return;
    }

    if (durationDays <= 0) {
      setErrorMsg('Tanggal rencana kembali harus setelah tanggal pinjam.');
      return;
    }

    if (isDurationExceeded) {
      setErrorMsg(`Maksimal durasi peminjaman untuk ${profile.tipePeminjam} adalah ${settings.maxDurasiHari} hari.`);
      return;
    }

    if (!keperluan.trim()) {
      setErrorMsg('Deskripsi keperluan wajib diisi.');
      return;
    }

    if (settings.wajibPenanggungJawab) {
      if (!penanggungJawabNama.trim() || !penanggungJawabNip.trim()) {
        setErrorMsg('Data Dosen/Pembimbing Penanggung Jawab wajib diisi untuk mahasiswa.');
        return;
      }
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Date key for counter: YYYYMMDD
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const yyyymmdd = `${yyyy}${mm}${dd}`;

      // RUN STRICT CLIENT-SIDE TRANSACTION
      const result = await runTransaction(db, async (transaction) => {
        // STEP 1: Read user profile
        const userRef = doc(db, 'users', profile.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('Profil pengguna tidak ditemukan.');
        }
        const userData = userSnap.data();
        const isUserAdmin = checkIsAdmin(currentUser);
        if (!userData.terverifikasi && !isUserAdmin) {
          throw new Error('Akun Anda belum diverifikasi oleh admin. Peminjaman tidak dapat diproses.');
        }

        // STEP 2: Read settings
        const settingsRef = doc(db, 'settings', 'peminjaman');
        const settingsSnap = await transaction.get(settingsRef);
        const activeSettings = settingsSnap.exists()
          ? (settingsSnap.data() as PeminjamanSettings)[profile.tipePeminjam] || settings
          : settings;

        if (cart.length > activeSettings.maxBarang) {
          throw new Error(`Jumlah barang melebihi batas (${activeSettings.maxBarang} barang).`);
        }

        // STEP 3: Read all selected items
        const itemSnaps = await Promise.all(
          cart.map((it) => transaction.get(doc(db, 'items', it.id)))
        );

        for (let i = 0; i < itemSnaps.length; i++) {
          const snap = itemSnaps[i];
          const itName = cart[i].nama;
          if (!snap.exists()) {
            throw new Error(`Barang "${itName}" tidak ditemukan dalam database.`);
          }
          const itemData = snap.data();
          if (itemData.status !== 'tersedia') {
            throw new Error(`Barang [${itemData.nama || itName}] sedang dipinjam atau tidak tersedia. Silakan pilih barang lain.`);
          }
        }

        // STEP 4: Read counter
        const counterRef = doc(db, 'counters', `invoice-${yyyymmdd}`);
        const counterSnap = await transaction.get(counterRef);
        const lastCount = counterSnap.exists() ? (counterSnap.data()?.last || 0) + 1 : 1;
        const formattedSequence = String(lastCount).padStart(3, '0');
        const noInvoice = `PIN-${yyyymmdd}-${formattedSequence}`;

        // Prepare new document references
        const loansCollectionRef = collection(db, 'loans');
        const newLoanDocRef = doc(loansCollectionRef);

        // STEP 5: ATOMIC WRITES
        // Reserve all selected items while the admin reviews the request.
        for (const it of cart) {
          const itemRef = doc(db, 'items', it.id);
          transaction.update(itemRef, {
            status: 'menunggu_persetujuan',
            currentLoanId: newLoanDocRef.id,
          });
        }

        // Write Loan Document
        transaction.set(newLoanDocRef, {
          userId: profile.uid,
          peminjam: {
            nama: profile.nama,
            email: profile.email,
            noHp: profile.nomorHp || profile.noHp || '',
            tipePeminjam: profile.tipePeminjam,
            nomorIdentitas: profile.nomorIdentitas,
            unitAsal: profile.unitAsal,
            angkatan: profile.angkatan || '',
          },
          jenisKeperluan,
          keperluan: keperluan.trim(),
          penanggungJawab: activeSettings.wajibPenanggungJawab
            ? {
                nama: penanggungJawabNama.trim(),
                nip: penanggungJawabNip.trim(),
              }
            : null,
          tglPinjam,
          tglRencanaKembali,
          tglKembaliAktual: null,
          status: 'menunggu_persetujuan',
          items: cart.map((it) => ({
            itemId: it.id,
            kodeAset: it.kodeAset,
            nama: it.nama,
            kondisiPinjam: it.kondisi,
            merek: it.merek || '',
            model: it.model || '',
            kelengkapan: it.kelengkapan || [],
          })),
          itemIds: cart.map((it) => it.id),
          noInvoice,
          alasanPenolakan: null,
          dikembalikanOleh: null,
          catatanPengembalian: null,
          createdAt: serverTimestamp(),
        });

        // Write Counter Document
        transaction.set(counterRef, { last: lastCount }, { merge: true });

        return { loanId: newLoanDocRef.id };
      });

      onClearCart();
      onClose();
      onSuccess(result.loanId);
    } catch (err: any) {
      console.error('Error saat transaksi peminjaman:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses transaksi peminjaman.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden sm:my-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Kembali"
              title="Kembali"
              className="p-2 -ml-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center sm:hidden"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-1">
                <Icon name="Stars" size={16} className="text-amber-400" />
                Keranjang Peminjaman
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-normal">Formulir Peminjaman Alat</h2>
              <p className="text-xs text-indigo-100">Laboratorium Fakultas Ilmu Terapan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup formulir peminjaman"
            title="Tutup formulir peminjaman"
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Icon name="XLg" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <Icon name="ExclamationTriangle" size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Aturan Peminjaman Info Box */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
            <Icon name="InfoCircle" size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold">Ketentuan untuk {profile?.tipePeminjam}:</span>
              <p className="text-slate-600">
                Maksimal <b>{settings.maxBarang} barang</b> sekaligus, durasi maksimal <b>{settings.maxDurasiHari} hari</b>.
                {settings.wajibPenanggungJawab && ' Wajib menyertakan Dosen Penanggung Jawab.'}
              </p>
              <p className="text-slate-600">
                Barang ditahan setelah diajukan. Peminjaman aktif dan invoice tersedia setelah disetujui admin.
              </p>
            </div>
          </div>

          {/* Selected Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                Barang yang Dipilih ({cart.length})
              </label>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                Keranjang masih kosong. Pilih alat dari katalog terlebih dahulu.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {item.kodeAset}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{item.nama}</span>
                        {(item.merek || item.model) && (
                          <span className="text-[10px] text-indigo-600 font-medium">
                            ({[item.merek, item.model].filter(Boolean).join(' • ')})
                          </span>
                        )}
                      </div>
                      
                      {item.kelengkapan && item.kelengkapan.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] font-bold text-slate-500">Kelengkapan:</span>
                          {item.kelengkapan.map((acc, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/50"
                            >
                              <Icon name="Check" size={12} />
                              <span>{acc}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label="Hapus barang dari keranjang"
                      title="Hapus barang dari keranjang"
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Icon name="Trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isItemsCountExceeded && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                <Icon name="ExclamationTriangle" size={16} className="text-rose-600 shrink-0" />
                <span>Jumlah barang ({cart.length}) melebihi batas maksimal ({settings.maxBarang} barang).</span>
              </p>
            )}
          </div>

          {/* Keperluan & Deskripsi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Jenis Keperluan
              </label>
              <select
                value={jenisKeperluan}
                onChange={(e) => setJenisKeperluan(e.target.value as JenisKeperluan)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {getJenisKeperluanOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tanggal Pinjam
              </label>
              <input
                type="date"
                value={tglPinjam}
                onChange={(e) => setTglPinjam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 tabular-nums bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Tanggal Rencana Kembali</span>
                {durationDays > 0 && (
                  <span className={`text-xs font-semibold tabular-nums ${isDurationExceeded ? 'text-rose-600' : 'text-indigo-600'}`}>
                    Durasi: {durationDays} hari
                  </span>
                )}
              </label>
              <input
                type="date"
                min={tglPinjam}
                value={tglRencanaKembali}
                onChange={(e) => setTglRencanaKembali(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-base sm:text-sm tabular-nums focus:outline-none focus:ring-2 bg-white ${
                  isDurationExceeded
                    ? 'border-rose-400 ring-rose-500/20 focus:border-rose-600'
                    : 'border-slate-300 ring-indigo-500/20 focus:border-indigo-600'
                }`}
                required
              />
              {isDurationExceeded && (
                <p className="text-xs text-rose-600 mt-1">
                  Durasi melebihi batas maksimal {settings.maxDurasiHari} hari.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Deskripsi Keperluan
              </label>
              <textarea
                rows={2}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Contoh: Pengambilan video tugas akhir mata kuliah Multimedia..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                required
              />
            </div>
          </div>

          {/* Penanggung Jawab Section (Wajib jika settings mensyaratkan, e.g. Mahasiswa) */}
          {settings.wajibPenanggungJawab && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Icon name="Person" size={16} className="text-indigo-600" />
                <span>Dosen / Pembimbing Penanggung Jawab (Wajib)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Nama Lengkap Dosen
                  </label>
                  <input
                    type="text"
                    value={penanggungJawabNama}
                    onChange={(e) => setPenanggungJawabNama(e.target.value)}
                    placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    required={settings.wajibPenanggungJawab}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    NIP Dosen
                  </label>
                  <input
                    type="text"
                    value={penanggungJawabNip}
                    onChange={(e) => setPenanggungJawabNip(e.target.value)}
                    placeholder="Contoh: 198501012010121001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white tabular-nums"
                    required={settings.wajibPenanggungJawab}
                  />
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Sticky Submit Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 safe-area-pb shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer text-center order-last sm:order-first"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || cart.length === 0 || isItemsCountExceeded || isDurationExceeded}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="CheckCircle" size={16} />
              )}
              <span>{loading ? 'Mengirim Pengajuan...' : 'Ajukan Peminjaman'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
