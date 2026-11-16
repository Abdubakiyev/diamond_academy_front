import { format } from 'date-fns';
import { Ban, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react';
import type { ElementType } from 'react';
import type { PaymentProvider, PaymentStatus } from '../features/types/exam-payment';

export const STATUS_META: Record<PaymentStatus, { label: string; cls: string; icon: ElementType }> = {
  PENDING: { label: 'Kutilmoqda', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock },
  PAID: { label: 'To‘langan', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  FAILED: { label: 'Muvaffaqiyatsiz', cls: 'bg-red-50 text-red-700 ring-red-200', icon: XCircle },
  CANCELLED: { label: 'Bekor qilingan', cls: 'bg-gray-100 text-gray-600 ring-gray-200', icon: Ban },
  REFUNDED: { label: 'Qaytarilgan', cls: 'bg-violet-50 text-violet-700 ring-violet-200', icon: RotateCcw },
};

export const PROVIDER_META: Record<PaymentProvider, { label: string; hint: string; dot: string }> = {
  CLICK: { label: 'Click', hint: 'Click ilovasi yoki karta', dot: 'bg-sky-500' },
  PAYME: { label: 'Payme', hint: 'Payme ilovasi yoki karta', dot: 'bg-cyan-500' },
  UZUM: { label: 'Uzum', hint: 'Uzum Bank', dot: 'bg-violet-500' },
  MANUAL: { label: 'Naqd / o‘tkazma', hint: 'Admin tasdiqlagan', dot: 'bg-gray-400' },
};

export const fmtDateTime = (iso?: string | null) => (iso ? format(new Date(iso), 'dd.MM.yyyy HH:mm') : '—');
