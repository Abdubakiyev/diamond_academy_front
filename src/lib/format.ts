import { format, formatDistanceToNowStrict } from 'date-fns';

/** Tailwind sinflarini birlashtirish: cn('a', cond && 'b') */
export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export const formatDate = (value?: string | Date | null) =>
  value ? format(new Date(value), 'dd.MM.yyyy') : '—';

export const formatDateTime = (value?: string | Date | null) =>
  value ? format(new Date(value), 'dd.MM.yyyy HH:mm') : '—';

export const timeAgo = (value?: string | Date | null) =>
  value ? formatDistanceToNowStrict(new Date(value), { addSuffix: true }) : '—';

/** 1250000 -> "1 250 000 so‘m". Narx tiyin emas, so'mda deb olinadi (backend bilan solishtiring). */
export const formatPrice = (amount?: number | null) =>
  amount == null ? '—' : `${new Intl.NumberFormat('ru-RU').format(amount)} so‘m`;

/** 3725 -> "1:02:05", 125 -> "02:05" */
export const formatDuration = (totalSec: number) => {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};
/** +998901234567 -> "+998 90 123 45 67" */
export const formatPhone = (phone?: string | null) => {
  if (!phone) return '—';
  const d = phone.replace(/\D/g, '');
  if (d.length !== 12 || !d.startsWith('998')) return phone;
  return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
};

export const initials = (name?: string | null) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
/** 3900 -> "1 soat 5 daq", 720 -> "12 daq", 30 -> "1 daq" */
export const formatMinutes = (sec?: number | null) => {
  if (!sec || sec <= 0) return '';
  const min = Math.max(1, Math.round(sec / 60));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} daq`;
  return m ? `${h} soat ${m} daq` : `${h} soat`;
};
/** Muddatgacha qolgan vaqt: "2 kun 3 soat", "5 soat 10 daq". Muddat o'tgan bo'lsa null. */
export const timeLeft = (due?: string | Date | null) => {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  if (ms <= 0) return null;
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d} kun ${h} soat`;
  if (h > 0) return `${h} soat ${m} daq`;
  return `${Math.max(1, m)} daq`;
};
/** ISO sana -> <input type="datetime-local"> qiymati (mahalliy vaqt) */
export const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** datetime-local qiymati -> ISO (bo'sh bo'lsa undefined) */
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : undefined);
