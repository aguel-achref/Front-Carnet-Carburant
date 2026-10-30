// Local: empty, the Vite proxy forwards /api to localhost:5000
// Production (Vercel): VITE_API_URL=https://your-api.onrender.com
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_URL}/api`;

// French translation of the messages returned by the backend
const MESSAGES = {
  'Name is required': 'Le nom est obligatoire',
  'Plate number is required': "L'immatriculation est obligatoire",
  'Invalid fuel type': 'Type de carburant invalide',
  'Tank capacity must be a positive number': 'La capacité du réservoir doit être un nombre positif',
  'Vehicle not found': 'Véhicule introuvable',
  'Vehicle is required': 'Le véhicule est obligatoire',
  'Valid date is required': 'Une date valide est obligatoire',
  'Liters must be greater than 0': 'Les litres doivent être supérieurs à 0',
  'Price per liter must be greater than 0': 'Le prix par litre doit être supérieur à 0',
  'Odometer must be a positive whole number': 'Le kilométrage doit être un nombre entier positif',
  'Entry not found': 'Saisie introuvable',
  'This plate number already exists': 'Cette immatriculation existe déjà',
  'Route not found': 'Route introuvable',
  'Server error': 'Erreur du serveur',
};

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error(
      'Impossible de joindre le serveur. Il est peut-être en cours de démarrage, réessayez dans une minute.'
    );
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message;
    throw new Error((msg && MESSAGES[msg]) || msg || 'La requête a échoué');
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};