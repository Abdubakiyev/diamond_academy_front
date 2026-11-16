'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { cn } from '../../lib/format';

interface Props<T extends { id: string }> {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderRow: (item: T, index: number) => ReactNode;
  disabled?: boolean;
}

export default function SortableList<T extends { id: string }>({ items, onReorder, renderRow, disabled }: Props<T>) {
  const [list, setList] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => setList(items), [items]);

  const move = (from: number, to: number) => {
    if (from < 0 || to < 0 || to >= list.length || from === to) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setList(next);
    onReorder(next.map((i) => i.id));
  };

  return (
    <ol className="space-y-2.5">
      {list.map((item, index) => (
        <li
          key={item.id}
          draggable={!disabled}
          onDragStart={(e) => {
            setDragId(item.id);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragId && dragId !== item.id) setOverId(item.id);
          }}
          onDragEnd={() => {
            setDragId(null);
            setOverId(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId) move(list.findIndex((i) => i.id === dragId), index);
            setDragId(null);
            setOverId(null);
          }}
          className={cn(
            'flex items-center gap-2 rounded-2xl border bg-white p-3 shadow-sm transition',
            dragId === item.id ? 'opacity-40' : '',
            overId === item.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-100',
          )}
        >
          <span
            className={cn('hidden cursor-grab text-gray-300 active:cursor-grabbing sm:block', disabled && 'opacity-30')}
            aria-hidden="true"
          >
            <GripVertical className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">{renderRow(item, index)}</div>

          <div className="flex shrink-0 flex-col">
            <button
              type="button"
              disabled={disabled || index === 0}
              onClick={() => move(index, index - 1)}
              aria-label="Yuqoriga"
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={disabled || index === list.length - 1}
              onClick={() => move(index, index + 1)}
              aria-label="Pastga"
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
