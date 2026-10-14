import React, { useState } from 'react';
import { User, GraduationCap, Briefcase, UserCheck, AlertCircle, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TipePeminjam } from '../types';

export const CompleteProfileModal: React.FC = () => {
  const { currentUser, saveProfile } = useAuth();
  const [tipePeminjam, setTipePeminjam] = useState<TipePeminjam>('mahasiswa');
  const [nama, setNama] = useState(currentUser?.displayName || '');
  const [nomorIdentitas, setNomorIdentitas] = useState('');
  const [unitAsal, setUnitAsal] = useState('');
  const [angkatan, setAngkatan] = useState('2024');
  const [noHp, setNoHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 sm:p-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            Langkah Pertama
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Lengkapi Profil Peminjam
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">
            Data ini diperlukan untuk administrasi dan penerbitan bukti invoice peminjaman di Laboratorium FIT.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tipe Peminjam Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status Civitas Akademika FIT
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipePeminjam('mahasiswa')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  tipePeminjam === 'mahasiswa'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <GraduationCap className={`w-5 h-5 mb-1 ${tipePeminjam === 'mahasiswa' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs">Mahasiswa</span>
              </button>

              <button
                type="button"
                onClick={() => setTipePeminjam('dosen')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  tipePeminjam === 'dosen'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Briefcase className={`w-5 h-5 mb-1 ${tipePeminjam === 'dosen' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs">Dosen</span>
              </button>

              <button
                type="button"
                onClick={() => setTipePeminjam('tendik')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  tipePeminjam === 'tendik'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Building2 className={`w-5 h-5 mb-1 ${tipePeminjam === 'tendik' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs">Tendik</span>
              </button>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap sesuai identitas"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          {/* Nomor Identitas (Label adapts dynamically) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {getIdentitasLabel()}
            </label>
            <input
              type="text"
              value={nomorIdentitas}
              onChange={(e) => setNomorIdentitas(e.target.value)}
              placeholder={getIdentitasPlaceholder()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          {/* Unit Asal / Prodi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {getUnitLabel()}
            </label>
            <input
              type="text"
              value={unitAsal}
              onChange={(e) => setUnitAsal(e.target.value)}
              placeholder={getUnitPlaceholder()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          {/* Angkatan (Khusus Mahasiswa) */}
          {tipePeminjam === 'mahasiswa' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Angkatan
              </label>
              <input
                type="number"
                min="2018"
                max="2030"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                placeholder="Contoh: 2024"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
          )}

          {/* No Handphone / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Nomor WhatsApp / HP Aktif</span>
              <span className="text-[10px] text-slate-400 font-normal">Untuk koordinasi pengembalian</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            ℹ️ Akun baru memiliki status <b>belum terverifikasi</b>. Setelah mengisi profil, laboran akan memverifikasi identitas Anda sebelum Anda dapat melakukan peminjaman barang.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{submitting ? 'Menyimpan...' : 'Simpan Profil & Lanjutkan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
