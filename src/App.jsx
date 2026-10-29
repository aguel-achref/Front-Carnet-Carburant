import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import FuelEntries from './pages/FuelEntries.jsx';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'vehicles', label: 'Véhicules' },
  { id: 'fuel', label: 'Saisies de carburant' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="app">
      <header className="header">
        <h1>⛽ Carnet Carburant</h1>
        <nav>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'tab active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {/* key forces a fresh load when switching tabs */}
        {tab === 'dashboard' && <Dashboard key="d" />}
        {tab === 'vehicles' && <Vehicles key="v" />}
        {tab === 'fuel' && <FuelEntries key="f" />}
      </main>
    </div>
  );
}