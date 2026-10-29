export const CURRENCY = 'TND';

const fmt = (n, digits) =>
  Number(n).toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const money = (n) =>
  n === null || n === undefined ? '—' : `${fmt(n, 3)} ${CURRENCY}`;

export const num = (n, digits = 2) =>
  n === null || n === undefined ? '—' : fmt(n, digits);

// Stored values stay the same in the database, only the display is French
export const FUEL_LABELS = {
  essence: 'Essence',
  diesel: 'Diesel',
  gpl: 'GPL',
  electrique: 'Électrique',
};

export const fuelLabel = (value) => FUEL_LABELS[value] || value;

// 'YYYY-MM-DD' -> 'JJ/MM/AAAA'
export const formatDate = (s) => {
  if (!s) return '—';
  const [y, m, d] = String(s).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

// 'YYYY-MM-DD' -> 'JJ/MM' (chart axes)
export const formatShort = (s) => {
  if (!s) return '';
  const [, m, d] = String(s).slice(0, 10).split('-');
  return `${d}/${m}`;
};

export const todayLocal = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD