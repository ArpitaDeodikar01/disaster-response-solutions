import { useState, useRef, useCallback } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAllVolunteers } from '../../services/firestore';
import { parseCsv, computeUrgencyScore, ParsedNeedRow } from '../../utils/csvParser';
import { matchVolunteers } from '../../utils/autoAssign';
import { Volunteer } from '../../types/volunteer.types';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface ProcessedNeed extends ParsedNeedRow {
  urgencyScore: number;
  breakdown: Record<string, number>;
  matchedVolunteers: ReturnType<typeof matchVolunteers>;
}

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'done';

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export default function CsvImport() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [needs, setNeeds] = useState<ProcessedNeed[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    setStatus('parsing');
    setParseErrors([]);

    const text = await file.text();
    const { rows, errors } = parseCsv(text);

    if (errors.length) {
      setParseErrors(errors);
      setStatus('idle');
      return;
    }

    // Fetch volunteers once for matching
    const vols = await getAllVolunteers();
    setVolunteers(vols);

    // Score and match each need
    const processed: ProcessedNeed[] = rows.map((row) => {
      const { total, breakdown } = computeUrgencyScore(row);
      const matched = matchVolunteers(row, vols, 3);
      return { ...row, urgencyScore: total, breakdown, matchedVolunteers: matched };
    });

    // Sort by urgency score descending
    processed.sort((a, b) => b.urgencyScore - a.urgencyScore);

    setNeeds(processed);
    setStatus('preview');
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    if (!user) return;
    setStatus('importing');
    setProgress(0);
    let count = 0;

    for (let i = 0; i < needs.length; i++) {
      const need = needs[i];

      // 1. Create need
      const needRef = await addDoc(collection(db, 'needs'), {
        area: need.area,
        lat: need.lat,
        lng: need.lng,
        category: need.category,
        severity: need.severity,
        description: need.description,
        reportedCount: need.reportedCount,
        urgencyScore: need.urgencyScore,
        scoreBreakdown: need.breakdown,
        status: 'task_created',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });

      // 2. Auto-create task linked to this need
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      const scheduledDay = scheduledDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      const assignedUids = need.matchedVolunteers.map((v) => v.uid);

      const taskRef = await addDoc(collection(db, 'tasks'), {
        linkedNeedId: needRef.id,
        title: `${need.category.replace('_', ' ')} response — ${need.area}`,
        description: need.description,
        area: need.area,
        lat: need.lat,
        lng: need.lng,
        requiredSkills: need.matchedVolunteers[0]?.breakdown ? [] : [],
        volunteersNeeded: Math.min(need.matchedVolunteers.length, 3),
        suggestedVolunteers: need.matchedVolunteers.map((v) => ({
          uid: v.uid,
          name: v.name,
          matchScore: v.matchScore,
          breakdown: v.breakdown,
          distanceKm: v.distanceKm,
        })),
        assignedVolunteers: assignedUids,
        confirmedVolunteers: [],
        status: 'assigned',
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        scheduledDay,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // 3. Update need status
      await updateDoc(doc(db, 'needs', needRef.id), { status: 'task_created' });

      count++;
      setProgress(Math.round(((i + 1) / needs.length) * 100));
    }

    setImportedCount(count);
    setStatus('done');
    toast.success(`${count} needs imported and tasks assigned`);
  }

  function reset() {
    setStatus('idle');
    setNeeds([]);
    setParseErrors([]);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── DONE STATE ──────────────────────────────────────────────────────────────
  if (status === 'done') {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{importedCount} Needs Imported</h2>
        <p className="text-gray-500 mb-6">Tasks created and volunteers assigned automatically. Check the Needs Dashboard.</p>
        <button onClick={reset} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-8 rounded-lg transition">
          Import Another CSV
        </button>
      </div>
    );
  }

  // ── IMPORTING STATE ─────────────────────────────────────────────────────────
  if (status === 'importing') {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">⚙️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Creating needs & assigning volunteers...</h2>
        <div className="w-full max-w-sm mx-auto bg-gray-200 rounded-full h-3">
          <div className="bg-red-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-2">{progress}%</p>
      </div>
    );
  }

  // ── PREVIEW STATE ───────────────────────────────────────────────────────────
  if (status === 'preview') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Preview — {needs.length} needs detected</h2>
            <p className="text-sm text-gray-500">Sorted by urgency score · {volunteers.length} volunteers available for matching</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleImport} className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
              Import All & Assign →
            </button>
          </div>
        </div>

        {needs.map((need, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                  <h3 className="font-semibold text-gray-900">{need.area}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${SEVERITY_COLOR[need.severity]}`}>
                    {need.severity}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                    {need.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{need.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>📊 {need.reportedCount} reports</span>
                  <span>📍 {need.lat.toFixed(4)}, {need.lng.toFixed(4)}</span>
                </div>
              </div>

              {/* Urgency score */}
              <div className="text-center min-w-[64px]">
                <div className={`text-2xl font-bold ${need.urgencyScore >= 70 ? 'text-red-600' : need.urgencyScore >= 45 ? 'text-orange-500' : 'text-green-600'}`}>
                  {need.urgencyScore}
                </div>
                <div className="text-xs text-gray-400">urgency</div>
              </div>
            </div>

            {/* Matched volunteers */}
            {need.matchedVolunteers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Auto-assigned volunteers</p>
                <div className="flex flex-wrap gap-2">
                  {need.matchedVolunteers.map((v) => (
                    <div key={v.uid} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1 text-xs">
                      <span className="font-medium text-blue-800">{v.name}</span>
                      <span className="text-blue-500">{v.matchScore.toFixed(0)}pts</span>
                      <span className="text-gray-400">{v.distanceKm}km</span>
                    </div>
                  ))}
                  {need.matchedVolunteers.length === 0 && (
                    <span className="text-xs text-gray-400">No available volunteers matched</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="sticky bottom-4 flex justify-end pt-2">
          <button onClick={handleImport} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition">
            Import All {needs.length} Needs & Assign Volunteers →
          </button>
        </div>
      </div>
    );
  }

  // ── IDLE / PARSING STATE ────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Import Needs from CSV</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CSV exported from your response form. Needs will be scored, sorted by urgency, and volunteers auto-assigned.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
          dragOver ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
        }`}
      >
        <div className="text-5xl mb-3">{status === 'parsing' ? '⏳' : '📂'}</div>
        <p className="font-medium text-gray-700">
          {status === 'parsing' ? 'Parsing...' : 'Drop CSV here or click to browse'}
        </p>
        <p className="text-sm text-gray-400 mt-1">Only .csv files accepted</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 space-y-1">
          <p className="font-semibold">Could not parse CSV:</p>
          {parseErrors.map((e, i) => <p key={i}>• {e}</p>)}
        </div>
      )}

      {/* Expected format */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-gray-700">Expected CSV columns</p>
        <p>
          <span className="font-mono bg-white border border-gray-200 rounded px-1">area</span>{' '}
          <span className="font-mono bg-white border border-gray-200 rounded px-1">lat</span>{' '}
          <span className="font-mono bg-white border border-gray-200 rounded px-1">lng</span>{' '}
          <span className="font-mono bg-white border border-gray-200 rounded px-1">category</span>{' '}
          <span className="font-mono bg-white border border-gray-200 rounded px-1">severity</span>{' '}
          <span className="font-mono bg-white border border-gray-200 rounded px-1">description</span>{' '}
          <span className="font-mono bg-white border border-gray-200 rounded px-1">reported_count</span>
        </p>
        <p>Category values: <code>medical, shelter, food, water_sanitation, education, general</code></p>
        <p>Severity values: <code>low, medium, high, critical</code></p>
        <p className="text-gray-400">lat/lng are optional — defaults to Pune if missing</p>
      </div>
    </div>
  );
}
