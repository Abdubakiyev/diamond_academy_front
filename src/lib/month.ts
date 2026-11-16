export const MONTH_NAMES = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const WEEKDAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

/** Brauzerdagi (mahalliy) joriy oy: "2026-11" */
export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const todayStr = () => {
  const d = new Date();
  return `${currentMonth()}-${String(d.getDate()).padStart(2, '0')}`;
};

export const shiftMonth = (m: string, delta: number) => {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const monthLabel = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return `${MONTH_NAMES[mo - 1]} ${y}`;
};

export const daysInMonth = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
};

/** "2026-11-05" -> { day: "05", weekday: "Ju" } */
export const dayParts = (date: string) => {
  const [y, mo, d] = date.split('-').map(Number);
  return { day: String(d).padStart(2, '0'), weekday: WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()] };
};
