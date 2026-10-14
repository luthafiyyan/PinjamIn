import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { 
  Search, 
  Plus, 
  Check, 
  Wrench, 
  XCircle, 
  Sparkles,
  ShoppingBag,
  Camera,
  Layers,
  Info,
  MapPin,
  Calendar,
  CheckSquare,
  X,
  Package
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Item, Category, ItemStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface ItemCatalogProps {
  cart: Item[];
  onToggleCart: (item: Item) => void;
  onOpenCart: () => void;
}

export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  cart,
  onToggleCart,
  onOpenCart,
}) => {
  const { isVerified } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  // Real-time snapshot for Categories
  useEffect(() => {
    const qCat = query(collection(db, 'categories'));
    const unsubscribeCat = onSnapshot(
      qCat,
      (snapshot) => {
        const catList: Category[] = [];
        snapshot.forEach((doc) => {
          catList.push({ id: doc.id, ...(doc.data() as Omit<Category, 'id'>) });
        });
        catList.sort((a, b) => (a.urutan ?? 99) - (b.urutan ?? 99) || a.nama.localeCompare(b.nama));
        setCategories(catList);
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );

    return () => unsubscribeCat();
  }, []);

  // Real-time snapshot for Items
  useEffect(() => {
    const qItems = query(collection(db, 'items'));
    const unsubscribeItems = onSnapshot(
      qItems,
      (snapshot) => {
        const itemList: Item[] = [];
        snapshot.forEach((doc) => {
          itemList.push({ id: doc.id, ...(doc.data() as Omit<Item, 'id'>) });
        });
        itemList.sort((a, b) => a.kodeAset.localeCompare(b.kodeAset));
        setItems(itemList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching items snapshot:', error);
        setLoading(false);
      }
    );

    return () => unsubscribeItems();
  }, []);

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'tersedia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Tersedia
          </span>
        );
      case 'dipinjam':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Dipinjam
          </span>
        );
      case 'perawatan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Wrench className="w-3 h-3 text-slate-500" />
            Perawatan
          </span>
        );
      case 'rusak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rusak
          </span>
        );
      default:
        return null;
    }
  };

  const getKondisiBadge = (kondisi: 'baik' | 'perlu_cek') => {
    if (kondisi === 'baik') {
      return (
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          Kondisi: Baik
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
        Kondisi: Perlu Cek
      </span>
    );
  };

  // Filter items (search matches nama, kodeAset, kategori, merek, and model)
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.kodeAset.toLowerCase().includes(q) ||
      item.kategoriNama?.toLowerCase().includes(q) ||
      (item.merek && item.merek.toLowerCase().includes(q)) ||
      (item.model && item.model.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = items.filter((i) => i.status === 'tersedia').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Laboratorium Fakultas Ilmu Terapan
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
            Katalog Peralatan & Aset Lab
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Pilih peralatan yang Anda butuhkan untuk praktikum, tugas akhir, penelitian, atau dokumentasi kegiatan.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10 font-medium">
              Total Alat: <span className="font-bold text-white">{items.length}</span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-emerald-400/30 text-emerald-300 font-medium">
              Siap Dipinjam: <span className="font-bold text-white">{availableCount}</span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={onOpenCart}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Lihat Keranjang ({cart.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama alat, kode aset, merek, atau model (contoh: Sony, A7III, CAM-001)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0 hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="all">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="perawatan">Perawatan</option>
              <option value="rusak">Rusak</option>
            </select>
          </div>
        </div>

        {/* 12 Category Filter Chips (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-36 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Tidak ada alat ditemukan
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Coba ganti kata kunci pencarian merek, model, atau reset filter kategori.'
              : 'Belum ada data barang di inventaris laboratorium.'}
          </p>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isSelected = cart.some((c) => c.id === item.id);
            const isAvailable = item.status === 'tersedia';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Photo or Category Placeholder Banner */}
                <div className="relative h-44 bg-slate-100 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                  {item.fotoUrl ? (
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          parent.classList.add('bg-indigo-50');
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                      <Camera className="w-10 h-10 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {item.kategoriNama}
                      </span>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3 shadow-sm">
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Asset Code Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-sm border border-slate-200/80 backdrop-blur-sm">
                      {item.kodeAset}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand & Model subtitle */}
                    {(item.merek || item.model) && (
                      <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1 truncate">
                        {[item.merek, item.model].filter(Boolean).join(' • ')}
                      </p>
                    )}

                    {/* Item Name */}
                    <h3 
                      onClick={() => setDetailItem(item)}
                      className="font-bold text-slate-900 text-base mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Klik untuk melihat spesifikasi lengkap"
                    >
                      {item.nama}
                    </h3>

                    {/* Category Pill */}
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.kategoriNama || 'Peralatan Lab'}</span>
                    </p>
                  </div>

                  {/* Conditions & Detail Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {getKondisiBadge(item.kondisi)}
                    <button
                      type="button"
                      onClick={() => setDetailItem(item)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                  {isAvailable ? (
                    <button
                      onClick={() => onToggleCart(item)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Hapus dari Pilihan</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pilih untuk Pinjam</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-center bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed">
                      {item.status === 'dipinjam'
                        ? 'Sedang Dipinjam'
                        : item.status === 'perawatan'
                        ? 'Dalam Perawatan'
                        : 'Barang Rusak'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button for Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30 sm:hidden">
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-5 rounded-full shadow-lg shadow-indigo-900/30 transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm">Pinjam ({cart.length})</span>
          </button>
        </div>
      )}

      {/* DIALOG DETAIL BARANG (UNTUK PEMINJAM) */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Photo or Placeholder */}
            <div className="relative h-56 bg-slate-100 overflow-hidden flex items-center justify-center">
              {detailItem.fotoUrl ? (
                <img
                  src={detailItem.fotoUrl}
                  alt={detailItem.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <Camera className="w-16 h-16 mb-2" />
                  <span className="text-xs uppercase font-bold tracking-wider">
                    {detailItem.kategoriNama}
                  </span>
                </div>
              )}
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white text-slate-900 shadow">
                  {detailItem.kodeAset}
                </span>
                {getStatusBadge(detailItem.status)}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-xs">
              <div>
                {(detailItem.merek || detailItem.model) && (
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    {[detailItem.merek, detailItem.model].filter(Boolean).join(' • ')}
                  </p>
                )}
                <h3 className="text-xl font-extrabold text-slate-900">
                  {detailItem.nama}
                </h3>
                <p className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kategori: {detailItem.kategoriNama}</span>
                </p>
              </div>

              {/* Lokasi Simpan & Tahun Perolehan */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Lokasi Simpan di Lab
                    </span>
                    <span className="font-semibold text-slate-800">
                      {detailItem.lokasiSimpan || 'Laboratorium FIT'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Tahun Perolehan
                    </span>
                    <span className="font-semibold text-slate-800">
                      {detailItem.tahunPerolehan ? `Tahun ${detailItem.tahunPerolehan}` : 'Tersedia di Lab'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spesifikasi */}
              {detailItem.spesifikasi && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Spesifikasi Teknis</span>
                  </h4>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 whitespace-pre-line leading-relaxed">
                    {detailItem.spesifikasi}
                  </div>
                </div>
              )}

              {/* Kelengkapan */}
              {detailItem.kelengkapan && detailItem.kelengkapan.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Paket Kelengkapan Barang ({detailItem.kelengkapan.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detailItem.kelengkapan.map((acc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">{acc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 italic">
                    * Seluruh kelengkapan di atas wajib dikembalikan secara utuh bersama unit utama.
                  </p>
                </div>
              )}
            </div>

            {/* Dialog Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                Tutup
              </button>

              {detailItem.status === 'tersedia' && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleCart(detailItem);
                    setDetailItem(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-2 ${
                    cart.some((c) => c.id === detailItem.id)
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  }`}
                >
                  {cart.some((c) => c.id === detailItem.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Hapus dari Keranjang</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pilih untuk Pinjam</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
