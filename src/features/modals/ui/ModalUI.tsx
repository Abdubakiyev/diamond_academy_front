'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  type ElementType,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { X, ChevronDown } from 'lucide-react';

type ThemeName = 'blue' | 'amber';

const themes = {
  blue: {
    bar: 'from-blue-500 via-indigo-500 to-blue-500',
    iconWrap: 'bg-gradient-to-br from-blue-50 to-indigo-100 ring-blue-200/70',
    icon: 'text-blue-600',
    field: 'focus:ring-blue-500',
    fieldIcon: 'group-focus-within:text-blue-500',
    primary:
      'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30 hover:shadow-blue-500/40 focus-visible:ring-blue-400',
  },
  amber: {
    bar: 'from-amber-400 via-orange-500 to-amber-400',
    iconWrap: 'bg-gradient-to-br from-amber-50 to-orange-100 ring-amber-200/70',
    icon: 'text-amber-600',
    field: 'focus:ring-amber-500',
    fieldIcon: 'group-focus-within:text-amber-500',
    primary:
      'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30 hover:shadow-amber-500/40 focus-visible:ring-amber-400',
  },
} as const;

const ThemeContext = createContext<(typeof themes)[ThemeName]>(themes.blue);

/* ───────────────────────── ModalShell ───────────────────────── */

interface ModalShellProps {
  theme?: ThemeName;
  icon: ElementType;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitIcon: ElementType;
  submitDisabled?: boolean;
  isPending?: boolean;
  errorMessage?: string | null;
  children: ReactNode;
}

export function ModalShell({
  theme = 'blue',
  icon: Icon,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel,
  submitIcon: SubmitIcon,
  submitDisabled = false,
  isPending = false,
  errorMessage,
  children,
}: ModalShellProps) {
  const t = themes[theme];
  const titleId = useId();

  // Escape bilan yopish va modal ochiqligida sahifa skrollini bloklash
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <ThemeContext.Provider value={t}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <div
          aria-hidden="true"
          className="modal-backdrop-in absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <form
          onSubmit={handleSubmit}
          className="modal-panel-in relative flex max-h-[calc(100vh-2rem)] flex-col bg-white rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-black/5 w-full max-w-md mx-4 overflow-hidden"
        >
          {/* Yuqori rangli chiziq */}
          <div className={`h-1 shrink-0 bg-gradient-to-r ${t.bar}`} />

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-xl ring-1 shadow-sm ${t.iconWrap}`}
              >
                <Icon className={`w-5 h-5 ${t.icon}`} />
              </div>
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-gray-900">
                  {title}
                </h2>
                {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Yopish"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            {children}
            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 ring-1 ring-red-100 px-3 py-2 text-sm text-red-600"
              >
                {errorMessage}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitDisabled || isPending}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-r shadow-md
                active:scale-95 transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100
                ${t.primary}`}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <SubmitIcon className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ThemeContext.Provider>
  );
}

/* ───────────────────────── Field / inputs ───────────────────────── */

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const baseField =
  'w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white shadow-sm ' +
  'hover:border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400';

const iconClass =
  'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors';

export function TextInput({
  icon: Icon,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ElementType }) {
  const t = useContext(ThemeContext);
  return (
    <div className="group relative">
      <Icon className={`${iconClass} ${t.fieldIcon}`} />
      <input {...props} className={`${baseField} ${t.field} ${className}`} />
    </div>
  );
}

export function SelectInput({
  icon: Icon,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { icon: ElementType }) {
  const t = useContext(ThemeContext);
  return (
    <div className="group relative">
      <Icon className={`${iconClass} ${t.fieldIcon}`} />
      <select
        {...props}
        className={`${baseField} ${t.field} appearance-none pr-10 cursor-pointer ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}

/* ───────────────────────── Status switch ───────────────────────── */

export function StatusSwitch({
  checked,
  onChange,
  activeText,
  inactiveText,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  activeText: string;
  inactiveText: string;
}) {
  const labelId = useId();
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 ring-1 ring-gray-100 rounded-xl">
      <div>
        <p id={labelId} className="text-sm font-medium text-gray-700">
          Status
        </p>
        <p
          className={`text-xs transition-colors duration-300 ${
            checked ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          {checked ? activeText : inactiveText}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-300 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-400
          ${
            checked
              ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-inner shadow-green-900/20'
              : 'bg-gray-300 shadow-inner shadow-gray-500/20'
          }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transform
            transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}