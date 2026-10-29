import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { api } from '../api';
import { money, num, formatDate, formatShort } from '../utils';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byVehicle, setByVehicle] = useState([]);
  const [estimation, setEstimation] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/stats/summary'),
      api.get('/stats/by-vehicle'),
      api.get('/stats/estimation'),
    ])
      .then(([s, v, e]) => { setSummary(s); setByVehicle(v); setEstimation(e); })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const q = vehicleId ? `&vehicle_id=${vehicleId}` : '';
    Promise.all([
      api.get(`/stats/weekly?weeks=12${q}`),
      api.get(`/stats/daily?days=30${q}`),
    ])
      .then(([w, d]) => { setWeekly(w); setDaily(d); })
      .catch((e) => setError(e.message));
  }, [vehicleId]);

  if (error) return <div className="error">{error}</div>;
  if (!summary) return <p>Chargement…</p>;

  const ranking = [...byVehicle].sort((a, b) => b.total_cost - a.total_cost);

  return (
    <div>
      <h2>Tableau de bord</h2>

      <div className="cards">
        <div className="card stat"><span>Coût total</span><strong>{money(summary.total_cost)}</strong></div>
        <div className="card stat"><span>Cette semaine</span><strong>{money(summary.week_cost)}</strong></div>
        <div className="card stat"><span>Ce mois-ci</span><strong>{money(summary.month_cost)}</strong></div>
        <div className="card stat"><span>Total litres</span><strong>{num(summary.total_liters)} L</strong></div>
        <div className="card stat"><span>Véhicules</span><strong>{summary.vehicles_count}</strong></div>
        <div className="card stat"><span>Pleins</span><strong>{summary.entries_count}</strong></div>
      </div>

      <div className="toolbar">
        <label>Graphiques pour
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Tous les véhicules</option>
            {byVehicle.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>{v.name} ({v.plate})</option>
            ))}
          </select>
        </label>
      </div>

      <div className="charts">
        <div className="card">
          <h3>Coût par semaine (12 dernières semaines)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week_start" tickFormatter={formatShort} />
              <YAxis />
              <Tooltip
                formatter={(v) => money(v)}
                labelFormatter={(l) => `Semaine du ${formatDate(l)}`}
              />
              <Bar dataKey="cost" name="Coût" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Litres par jour (30 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatShort} />
              <YAxis />
              <Tooltip
                formatter={(v) => `${num(v)} L`}
                labelFormatter={(l) => formatDate(l)}
              />
              <Line type="monotone" dataKey="liters" name="Litres" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card table-wrap">
        <h3>Consommation par véhicule</h3>
        <table>
          <thead>
            <tr>
              <th>Véhicule</th><th>Pleins</th><th>Total litres</th><th>Coût total</th>
              <th>Moy. L / jour</th><th>Moy. L / semaine</th><th>Moy. coût / semaine</th><th>L / 100 km</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 && <tr><td colSpan="8" className="empty">Aucune donnée pour le moment</td></tr>}
            {ranking.map((v) => (
              <tr key={v.vehicle_id}>
                <td>{v.name} <small>({v.plate})</small></td>
                <td>{v.entries_count}</td>
                <td>{num(v.total_liters)}</td>
                <td>{money(v.total_cost)}</td>
                <td>{num(v.avg_daily_liters)}</td>
                <td>{num(v.avg_weekly_liters)}</td>
                <td>{money(v.avg_weekly_cost)}</td>
                <td>{num(v.l_per_100km)}</td>
              </tr>
            ))}
            {ranking.length > 0 && (
              <tr className="total-row">
                <td>Tous les véhicules</td>
                <td>{summary.entries_count}</td>
                <td>{num(summary.total_liters)}</td>
                <td>{money(summary.total_cost)}</td>
                <td colSpan="4"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card table-wrap">
        <h3>Estimation</h3>
        {estimation && estimation.vehicles.length > 0 ? (
          <>
            <p className="note">
              Basée sur la consommation moyenne de chaque véhicule entre son premier et son dernier plein.
              Prévision de la flotte : <strong>{money(estimation.fleet.next_7_days_cost)}</strong> pour les 7 prochains jours,{' '}
              <strong>{money(estimation.fleet.next_30_days_cost)}</strong> pour les 30 prochains jours.
              {estimation.fleet.vehicles_without_estimate > 0 &&
                ` (${estimation.fleet.vehicles_without_estimate} véhicule(s) exclu(s) : pas assez de données, il faut au moins 2 pleins à des jours différents.)`}
            </p>
            <table>
              <thead>
                <tr>
                  <th>Véhicule</th><th>7 prochains jours (L)</th><th>7 prochains jours (coût)</th>
                  <th>30 prochains jours (L)</th><th>30 prochains jours (coût)</th>
                </tr>
              </thead>
              <tbody>
                {estimation.vehicles.map((v) => (
                  <tr key={v.vehicle_id}>
                    <td>{v.name} <small>({v.plate})</small></td>
                    <td>{num(v.next_7_days_liters)}</td>
                    <td>{money(v.next_7_days_cost)}</td>
                    <td>{num(v.next_30_days_liters)}</td>
                    <td>{money(v.next_30_days_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="empty">Ajoutez au moins 2 pleins (à des jours différents) pour un véhicule afin d'obtenir une estimation.</p>
        )}
      </div>
    </div>
  );
}