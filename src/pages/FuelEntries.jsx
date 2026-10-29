import { useEffect, useState } from 'react';
import { api } from '../api';
import { money, num, todayLocal, formatDate } from '../utils';

const emptyForm = () => ({
  vehicle_id: '',
  entry_date: todayLocal(),
  liters: '',
  price_per_liter: '',
  odometer: '',
  notes: '',
});

export default function FuelEntries() {
  const [vehicles, setVehicles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/vehicles').then(setVehicles).catch((e) => setError(e.message));
  }, []);

  const loadEntries = () => {
    const q = filter ? `?vehicle_id=${filter}` : '';
    api.get(`/fuel${q}`).then(setEntries).catch((e) => setError(e.message));
  };

  useEffect(() => { loadEntries(); }, [filter]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reset = () => { setForm(emptyForm()); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/fuel/${editingId}`, form);
      else await api.post('/fuel', form);
      reset();
      loadEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (en) => {
    setEditingId(en.id);
    setForm({
      vehicle_id: String(en.vehicle_id),
      entry_date: en.entry_date,
      liters: en.liters,
      price_per_liter: en.price_per_liter,
      odometer: en.odometer ?? '',
      notes: en.notes ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (en) => {
    if (!window.confirm('Supprimer cette saisie de carburant ?')) return;
    try {
      await api.del(`/fuel/${en.id}`);
      if (editingId === en.id) reset();
      loadEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const preview = Number(form.liters) * Number(form.price_per_liter);
  const totalCost = entries.reduce((s, e) => s + e.total_cost, 0);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);

  return (
    <div>
      <h2>Saisies de carburant</h2>
      {error && <div className="error">{error}</div>}

      <form className="card form" onSubmit={submit}>
        <h3>{editingId ? 'Modifier la saisie' : 'Ajouter une saisie de carburant'}</h3>
        <div className="grid">
          <label>Véhicule
            <select name="vehicle_id" value={form.vehicle_id} onChange={onChange} required>
              <option value="">— choisir —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
              ))}
            </select>
          </label>
          <label>Date
            <input name="entry_date" type="date" value={form.entry_date} onChange={onChange} required />
          </label>
          <label>Litres
            <input name="liters" type="number" step="0.01" min="0" value={form.liters} onChange={onChange} required />
          </label>
          <label>Prix par litre
            <input name="price_per_liter" type="number" step="0.001" min="0"
                   value={form.price_per_liter} onChange={onChange} required />
          </label>
          <label>Kilométrage (km, facultatif)
            <input name="odometer" type="number" step="1" min="0" value={form.odometer} onChange={onChange} />
          </label>
          <label>Notes
            <input name="notes" value={form.notes} onChange={onChange} maxLength="255" />
          </label>
        </div>
        <div className="actions">
          <span className="preview">
            Total : <strong>{preview > 0 ? money(preview) : '—'}</strong>
          </span>
          <button className="btn primary" type="submit">{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
          {editingId && <button className="btn" type="button" onClick={reset}>Annuler</button>}
        </div>
      </form>

      <div className="toolbar">
        <label>Filtrer par véhicule
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous les véhicules</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
          </select>
        </label>
        <div className="totals">
          {num(totalLiters)} L · <strong>{money(totalCost)}</strong>
        </div>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Véhicule</th><th>Litres</th><th>Prix/L</th>
              <th>Total</th><th>Kilométrage</th><th>Notes</th><th></th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan="8" className="empty">Aucune saisie pour le moment</td></tr>
            )}
            {entries.map((en) => (
              <tr key={en.id}>
                <td>{formatDate(en.entry_date)}</td>
                <td>{en.vehicle_name} <small>({en.plate})</small></td>
                <td>{num(en.liters)}</td>
                <td>{num(en.price_per_liter, 3)}</td>
                <td>{money(en.total_cost)}</td>
                <td>{en.odometer ?? '—'}</td>
                <td>{en.notes ?? ''}</td>
                <td className="row-actions">
                  <button className="btn small" onClick={() => edit(en)}>Modifier</button>
                  <button className="btn small danger" onClick={() => remove(en)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}