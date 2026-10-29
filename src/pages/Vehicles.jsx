import { useEffect, useState } from 'react';
import { api } from '../api';
import { money, num, fuelLabel } from '../utils';

const FUELS = ['essence', 'diesel', 'gpl', 'electrique'];
const EMPTY = { name: '', plate: '', fuel_type: 'diesel', tank_capacity: '' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/vehicles').then(setVehicles).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reset = () => { setForm(EMPTY); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/vehicles/${editingId}`, form);
      else await api.post('/vehicles', form);
      reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (v) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      plate: v.plate,
      fuel_type: v.fuel_type,
      tank_capacity: v.tank_capacity ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (v) => {
    if (!window.confirm(`Supprimer « ${v.name} » et toutes ses saisies de carburant ?`)) return;
    try {
      await api.del(`/vehicles/${v.id}`);
      if (editingId === v.id) reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Véhicules</h2>
      {error && <div className="error">{error}</div>}

      <form className="card form" onSubmit={submit}>
        <h3>{editingId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>
        <div className="grid">
          <label>Nom
            <input name="name" value={form.name} onChange={onChange} placeholder="Renault Clio" required />
          </label>
          <label>Immatriculation
            <input name="plate" value={form.plate} onChange={onChange} placeholder="123 TUN 4567" required />
          </label>
          <label>Type de carburant
            <select name="fuel_type" value={form.fuel_type} onChange={onChange}>
              {FUELS.map((f) => <option key={f} value={f}>{fuelLabel(f)}</option>)}
            </select>
          </label>
          <label>Capacité du réservoir (L)
            <input name="tank_capacity" type="number" step="0.01" min="0"
                   value={form.tank_capacity} onChange={onChange} />
          </label>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
          {editingId && <button className="btn" type="button" onClick={reset}>Annuler</button>}
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th><th>Immatriculation</th><th>Carburant</th><th>Réservoir (L)</th>
              <th>Pleins</th><th>Total litres</th><th>Coût total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 && (
              <tr><td colSpan="8" className="empty">Aucun véhicule pour le moment</td></tr>
            )}
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.plate}</td>
                <td>{fuelLabel(v.fuel_type)}</td>
                <td>{num(v.tank_capacity)}</td>
                <td>{v.entries_count}</td>
                <td>{num(v.total_liters)}</td>
                <td>{money(v.total_cost)}</td>
                <td className="row-actions">
                  <button className="btn small" onClick={() => edit(v)}>Modifier</button>
                  <button className="btn small danger" onClick={() => remove(v)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}