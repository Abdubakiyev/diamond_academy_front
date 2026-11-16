import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Serverdan kelgan qolgan soniyadan teskari sanash. Mijoz soatiga ishonmaydi: qolgan vaqt
 * olingan paytdagi Date.now() ga nisbatan hisoblanadi, shuning uchun soat noto'g'ri bo'lsa ham xato bermaydi.
 * `sync()` har saqlashda serverdan kelgan yangi qiymat bilan to'g'rilaydi.
 */
export function useCountdown(initialSec: number | null | undefined, onExpire?: () => void) {
  const deadline = useRef<number | null>(initialSec == null ? null : Date.now() + initialSec * 1000);
  const [left, setLeft] = useState<number | null>(initialSec ?? null);
  const fired = useRef(false);
  const cb = useRef(onExpire);

  useEffect(() => {
    cb.current = onExpire;
  });

  const sync = useCallback((sec: number | null | undefined) => {
    if (sec == null) return;
    deadline.current = Date.now() + sec * 1000;
    if (sec > 0) fired.current = false;
    setLeft(sec);
  }, []);

  useEffect(() => {
    if (deadline.current == null) return;
    const tick = () => {
      if (deadline.current == null) return;
      const rem = Math.max(0, (deadline.current - Date.now()) / 1000);
      setLeft(rem);
      if (rem <= 0 && !fired.current) {
        fired.current = true;
        cb.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  return { left, sync };
}
