import React, { useState, useEffect } from 'react';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Icon } from './Icon';

interface MyProfileProps {
  onBackToCatalog?: () => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({ onBackToCatalog }) => {
  const { currentUser, profile } = useAuth();

  // State untuk Data yang bisa diedit (Bagian A)
  const [noHp, setNoHp] = useState(profile?.noHp || profile?.nomorHp || '');
  const [unitAsal, setUnitAsal] = useState(profile?.unitAsal || '');
  const [angkatan, setAngkatan] = useState(profile?.angkatan || '');

  // Status feedback form A
  const [savingEditable, setSavingEditable] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State untuk Dialog Pengajuan Perubahan Data (Bagian B)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestNama, setRequestNama] = useState('');
  const [requestNomorIdentitas, setRequestNomorIdentitas] = useState('');
  const [requestAlasan, setRequestAlasan] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);

  // Sync state jika profil dari Firestore diperbarui
  useEffect(() => {
    if (profile) {
      setNoHp(profile.noHp || profile.nomorHp || '');
      setUnitAsal(profile.unitAsal || '');
      setAngkatan(profile.angkatan || '');
    }
  }, [profile]);

  if (!currentUser || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
        <Icon name="HourglassSplit" size={32} className="animate-spin mx-auto text-indigo-600 mb-2" />
        <p className="text-sm">Memuat profil pengguna...</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // Helper label unit asal sesuai tipe peminjam
  const getUnitLabel = () => {
    switch (profile.tipePeminjam) {
      case 'mahasiswa':
        return 'Program Studi (Prodi)';
      case 'dosen':
        return 'Kelompok Keahlian (KK) / Program Studi';
      case 'tendik':
        return 'Unit Kerja / Bagian';
      default:
        return 'Unit Asal';
    }
  };

  // Helper label nomor identitas sesuai tipe peminjam
  const getIdentitasLabel = () => {
    switch (profile.tipePeminjam) {
      case 'mahasiswa':
        return 'Nomor Induk Mahasiswa (NIM)';
      case 'dosen':
        return 'NIP / NIDN Dosen';
      case 'tendik':
        return 'NIP / NIK Tenaga Kependidikan';
      default:
        return 'Nomor Identitas';
    }
  };

  const getTipeBadge = () => {
    switch (profile.tipePeminjam) {
      case 'mahasiswa':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Mahasiswa</span>;
      case 'dosen':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Dosen</span>;
      case 'tendik':
        return <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Tenaga Kependidikan</span>;
      default:
        return null;
    }
  };

  // Validasi nomor HP Indonesia: diawali 08 atau +62, 10 sampai 14 digit
  const validateIndonesianPhone = (phone: string): boolean => {
    const clean = phone.replace(/[\s-]/g, '');
    return /^(08|\+628)[0-9]{8,12}$/.test(clean);
  };

  // Handler simpan data yang bisa diedit (Bagian A)
  const handleSaveEditable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const cleanPhone = noHp.trim().replace(/[\s-]/g, '');

    // Validasi Nomor HP
    if (!cleanPhone) {
      setErrorMsg('Nomor HP wajib diisi.');
      return;
    }
    if (!validateIndonesianPhone(cleanPhone)) {
      setErrorMsg('Nomor HP tidak valid. Wajib diawali 08 atau +62 dan berjumlah 10 sampai 14 digit.');
      return;
    }

    // Validasi Unit Asal
    if (!unitAsal.trim()) {
      setErrorMsg(`${getUnitLabel()} wajib diisi.`);
      return;
    }

    // Validasi Angkatan untuk mahasiswa
    if (profile.tipePeminjam === 'mahasiswa') {
      const yearNum = Number(angkatan.trim());
      if (!/^\d{4}$/.test(angkatan.trim()) || yearNum < 2000 || yearNum > currentYear) {
        setErrorMsg(`Tahun angkatan harus berupa angka 4 digit antara 2000 dan ${currentYear}.`);
        return;
      }
    }

    try {
      setSavingEditable(true);
      const userDocRef = doc(db, 'users', currentUser.uid);

      const updatePayload: Record<string, any> = {
        nomorHp: cleanPhone,
        unitAsal: unitAsal.trim(),
      };

      if (profile.tipePeminjam === 'mahasiswa') {
        updatePayload.angkatan = angkatan.trim();
      }

      await updateDoc(userDocRef, updatePayload);

      setSuccessMsg('Profil berhasil diperbarui');
      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('Error saat menyimpan profil:', err);
      setErrorMsg('Gagal memperbarui profil. Silakan periksa koneksi dan coba lagi.');
    } finally {
      setSavingEditable(false);
    }
  };

  // Buka dialog pengajuan perubahan data identitas
  const handleOpenRequestModal = () => {
    setRequestNama(profile.permintaanPerubahan?.nama || profile.nama);
    setRequestNomorIdentitas(profile.permintaanPerubahan?.nomorIdentitas || profile.nomorIdentitas);
    setRequestAlasan(profile.permintaanPerubahan?.alasan || '');
    setRequestError(null);
    setIsRequestModalOpen(true);
  };

  // Submit pengajuan perubahan data
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    const trimmedNama = requestNama.trim();
    const trimmedIdentitas = requestNomorIdentitas.trim();
    const trimmedAlasan = requestAlasan.trim();

    if (!trimmedAlasan) {
      setRequestError('Alasan pengajuan perubahan data wajib diisi.');
      return;
    }

    if (!trimmedNama && !trimmedIdentitas) {
      setRequestError('Isi nama atau nomor identitas baru yang benar.');
      return;
    }

    // Cek apakah data baru berbeda dengan data yang ada sekarang
    if (trimmedNama === profile.nama && trimmedIdentitas === profile.nomorIdentitas) {
      setRequestError('Data yang diajukan tidak berbeda dengan data yang terdaftar saat ini.');
      return;
    }

    try {
      setSubmittingRequest(true);
      const userDocRef = doc(db, 'users', currentUser.uid);

      const nowFormatted = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      await updateDoc(userDocRef, {
        permintaanPerubahan: {
          nama: trimmedNama || profile.nama,
          nomorIdentitas: trimmedIdentitas || profile.nomorIdentitas,
          alasan: trimmedAlasan,
          waktu: nowFormatted,
        },
      });

      setIsRequestModalOpen(false);
      setSuccessMsg('Permintaan perubahan data berhasil dikirim dan menunggu persetujuan admin.');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error saat mengajukan perubahan data:', err);
      setRequestError('Gagal mengirim pengajuan perubahan data. Silakan coba lagi.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Batalkan pengajuan perubahan data yang sedang menunggu
  const handleCancelRequest = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan perubahan data ini?')) {
      return;
    }

    try {
      setCancellingRequest(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        permintaanPerubahan: deleteField(),
      });
      setSuccessMsg('Pengajuan perubahan data telah dibatalkan.');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('Error saat membatalkan pengajuan:', err);
      setErrorMsg('Gagal membatalkan pengajuan. Silakan coba lagi.');
    } finally {
      setCancellingRequest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-medium mb-2">
            <Icon name="Person" size={14} className="text-indigo-600" />
            <span>Akun Peminjam</span>
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-bold tracking-normal text-slate-900">
            Profil Saya
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Kelola kontak peminjam dan tinjau data identitas resmi yang terdaftar di Laboratorium FIT.
          </p>
        </div>

        {onBackToCatalog && (
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Icon name="ArrowReturnLeft" size={16} />
            <span>Kembali ke Katalog</span>
          </button>
        )}
      </div>

      {/* Global Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <Icon name="CheckCircle" size={18} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
            aria-label="Tutup pesan sukses"
            title="Tutup"
          >
            <Icon name="XLg" size={14} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <Icon name="ExclamationTriangle" size={18} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 hover:text-rose-900 p-1"
            aria-label="Tutup pesan error"
            title="Tutup"
          >
            <Icon name="XLg" size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ========================================================
            BAGIAN A: DATA YANG BISA DIEDIT LANGSUNG OLEH PEMINJAM
            ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="PencilSquare" size={18} className="text-indigo-600" />
                <span>Data Kontak & Akademik</span>
              </h2>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Dapat Diubah
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Field ini dapat Anda perbarui sewaktu-waktu untuk memastikan laboran dapat menghubungi Anda.
            </p>
          </div>

          <form onSubmit={handleSaveEditable} className="space-y-4 text-sm">
            {/* Nomor HP */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">
                Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Icon name="Telephone" size={16} />
                </div>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 081234567890 atau +6281234567890"
                  className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 bg-white tabular-nums"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Wajib diawali <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">08</code> atau{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">+62</code> (10–14 digit). Digunakan untuk notifikasi dan tautan chat WhatsApp laboran.
              </p>
            </div>

            {/* Unit Asal (Prodi / KK / Unit Kerja) */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">
                {getUnitLabel()} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Icon name="Building" size={16} />
                </div>
                <input
                  type="text"
                  value={unitAsal}
                  onChange={(e) => setUnitAsal(e.target.value)}
                  placeholder={
                    profile.tipePeminjam === 'mahasiswa'
                      ? 'Contoh: D3 Rekayasa Perangkat Lunak Aplikasi'
                      : profile.tipePeminjam === 'dosen'
                      ? 'Contoh: KK Rekayasa Komputer & Sistem Embedded'
                      : 'Contoh: Bagian Laboratorium & Bengkel'
                  }
                  className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal text-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Angkatan (Hanya untuk Mahasiswa) */}
            {profile.tipePeminjam === 'mahasiswa' && (
              <div>
                <label className="block text-slate-700 font-medium mb-1.5 text-sm">
                  Tahun Angkatan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon name="Calendar3" size={16} />
                  </div>
                  <input
                    type="number"
                    min={2000}
                    max={currentYear}
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value)}
                    placeholder={`Contoh: ${currentYear - 1}`}
                    className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal text-slate-900 bg-white tabular-nums"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Angka 4 digit antara tahun 2000 sampai {currentYear}.
                </p>
              </div>
            )}

            {/* Tombol Simpan */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={savingEditable}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingEditable ? (
                  <>
                    <Icon name="HourglassSplit" size={16} className="animate-spin" />
                    <span>Menyimpan perubahan...</span>
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={16} />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================
            BAGIAN B: DATA YANG TERKUNCI (DIVERIFIKASI ADMIN)
            ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="Lock" size={18} className="text-amber-600" />
                <span>Identitas Resmi Terverifikasi</span>
              </h2>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                <Icon name="Lock" size={12} className="text-slate-500" />
                Terkunci
              </span>
            </div>
            <p className="text-xs text-amber-900 bg-amber-50/80 p-3 rounded-xl border border-amber-200 mt-2.5 leading-normal">
              Data ini diverifikasi admin lab, sehingga tidak dapat diubah langsung.
            </p>
          </div>

          {/* Pending Change Request Badge / Alert */}
          {profile.permintaanPerubahan && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                  <Icon name="HourglassSplit" size={14} className="text-amber-700" />
                  Perubahan menunggu persetujuan admin
                </span>
                <button
                  type="button"
                  onClick={handleCancelRequest}
                  disabled={cancellingRequest}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline cursor-pointer"
                  title="Batalkan permintaan perubahan data"
                >
                  {cancellingRequest ? 'Membatalkan...' : 'Batalkan'}
                </button>
              </div>

              <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-amber-200">
                <p className="font-semibold text-slate-900">Rincian yang diajukan:</p>
                {profile.permintaanPerubahan.nama && profile.permintaanPerubahan.nama !== profile.nama && (
                  <p>
                    • Nama baru: <span className="font-semibold text-indigo-700">{profile.permintaanPerubahan.nama}</span>
                  </p>
                )}
                {profile.permintaanPerubahan.nomorIdentitas &&
                  profile.permintaanPerubahan.nomorIdentitas !== profile.nomorIdentitas && (
                    <p>
                      • {getIdentitasLabel()}:{' '}
                      <span className="font-mono font-semibold text-indigo-700 tabular-nums">
                        {profile.permintaanPerubahan.nomorIdentitas}
                      </span>
                    </p>
                  )}
                <p>
                  • Alasan: <span className="italic text-slate-600 font-normal">"{profile.permintaanPerubahan.alasan}"</span>
                </p>
                <p className="text-xs text-slate-500 pt-1 font-normal">
                  Diajukan pada: {profile.permintaanPerubahan.waktu}
                </p>
              </div>
              <p className="text-xs text-amber-900 font-normal">
                Data lama tetap berlaku sampai admin menyetujui, dan Anda tetap dapat meminjam alat selama menunggu.
              </p>
            </div>
          )}

          {/* Locked Fields Display */}
          <div className="space-y-3 text-sm">
            {/* Nama Lengkap */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-normal block">
                  Nama Lengkap
                </span>
                <span className="font-semibold text-slate-800 text-sm">{profile.nama}</span>
              </div>
              <Icon name="Lock" size={14} className="text-slate-400" title="Terkunci" />
            </div>

            {/* Tipe Peminjam */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-normal block">
                  Status Civitas Akademika
                </span>
                <div className="mt-1">{getTipeBadge()}</div>
              </div>
              <Icon name="Lock" size={14} className="text-slate-400" title="Terkunci" />
            </div>

            {/* Nomor Identitas */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-normal block">
                  {getIdentitasLabel()}
                </span>
                <span className="font-mono font-semibold text-slate-800 text-sm tabular-nums">{profile.nomorIdentitas}</span>
              </div>
              <Icon name="Lock" size={14} className="text-slate-400" title="Terkunci" />
            </div>

            {/* Email */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-normal block">
                  Email Akun Google
                </span>
                <span className="font-medium text-slate-700 text-sm">{profile.email || currentUser.email}</span>
              </div>
              <Icon name="Lock" size={14} className="text-slate-400" title="Terkunci" />
            </div>

            {/* Status Verifikasi */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-normal block mb-1">
                  Status Verifikasi Peminjam
                </span>
                {profile.terverifikasi ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Icon name="CheckCircle" size={14} className="text-emerald-600" />
                    Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Icon name="HourglassSplit" size={14} className="text-amber-600" />
                    Menunggu Verifikasi
                  </span>
                )}
              </div>
              <Icon name="Lock" size={14} className="text-slate-400" title="Terkunci" />
            </div>
          </div>

          {/* Tombol Ajukan Perubahan Data */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenRequestModal}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Icon name="PencilSquare" size={16} />
              <span>
                {profile.permintaanPerubahan ? 'Ubah Pengajuan Perubahan Data' : 'Ajukan Perubahan Data'}
              </span>
            </button>
            <p className="text-xs text-slate-500 text-center mt-2 font-normal">
              Gunakan fitur ini jika terdapat kesalahan ejaan nama atau nomor identitas resmi.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          DIALOG MODAL: AJUKAN PERUBAHAN DATA NAMA / IDENTITAS
          ======================================================== */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden sm:my-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="bg-indigo-700 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-semibold text-base">Ajukan Perubahan Data Identitas</h3>
                <p className="text-xs text-indigo-100 mt-0.5 font-normal">
                  Perubahan akan ditinjau oleh Admin Laboratorium FIT
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup dialog pengajuan"
                title="Tutup dialog pengajuan"
              >
                <Icon name="XLg" size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-sm overflow-y-auto flex-1">
                {requestError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <Icon name="ExclamationTriangle" size={16} className="text-rose-600 shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl leading-normal text-xs font-normal">
                  <Icon name="InfoCircle" size={14} className="text-amber-700 inline mr-1" />
                  Isi nama dan/atau nomor identitas yang benar. Data lama Anda tetap aktif dan berlaku sampai admin menyetujui pengajuan ini.
                </div>

                {/* Nama yang benar */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5 text-sm">
                    Nama Lengkap yang Benar
                  </label>
                  <input
                    type="text"
                    value={requestNama}
                    onChange={(e) => setRequestNama(e.target.value)}
                    placeholder="Contoh: Muhammad Hafiyyan Luthfi"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-normal text-slate-800 bg-white"
                  />
                  <span className="text-xs text-slate-500 mt-1 block font-normal">
                    Saat ini: <span className="font-medium text-slate-700">{profile.nama}</span>
                  </span>
                </div>

                {/* Nomor Identitas yang benar */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5 text-sm">
                    {getIdentitasLabel()} yang Benar
                  </label>
                  <input
                    type="text"
                    value={requestNomorIdentitas}
                    onChange={(e) => setRequestNomorIdentitas(e.target.value)}
                    placeholder="Masukkan nomor identitas yang benar"
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono font-normal text-slate-800 tabular-nums bg-white"
                  />
                  <span className="text-xs text-slate-500 mt-1 block font-normal">
                    Saat ini:{' '}
                    <span className="font-mono font-medium text-slate-700 tabular-nums">{profile.nomorIdentitas}</span>
                  </span>
                </div>

                {/* Alasan Perubahan */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5 text-sm">
                    Alasan Perubahan Data <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={requestAlasan}
                    onChange={(e) => setRequestAlasan(e.target.value)}
                    placeholder="Contoh: Salah ketik huruf pada nama lengkap saat pertama mendaftar akun..."
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-normal bg-white"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    Jelaskan secara singkat alasan pengajuan agar dapat segera diverifikasi oleh laboran.
                  </p>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 safe-area-pb shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-medium text-sm cursor-pointer text-center order-last sm:order-first"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingRequest ? (
                    <>
                      <Icon name="HourglassSplit" size={14} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="CheckCircle" size={14} />
                      <span>Kirim Pengajuan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
