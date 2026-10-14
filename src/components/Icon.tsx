import React from 'react';
import {
  Camera,
  Triangle,
  ArrowsMove,
  Lightbulb,
  Mic,
  SdCard,
  Laptop,
  Router,
  HeadsetVr,
  Easel,
  UsbPlug,
  ThreeDots,
  Grid,
  Bag,
  ClockHistory,
  Receipt,
  Printer,
  Speedometer2,
  PersonCheck,
  ArrowReturnLeft,
  Gear,
  Search,
  Funnel,
  PlusLg,
  PencilSquare,
  Trash,
  Google,
  BoxArrowRight,
  FileEarmarkSpreadsheet,
  GeoAlt,
  InfoCircle,
  CheckCircle,
  HourglassSplit,
  Tools,
  XCircle,
  ExclamationTriangle,
  XLg,
  List,
  ArrowLeft,
  ArrowRight,
  ArrowClockwise,
  Check,
  Person,
  Mortarboard,
  Briefcase,
  Building,
  Telephone,
  Calendar3,
  Tag,
  Image,
  Database,
  ShieldCheck,
  Stars,
  People,
  CheckSquare,
  Lock,
  Layers,
  JournalBookmark,
  Icon as BootstrapIconType,
} from 'react-bootstrap-icons';

/**
 * Pemetaan terpusat nama ikon ke komponen Bootstrap Icons
 */
export const ICON_MAP: Record<string, BootstrapIconType> = {
  // Pemetaan Kategori
  Camera,
  Triangle,
  ArrowsMove,
  Lightbulb,
  Mic,
  SdCard,
  Laptop,
  Router,
  HeadsetVr,
  Easel,
  UsbPlug,
  ThreeDots,

  // Pemetaan Navigasi & Aksi
  Grid,
  Bag,
  ClockHistory,
  Receipt,
  Printer,
  Speedometer2,
  PersonCheck,
  ArrowReturnLeft,
  Gear,
  Search,
  Funnel,
  PlusLg,
  PencilSquare,
  Trash,
  Google,
  BoxArrowRight,
  FileEarmarkSpreadsheet,
  GeoAlt,
  InfoCircle,

  // Pemetaan Status Badge
  CheckCircle,
  HourglassSplit,
  Tools,
  XCircle,
  ExclamationTriangle,

  // Ikon Antarmuka Tambahan
  XLg,
  List,
  ArrowLeft,
  ArrowRight,
  ArrowClockwise,
  Check,
  Person,
  Mortarboard,
  Briefcase,
  Building,
  Telephone,
  Calendar3,
  Tag,
  Image,
  Database,
  ShieldCheck,
  Stars,
  People,
  CheckSquare,
  Lock,
  Layers,
  JournalBookmark,

  // Alias Umum & Kompatibilitas
  X: XLg,
  Close: XLg,
  Plus: PlusLg,
  Edit: PencilSquare,
  Edit3: PencilSquare,
  Trash2: Trash,
  Calendar: Calendar3,
  Clock: ClockHistory,
  AlertTriangle: ExclamationTriangle,
  CheckCircle2: CheckCircle,
  Users: People,
  Package: Grid,
  Shield: ShieldCheck,
  Wrench: Tools,
  Settings: Gear,
  SettingsIcon: Gear,
  FileSpreadsheet: FileEarmarkSpreadsheet,
  BookOpen: JournalBookmark,
  MapPin: GeoAlt,
  ImageIcon: Image,
  Sparkles: Stars,
  Info: InfoCircle,

  // Alias Semantik Bahasa Indonesia
  kamera: Camera,
  tripod: Triangle,
  gimbal: ArrowsMove,
  lighting: Lightbulb,
  audio: Mic,
  aksesori: SdCard,
  laptop: Laptop,
  jaringan: Router,
  vr: HeadsetVr,
  presentasi: Easel,
  kabel: UsbPlug,
  lainnya: ThreeDots,

  daftar_barang: Grid,
  keranjang: Bag,
  riwayat: ClockHistory,
  invoice: Receipt,
  cetak: Printer,
  admin: Speedometer2,
  verifikasi: PersonCheck,
  pengembalian: ArrowReturnLeft,
  pengaturan: Gear,
  cari: Search,
  filter: Funnel,
  tambah: PlusLg,
  ubah: PencilSquare,
  hapus: Trash,
  login_google: Google,
  keluar: BoxArrowRight,
  ekspor: FileEarmarkSpreadsheet,
  lokasi: GeoAlt,
  info: InfoCircle,

  tersedia: CheckCircle,
  dipinjam: HourglassSplit,
  perawatan: Tools,
  rusak: XCircle,
  terlambat: ExclamationTriangle,
  tutup: XLg,
  menu: List,
};

