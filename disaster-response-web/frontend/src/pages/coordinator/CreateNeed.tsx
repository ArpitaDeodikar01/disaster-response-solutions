import { useState, FormEvent } from 'react';
import { createNeed } from '../../services/firestore';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, SEVERITIES, MAHARASHTRA_LOCATIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

interface Props { onCreated?: () => void }

export default function CreateNeed({ onCreated }: Props) {
  const { user } = useAuth();
  const [area, setArea] = useState('');
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [reportedCount, setReportedCount] = useState(1);
  const [loading, setLoading] = useState(false);

  function pickLocation(e: React.ChangeEvent<HTMLSelectElement>) {
    const loc = MAHARASHTRA_LOCATIONS.find((l) => l.name === e.target.value);
    if (loc) { setArea(loc.name); setLat(loc.lat); setLng(loc.lng); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await createNeed({
        area, lat, lng,
        category: category as Need['category'],
        description, severity: severity as Need['severity'],
        reportedCount, status: 'open', createdBy: user.uid,
      });
      toast.success('Need reported! Urgency score computing...');
      onCreated?.();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Report a Disaster Need</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quick Location</label>
          <select onChange={pickLocation} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a location...</option>
            {MAHARASHTRA_LOCATIONS.map((l) => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area / Address</label>
          <input required value={area} onChange={(e) => setArea(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Hadapsar, Pune" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the situation..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Reports</label>
          <input type="number" min={1} value={reportedCount} onChange={(e) => setReportedCount(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Need'}
        </button>
      </form>
    </div>
  );
}

// Fix missing import
import { Need } from '../../types/need.types';
