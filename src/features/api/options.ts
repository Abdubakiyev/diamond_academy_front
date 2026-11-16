import apiClient from './client';
import type { GroupOption, LevelOption } from '../types/course';

type Raw = Record<string, unknown>;

const toList = (data: unknown): Raw[] => {
  if (Array.isArray(data)) return data as Raw[];
  if (data && typeof data === 'object') {
    const o = data as Raw;
    for (const k of ['items', 'data', 'groups', 'levels']) if (Array.isArray(o[k])) return o[k] as Raw[];
  }
  return [];
};

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Eski backend: GET /level  (javob massiv yoki {items}) */
export const getLevels = async (): Promise<LevelOption[]> => {
  const { data } = await apiClient.get('/level');
  return toList(data).map((l) => ({ id: str(l.id), type: str(l.type) || str(l.name) || str(l.title) }));
};

/** Eski backend: GET /group */
export const getGroups = async (): Promise<GroupOption[]> => {
  const { data } = await apiClient.get('/group');
  return toList(data).map((g) => ({ id: str(g.id), name: str(g.name) || str(g.title) }));
};