export type IconName = keyof typeof ICON_MAP | string;

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
  title?: string;
}

/**
 * Komponen pembungkus terpusat untuk seluruh ikon di aplikasi PinjamIn.
 * Menggunakan React Bootstrap Icons dengan warna default currentColor.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color = 'currentColor',
  title,
  ...props
}) => {
  const IconComponent = ICON_MAP[name] || ThreeDots;

  return (
    <IconComponent
      size={size}
      className={`shrink-0 ${className}`}
      color={color}
      title={title}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      {...props}
    />
  );
};

/**
 * Pemetaan kategori (berdasarkan nama atau prefix kategori) ke nama ikon Bootstrap Icons
 * Kamera = Camera, Tripod = Triangle, Gimbal = ArrowsMove, Lighting = Lightbulb,
 * Audio = Mic, Aksesori Kamera = SdCard, Komputer & Laptop = Laptop, Jaringan = Router,
 * VR/AR = HeadsetVr, Presentasi = Easel, Kabel & Konektor = UsbPlug, Lainnya = ThreeDots.
 * Kategori baru yang ditambah admin memakai ThreeDots secara default.
 */
export function getCategoryIconName(categoryName?: string): string {
  if (!categoryName) return 'ThreeDots';
  const norm = categoryName.trim().toLowerCase();

  if (norm.includes('aksesori') || norm.includes('sd card') || norm.includes('memori')) {
    return 'SdCard';
  }
  if (norm.includes('kamera') || norm.startsWith('kam')) {
    return 'Camera';
  }
  if (norm.includes('tripod') || norm.startsWith('tri')) {
    return 'Triangle';
  }
  if (norm.includes('gimbal') || norm.startsWith('gim')) {
    return 'ArrowsMove';
  }
  if (norm.includes('lighting') || norm.includes('lampu') || norm.startsWith('ligh')) {
    return 'Lightbulb';
  }
  if (norm.includes('audio') || norm.includes('mic') || norm.startsWith('aud')) {
    return 'Mic';
  }
  if (norm.includes('komputer') || norm.includes('laptop') || norm.includes('pc')) {
    return 'Laptop';
  }
  if (norm.includes('jaringan') || norm.includes('router') || norm.includes('network') || norm.includes('wifi')) {
    return 'Router';
  }
  if (norm.includes('vr') || norm.includes('ar') || norm.includes('headset')) {
    return 'HeadsetVr';
  }
  if (norm.includes('presentasi') || norm.includes('easel') || norm.includes('proyektor')) {
    return 'Easel';
  }
  if (norm.includes('kabel') || norm.includes('konektor') || norm.includes('usb') || norm.includes('plug')) {
    return 'UsbPlug';
  }
  if (norm.includes('lain')) {
    return 'ThreeDots';
  }

  // Default untuk kategori baru yang ditambah admin
  return 'ThreeDots';
}

/**
 * Pemetaan status ke nama ikon Bootstrap Icons (di badge, dengan teks tetap ditampilkan)
 * Tersedia = CheckCircle, Dipinjam = HourglassSplit, Perawatan = Tools,
 * Rusak = XCircle, Terlambat = ExclamationTriangle.
 */
export function getStatusIconName(status?: string): string {
  if (!status) return 'InfoCircle';
  const norm = status.trim().toLowerCase();

  switch (norm) {
    case 'tersedia':
      return 'CheckCircle';
    case 'dipinjam':
      return 'HourglassSplit';
    case 'perawatan':
      return 'Tools';
    case 'rusak':
      return 'XCircle';
    case 'terlambat':
      return 'ExclamationTriangle';
    default:
      return 'InfoCircle';
  }
}
