import React from 'react';
import { Icon } from './Icon';
import { useAuth } from '../context/AuthContext';

export const PendingVerificationScreen: React.FC = () => {
  const { profile, currentUser, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xl shadow-amber-900/5 overflow-hidden text-center p-8 sm:p-10">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon name="ClockHistory" size={32} className="animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-3">
          <Icon name="HourglassSplit" size={14} className="text-amber-600" />
          <span>Menunggu Verifikasi Admin</span>
        </div>

        <h2 className="text-[18px] sm:text-[20px] font-semibold text-slate-900 mb-3">
          Halo, {profile?.nama || currentUser?.displayName}!
        </h2>

        <p className="text-slate-600 text-sm leading-normal max-w-lg mx-auto mb-8 font-normal">
          Akun Anda telah terdaftar sebagai <span className="font-semibold text-slate-900 capitalize">{profile?.tipePeminjam || 'peminjam'}</span> di sistem <span className="font-semibold text-slate-900">PinjamIn Laboratorium FIT</span>. Untuk menjaga keamanan inventaris, akun Anda sedang menunggu persetujuan verifikasi dari laboran atau petugas pengelola.
        </p>

        {/* User Card Summary */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left mb-8 max-w-md mx-auto space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Email:</span>
            <span className="font-semibold text-slate-800">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">
              {profile?.tipePeminjam === 'mahasiswa' ? 'NIM' : profile?.tipePeminjam === 'dosen' ? 'NIP/NIDN' : 'NIP/NIK'}:
            </span>
            <span className="font-semibold text-slate-800 tabular-nums">{profile?.nomorIdentitas}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Unit / Prodi:</span>
            <span className="font-semibold text-slate-800">{profile?.unitAsal}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">No. WhatsApp / HP:</span>
            <span className="font-semibold text-slate-800 tabular-nums">{profile?.nomorHp || profile?.noHp}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Status Akun:</span>
            <span className="text-amber-700 font-semibold bg-amber-100/70 px-2 py-0.5 rounded">
              Belum Diverifikasi
            </span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-900/80 max-w-md mx-auto mb-8 text-left space-y-1">
          <p className="font-semibold flex items-center gap-1.5 text-indigo-950">
            <Icon name="CheckCircle" size={16} className="text-indigo-600" />
            Apa yang harus dilakukan?
          </p>
          <p>
            Silakan temui laboran di ruang Laboratorium FIT atau tunggu beberapa saat. Halaman ini akan otomatis diperbarui secara realtime segera setelah admin menekan tombol verifikasi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="ArrowClockwise" size={16} />
            Segarkan Status
          </button>
          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="BoxArrowRight" size={16} />
            Keluar Akun
          </button>
        </div>
      </div>
    </div>
  );
};
