export type HlColor = 'yellow' | 'green' | 'pink';
export const HL_COLORS: HlColor[] = ['yellow', 'green', 'pink'];

type Mark = { start: number; end: number; color: HlColor };

// Faqat xotirada: sahifa yopilsa yoki clearAllHighlights() chaqirilsa yo'qoladi
const store = new Map<string, Mark[]>();
const containers = new Map<string, HTMLElement>();

type HighlightLike = { add(r: Range): void };
type HighlightCtor = new () => HighlightLike;

const supported = () =>
  typeof CSS !== 'undefined' &&
  'highlights' in CSS &&
  typeof (window as unknown as { Highlight?: HighlightCtor }).Highlight === 'function';

function rangeFromOffsets(root: HTMLElement, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const r = document.createRange();
  let pos = 0;
  let started = false;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.nodeValue?.length ?? 0;
    if (!started && start < pos + len) {
      r.setStart(node, start - pos);
      started = true;
    }
    if (started && end <= pos + len) {
      r.setEnd(node, end - pos);
      return r;
    }
    pos += len;
  }
  return null;
}

export function paintHighlights() {
  if (!supported()) return;
  const registry = (CSS as unknown as { highlights: Map<string, unknown> }).highlights;
  const H = (window as unknown as { Highlight: HighlightCtor }).Highlight;

  for (const color of HL_COLORS) {
    const h = new H();
    for (const [id, el] of containers) {
      for (const m of store.get(id) ?? []) {
        if (m.color !== color) continue;
        const r = rangeFromOffsets(el, m.start, m.end);
        if (r) h.add(r);
      }
    }
    registry.set(`hl-${color}`, h);
  }
}

export function registerContainer(id: string, el: HTMLElement) {
  containers.set(id, el);
  paintHighlights();
}

export function unregisterContainer(id: string) {
  containers.delete(id);
  paintHighlights();
}

/** Tanlangan matn: [start, end) oralig'i va ekrandagi joyi */
export function getSelectionInfo(root: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;

  const offset = (node: Node, off: number) => {
    const r = document.createRange();
    r.selectNodeContents(root);
    r.setEnd(node, off);
    return r.toString().length;
  };
  const start = offset(range.startContainer, range.startOffset);
  const end = offset(range.endContainer, range.endOffset);
  if (end <= start) return null;

  return { start, end, rect: range.getBoundingClientRect() };
}

/** [s, e) oralig'idagi eski belgilarni olib tashlaydi (qirqadi) */
function subtract(marks: Mark[], s: number, e: number): Mark[] {
  const out: Mark[] = [];
  for (const m of marks) {
    if (m.end <= s || m.start >= e) {
      out.push(m);
      continue;
    }
    if (m.start < s) out.push({ ...m, end: s });
    if (m.end > e) out.push({ ...m, start: e });
  }
  return out;
}

export function applyHighlight(id: string, s: number, e: number, color: HlColor | null) {
  const next = subtract(store.get(id) ?? [], s, e);
  if (color) next.push({ start: s, end: e, color });
  store.set(id, next);
  paintHighlights();
}

/** Test tugaganda chaqiring */
export function clearAllHighlights() {
  store.clear();
  paintHighlights();
}
