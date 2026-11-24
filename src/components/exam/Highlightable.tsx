'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Eraser } from 'lucide-react';
import {
  HL_COLORS,
  applyHighlight,
  getSelectionInfo,
  paintHighlights,
  registerContainer,
  unregisterContainer,
  type HlColor,
} from '../../lib/highlight';

const SWATCH: Record<HlColor, string> = {
  yellow: 'bg-yellow-300',
  green: 'bg-green-300',
  blue: 'bg-blue-300',
};

type Sel = { start: number; end: number; x: number; y: number };

/** Ichidagi matnni 3 rangda belgilash mumkin. `id` har bir joy uchun noyob bo'lsin (masalan part.id, question.id) */
export default function Highlightable({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Sel | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    registerContainer(id, ref.current);
    return () => unregisterContainer(id);
  }, [id]);

  // Kontent o'zgarsa (masalan javob tanlanganda) belgilar qayta chiziladi
  useEffect(() => {
    paintHighlights();
  });

  // Boshqa joyga bosilsa yoki tanlov bekor bo'lsa, panel yopiladi
  useEffect(() => {
    if (!sel) return;
    const onChange = () => {
      const s = window.getSelection();
      if (!s || s.isCollapsed) setSel(null);
    };
    document.addEventListener('selectionchange', onChange);
    return () => document.removeEventListener('selectionchange', onChange);
  }, [sel]);

  const check = () =>
    setTimeout(() => {
      if (!ref.current) return;
      const info = getSelectionInfo(ref.current);
      if (!info) return setSel(null);
      setSel({ start: info.start, end: info.end, x: info.rect.left + info.rect.width / 2, y: info.rect.top });
    }, 10);

  const pick = (color: HlColor | null) => {
    if (!sel) return;
    applyHighlight(id, sel.start, sel.end, color);
    window.getSelection()?.removeAllRanges();
    setSel(null);
  };

  return (
    <>
      <div ref={ref} className={className} onMouseUp={check} onTouchEnd={check} onKeyUp={check}>
        {children}
      </div>

      {sel && (
        <div
          // mousedown'ni to'xtatamiz, aks holda tanlov yo'qoladi
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ position: 'fixed', left: sel.x, top: Math.max(8, sel.y - 48), transform: 'translateX(-50%)' }}
          className="z-[200] flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
        >
          {HL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`${c} rang`}
              onClick={() => pick(c)}
              className={`h-7 w-7 rounded-full ring-1 ring-black/10 transition hover:scale-110 ${SWATCH[c]}`}
            />
          ))}
          <span className="mx-0.5 h-5 w-px bg-gray-200" />
          <button type="button" aria-label="Belgini o'chirish" title="Belgini o'chirish" onClick={() => pick(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <Eraser className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
