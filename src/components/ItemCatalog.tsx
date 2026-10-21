import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query,
  where 
} from 'firebase/firestore';
import { Icon, getCategoryIconName } from './Icon';
import { db } from '../lib/firebase';
import { Item, Category, ItemStatus, Loan } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDateIndo } from '../lib/dateUtils';

interface ItemCatalogProps {
  cart: Item[];
  onToggleCart: (item: Item) => void;
  onOpenCart: () => void;
  detailItem?: Item | null;
  onSelectDetailItem?: (item: Item | null) => void;
}

export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  cart,
  onToggleCart,
  onOpenCart,
  detailItem: controlledDetailItem,
  onSelectDetailItem,
}) => {
  const { isVerified } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [internalDetailItem, setInternalDetailItem] = useState<Item | null>(null);
  const [detailImgError, setDetailImgError] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const activeDetail = controlledDetailItem !== undefined ? controlledDetailItem : internalDetailItem;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenDetail = (item: Item) => {
    setDetailImgError(false);
    if (onSelectDetailItem) {
      onSelectDetailItem(item);
    } else {
      setInternalDetailItem(item);
    }
  };

  const handleCloseDetail = () => {
    if (onSelectDetailItem) {
      onSelectDetailItem(null);
    } else {
      setInternalDetailItem(null);
    }
  };

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

  // Real-time snapshot for active loans (jadwal kalender booking)
  useEffect(() => {
    const qLoans = query(
      collection(db, 'loans'),
      where('status', 'in', ['menunggu_persetujuan', 'disetujui', 'dipinjam'])
    );
    const unsubscribeLoans = onSnapshot(
      qLoans,
      (snapshot) => {
        const list: Loan[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as Omit<Loan, 'id'>) });
        });
        setActiveLoans(list);
      },
      (error) => {
        console.warn('Error fetching active loans snapshot for calendar:', error);
      }
    );

    return () => unsubscribeLoans();
  }, []);

  const getStatusBadge = (status: ItemStatus, isCompact = false) => {
    const padClass = isCompact ? 'px-1.5 py-0.5 text-[10px] sm:text-xs' : 'px-2.5 py-1 text-xs';
    const iconSize = isCompact ? 12 : 14;

    switch (status) {
      case 'tersedia':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${padClass}`}>
            <Icon name="CheckCircle" size={iconSize} className="text-emerald-600 shrink-0" />
            <span>Tersedia</span>
          </span>
        );
      case 'dipinjam':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${padClass}`}>
            <Icon name="HourglassSplit" size={iconSize} className="text-amber-600 shrink-0" />
            <span>Dipinjam</span>
          </span>
        );
      case 'menunggu_persetujuan':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-sky-100 text-sky-800 border border-sky-200 ${padClass}`}>
            <Icon name="HourglassSplit" size={iconSize} className="text-sky-600 shrink-0" />
            <span>Menunggu Admin</span>
          </span>
        );
      case 'perawatan':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${padClass}`}>
            <Icon name="Tools" size={iconSize} className="text-slate-500 shrink-0" />
            <span>Perawatan</span>
          </span>
        );
      case 'rusak':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-200 ${padClass}`}>
            <Icon name="XCircle" size={iconSize} className="text-rose-600 shrink-0" />
            <span>Rusak</span>
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

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll('.scroll-reveal'));

    if (!revealNodes.length) return;

    const applyReveal = () => {
      if (!('IntersectionObserver' in window)) {
        revealNodes.forEach((node) => node.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -30px 0px',
        }
      );

      revealNodes.forEach((node) => observer.observe(node));
    };

    const frame = requestAnimationFrame(applyReveal);
    return () => cancelAnimationFrame(frame);
  }, [filteredItems.length, loading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner (Ringkas di ponsel) */}
      <div className="scroll-reveal mb-4 sm:mb-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/10">
            <Icon name="Stars" size={16} className="text-amber-400" />
            Laboratorium Fakultas Ilmu Terapan
          </div>
          <h1 className="text-[20px] sm:text-[28px] font-bold tracking-normal mb-1 sm:mb-2 text-white leading-tight">
            Katalog Peralatan & Aset Lab
          </h1>
          <p className="text-[13px] sm:text-sm font-normal text-indigo-100 leading-snug line-clamp-2">
            Pilih peralatan yang Anda butuhkan untuk praktikum, tugas akhir, penelitian, atau dokumentasi kegiatan.
          </p>

          <div className="mt-3 sm:mt-5 flex items-center gap-2 sm:gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10 font-medium text-[12px] whitespace-nowrap">
              Total Alat: <span className="font-bold text-white tabular-nums">{items.length}</span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-emerald-400/30 text-emerald-300 font-medium text-[12px] whitespace-nowrap">
              Siap Dipinjam: <span className="font-bold text-white tabular-nums">{availableCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="scroll-reveal bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-5 mb-6 sm:mb-8 space-y-3 sm:space-y-4 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-md">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          {/* Search Input (44px height, 16px font on mobile) */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="Search" size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMobile ? "Cari alat atau kode aset" : "Cari nama alat, kode aset, merek, atau model (contoh: Sony, A7III, CAM-001)..."}
              className="w-full h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] justify-center"
                aria-label="Hapus kata kunci pencarian"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Status Filter (Dropdown di baris sama atau bawahnya dengan w-full) */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-medium bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="perawatan">Perawatan</option>
              <option value="rusak">Rusak</option>
            </select>
          </div>
        </div>

        {/* 12 Category Filter Chips with Right Gradient Fade & Scroll-Snap */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar snap-x snap-mandatory scroll-smooth pr-6 sm:pr-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center justify-center shrink-0 snap-start ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center justify-center shrink-0 snap-start ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.nama}
              </button>
            ))}
          </div>
          {/* Gradient fade indicator on right edge */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-white via-white/80 to-transparent sm:hidden" />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-3.5 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
              <div className="h-3.5 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl mt-3" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Grid" size={32} />
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
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredItems.map((item, index) => {
            const isSelected = cart.some((c) => c.id === item.id);
            const isBookable = item.status !== 'rusak' && item.status !== 'perawatan';
            const hasPhoto = !!item.fotoUrl && !brokenImages[item.id];

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                style={{ transitionDelay: `${index * 35}ms` }}
                className={`scroll-reveal bg-white rounded-2xl border transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden group cursor-pointer hover:-translate-y-1 ${
                  !isBookable ? 'opacity-80 hover:opacity-100' : ''
                } ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-100/80'
                    : 'border-slate-200/90 hover:border-indigo-200 hover:shadow-[0_18px_35px_-24px_rgba(79,70,229,0.5)]'
                }`}
              >
                {/* Photo 4:3 Fixed Ratio with Contain and Small Padding */}
                <div className="relative aspect-[4/3] w-full bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-2 sm:p-2.5">
                  {hasPhoto ? (
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <Icon name={getCategoryIconName(item.kategoriNama)} size={28} className="mb-1" />
                      <span className="text-[11px] font-semibold text-slate-500 line-clamp-1 px-2 text-center">
                        {item.kategoriNama || 'Peralatan Lab'}
                      </span>
                    </div>
                  )}

                  {/* Status Overlay (Pojok kanan atas, ukuran lebih kecil) */}
                  <div className="absolute top-2 right-2 shadow-xs">
                    {getStatusBadge(item.status, true)}
                  </div>

                  {/* Asset Code Overlay (Pojok kiri atas, 11px) */}
                  <div className="absolute top-2 left-2">
                    <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-white/95 text-slate-800 shadow-xs border border-slate-200/80 backdrop-blur-sm tabular-nums">
                      {item.kodeAset}
                    </span>
                  </div>
                </div>

                {/* Card Content Ringkas */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand & Model (12px abu-abu) */}
                    {item.merek || item.model ? (
                      <p className="text-xs text-slate-500 mb-0.5 truncate font-normal">
                        {[item.merek, item.model].filter(Boolean).join(' • ')}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mb-0.5 truncate font-normal">
                        Lab FIT Asset
                      </p>
                    )}

                    {/* Item Name (14px weight 600 dibatasi 2 baris) */}
                    <h3
                      className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors"
                      title={item.nama}
                    >
                      {item.nama}
                    </h3>

                    {/* Category */}
                    <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1 font-normal truncate">
                      <Icon name="Tag" size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{item.kategoriNama || 'Peralatan Lab'}</span>
                    </p>
                  </div>

                  {/* Baris Bawah: Badge Kondisi */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {getKondisiBadge(item.kondisi)}
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                      <Icon name="InfoCircle" size={14} />
                      Detail
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button (Min-h 44px) */}
                <div className="p-2.5 sm:p-3 bg-slate-50/70 border-t border-slate-100">
                  {isBookable ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCart(item);
                      }}
                      className={`w-full min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ease-out cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200/80'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Icon name="Check" size={16} />
                          <span>Hapus dari Pilihan</span>
                        </>
                      ) : (
                        <>
                          <Icon name="PlusLg" size={16} />
                          <span>{item.status === 'dipinjam' ? 'Booking Jadwal Lain' : 'Pilih untuk Pinjam'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(item);
                      }}
                      className="w-full min-h-[44px] py-2 px-2 rounded-xl text-[11px] sm:text-xs font-medium flex items-center justify-center bg-slate-100 text-slate-500 border border-slate-200/60"
                    >
                      {item.status === 'perawatan' ? 'Dalam Perawatan' : 'Barang Rusak'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG DETAIL BARANG (UNTUK PEMINJAM) - BOTTOM SHEET DI MOBILE, MODAL DI DESKTOP */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden sm:my-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header Photo 4:3 fixed ratio with contain, background slate-50 and small padding */}
            <div className="relative aspect-[4/3] w-full bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-3 sm:p-4 shrink-0">
              {activeDetail.fotoUrl && !detailImgError ? (
                <img
                  src={activeDetail.fotoUrl}
                  alt={activeDetail.nama}
                  className="w-full h-full object-contain"
                  onError={() => setDetailImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                  <Icon name={getCategoryIconName(activeDetail.kategoriNama)} size={40} className="mb-2" />
                  <span className="text-xs uppercase font-semibold tracking-wide text-slate-500">
                    {activeDetail.kategoriNama}
                  </span>
                </div>
              )}
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Kembali ke katalog"
                title="Kembali ke katalog"
                className="absolute top-3 left-3 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center sm:hidden"
              >
                <Icon name="ArrowLeft" size={18} />
              </button>
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Tutup detail barang"
                title="Tutup detail barang"
                className="absolute top-3 right-3 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Icon name="XLg" size={16} />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-900 shadow tabular-nums border border-slate-200">
                  {activeDetail.kodeAset}
                </span>
                {getStatusBadge(activeDetail.status, true)}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-sm">
              <div>
                {(activeDetail.merek || activeDetail.model) && (
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    {[activeDetail.merek, activeDetail.model].filter(Boolean).join(' • ')}
                  </p>
                )}
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeDetail.nama}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5 font-normal">
                  <Icon name="Tag" size={14} className="text-slate-400" />
                  <span>Kategori: {activeDetail.kategoriNama}</span>
                </p>
              </div>

              {/* Lokasi Simpan & Tahun Perolehan */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-start gap-2">
                  <Icon name="GeoAlt" size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      Lokasi simpan di lab
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {activeDetail.lokasiSimpan || 'Laboratorium FIT'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Icon name="Calendar3" size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      Tahun perolehan
                    </span>
                    <span className="font-semibold text-slate-800 text-sm tabular-nums">
                      {activeDetail.tahunPerolehan ? `Tahun ${activeDetail.tahunPerolehan}` : 'Tersedia di Lab'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spesifikasi */}
              {activeDetail.spesifikasi && (
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                    <Icon name="InfoCircle" size={16} className="text-indigo-600" />
                    <span>Spesifikasi Teknis</span>
                  </h4>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 whitespace-pre-line leading-relaxed text-sm">
                    {activeDetail.spesifikasi}
                  </div>
                </div>
              )}

              {/* Kelengkapan */}
              {activeDetail.kelengkapan && activeDetail.kelengkapan.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                    <Icon name="Grid" size={16} className="text-indigo-600" />
                    <span>Paket Kelengkapan Barang ({activeDetail.kelengkapan.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeDetail.kelengkapan.map((acc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <Icon name="CheckCircle" size={16} className="text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">{acc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 italic">
                    * Seluruh kelengkapan di atas wajib dikembalikan secara utuh bersama unit utama.
                  </p>
                </div>
              )}

              {/* Jadwal Kalender Booking Alat */}
              {(() => {
                const itemBookings = activeLoans.filter((l) =>
                  l.items.some((it) => it.itemId === activeDetail.id)
                );

                return (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Icon name="Calendar3" size={15} className="text-indigo-600" />
                      <span>Jadwal Booking Terdaftar ({itemBookings.length})</span>
                    </h4>
                    {itemBookings.length === 0 ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                        <Icon name="CheckCircle" size={15} className="text-emerald-600 shrink-0" />
                        <span>Belum ada jadwal booking. Alat ini bebas diajukan untuk rentang tanggal manapun.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {itemBookings.map((b) => (
                          <div key={b.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-slate-800">
                                {formatDateIndo(b.tglPinjam)} s/d {formatDateIndo(b.tglRencanaKembali)}
                              </span>
                              <span className="text-[10px] text-slate-500 block">No. Invoice: {b.noInvoice}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'dipinjam'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : b.status === 'disetujui'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}>
                              {b.status === 'dipinjam' ? 'Sedang Dipakai' : b.status === 'disetujui' ? 'Booking Disetujui' : 'Menunggu Approval'}
                            </span>
                          </div>
                        ))}
                        <p className="text-[11px] text-slate-500 italic">
                          * Anda tetap dapat meminjam alat ini untuk tanggal di luar jadwal terdaftar di atas.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Dialog Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between safe-area-pb shrink-0">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="min-h-[44px] px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer text-sm"
              >
                Tutup
              </button>

              {activeDetail.status !== 'rusak' && activeDetail.status !== 'perawatan' && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleCart(activeDetail);
                    handleCloseDetail();
                  }}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer flex items-center gap-2 ${
                    cart.some((c) => c.id === activeDetail.id)
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  }`}
                >
                  {cart.some((c) => c.id === activeDetail.id) ? (
                    <>
                      <Icon name="Check" size={16} />
                      <span>Hapus dari Keranjang</span>
                    </>
                  ) : (
                    <>
                      <Icon name="PlusLg" size={16} />
                      <span>{activeDetail.status === 'dipinjam' ? 'Booking Jadwal Lain' : 'Pilih untuk Pinjam'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar: "2 barang · Lanjut meminjam" */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-[64px] left-3 right-3 z-30 animate-in slide-in-from-bottom duration-200">
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between font-semibold text-sm cursor-pointer min-h-[48px] border border-slate-700/50"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center tabular-nums">
                {cart.length}
              </span>
              <span className="text-white text-xs sm:text-sm font-semibold">{cart.length} barang dipilih</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl">
              <span>Lanjut Meminjam</span>
              <Icon name="ArrowRight" size={14} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
