import React, { useState } from 'react';
import { Icon } from './Icon';
import { useAuth } from '../context/AuthContext';
import { TipePeminjam } from '../types';

interface CompleteProfileModalProps {
  onLogout?: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ onLogout }) => {
  const { currentUser, saveProfile, logout } = useAuth();
  const [tipePeminjam, setTipePeminjam] = useState<TipePeminjam>('mahasiswa');
  const [nama, setNama] = useState(currentUser?.displayName || '');
  const [nomorIdentitas, setNomorIdentitas] = useState('');
  const [unitAsal, setUnitAsal] = useState('');
  const [angkatan, setAngkatan] = useState('2024');
  const [noHp, setNoHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const getIdentitasLabel = () => {
    switch (tipePeminjam) {
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

  const getIdentitasPlaceholder = () => {
    switch (tipePeminjam) {
      case 'mahasiswa':
        return 'Contoh: 6701213045';
      case 'dosen':
        return 'Contoh: 0412088501';
      case 'tendik':
        return 'Contoh: 198505122010121001';
      default:
        return 'Nomor Identitas';
    }
  };

  const getUnitLabel = () => {
    switch (tipePeminjam) {
      case 'mahasiswa':
        return 'Program Studi (Prodi)';
      case 'dosen':
        return 'Program Studi / Kelompok Keahlian (KK)';
      case 'tendik':
        return 'Unit Kerja / Bagian';
      default:
        return 'Unit Asal';
    }
  };

  const getUnitPlaceholder = () => {
    switch (tipePeminjam) {
      case 'mahasiswa':
        return 'Contoh: D3 Rekayasa Perangkat Lunak Aplikasi';
      case 'dosen':
        return 'Contoh: KK Multimedia & Internet of Things';
      case 'tendik':
        return 'Contoh: Pengelola Laboratorium Komputer FIT';
      default:
        return 'Unit Asal';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    if (!nomorIdentitas.trim()) {
      setErrorMsg(`${getIdentitasLabel()} wajib diisi`);
      return;
    }
    if (!unitAsal.trim()) {
      setErrorMsg(`${getUnitLabel()} wajib diisi`);
      return;
    }
    if (!noHp.trim()) {
      setErrorMsg('Nomor WhatsApp / HP aktif wajib diisi');
      return;
    }
    if (tipePeminjam === 'mahasiswa' && !angkatan.trim()) {
      setErrorMsg('Tahun angkatan wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await saveProfile({
        nama: nama.trim(),
        tipePeminjam,
        nomorIdentitas: nomorIdentitas.trim(),
        unitAsal: unitAsal.trim(),
        angkatan: tipePeminjam === 'mahasiswa' ? angkatan.trim() : '',
        noHp: noHp.trim(),
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal menyimpan profil. Silakan periksa koneksi atau coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden sm:my-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-5 sm:p-7 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-semibold">
              <Icon name="PersonCheck" size={16} />
              Langkah Pertama
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
              title="Keluar / Ganti Akun"
            >
              <Icon name="BoxArrowRight" size={14} />
              <span>Keluar / Ganti Akun</span>
            </button>
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-normal">
            Lengkapi Profil Peminjam
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
            Data ini diperlukan untuk administrasi dan penerbitan bukti invoice peminjaman di Laboratorium FIT.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <Icon name="ExclamationTriangle" size={16} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tipe Peminjam Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status Civitas Akademika FIT
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipePeminjam('mahasiswa')}
                  className={`flex flex-col items-center justify-center min-h-[52px] p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    tipePeminjam === 'mahasiswa'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Icon name="Mortarboard" size={20} className={`mb-1 ${tipePeminjam === 'mahasiswa' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs">Mahasiswa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipePeminjam('dosen')}
                  className={`flex flex-col items-center justify-center min-h-[52px] p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    tipePeminjam === 'dosen'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Icon name="Briefcase" size={20} className={`mb-1 ${tipePeminjam === 'dosen' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs">Dosen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipePeminjam('tendik')}
                  className={`flex flex-col items-center justify-center min-h-[52px] p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    tipePeminjam === 'tendik'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Icon name="Building" size={20} className={`mb-1 ${tipePeminjam === 'tendik' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs">Tendik</span>
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap sesuai identitas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                required
              />
            </div>

            {/* Nomor Identitas (Label adapts dynamically) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {getIdentitasLabel()}
              </label>
              <input
                type="text"
                value={nomorIdentitas}
                onChange={(e) => setNomorIdentitas(e.target.value)}
                placeholder={getIdentitasPlaceholder()}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 tabular-nums bg-white"
                required
              />
            </div>

            {/* Unit Asal / Prodi */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {getUnitLabel()}
              </label>
              <input
                type="text"
                value={unitAsal}
                onChange={(e) => setUnitAsal(e.target.value)}
                placeholder={getUnitPlaceholder()}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                required
              />
            </div>

            {/* Angkatan (Khusus Mahasiswa) */}
            {tipePeminjam === 'mahasiswa' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tahun Angkatan
                </label>
                <input
                  type="number"
                  min="2018"
                  max="2030"
                  value={angkatan}
                  onChange={(e) => setAngkatan(e.target.value)}
                  placeholder="Contoh: 2024"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 tabular-nums bg-white"
                  required
                />
              </div>
            )}

            {/* No Handphone / WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Nomor WhatsApp / HP Aktif</span>
                <span className="text-xs text-slate-400 font-normal">Untuk koordinasi pengembalian</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Icon name="Telephone" size={16} />
                </div>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 tabular-nums bg-white"
                  required
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-1.5 leading-normal">
              <Icon name="InfoCircle" size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <span>Akun baru memiliki status <b>belum terverifikasi</b>. Setelah mengisi profil, laboran akan memverifikasi identitas Anda sebelum Anda dapat melakukan peminjaman barang.</span>
            </p>
          </div>

          {/* Sticky Submit Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 safe-area-pb shrink-0">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base sm:text-sm rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>{submitting ? 'Menyimpan...' : 'Simpan Profil & Lanjutkan'}</span>
            </button>
            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors py-1 cursor-pointer"
              >
                <Icon name="BoxArrowRight" size={13} />
                <span>Bukan akun Anda? <span className="font-semibold underline">Keluar / Ganti Akun</span></span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
