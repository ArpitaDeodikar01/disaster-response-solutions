import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { registerVolunteer, registerCoordinator } from '../../services/auth';
import { getAuth, signOut } from 'firebase/auth';
import { SKILLS, DAYS } from '../../utils/constants';
import toast from 'react-hot-toast';

type Role = 'volunteer' | 'coordinator';

export default function Register() {
  const [role, setRole] = useState<Role>('volunteer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (role === 'volunteer' && selectedSkills.length === 0) {
      toast.error('Select at least one skill');
      return;
    }
    setLoading(true);
    try {
      if (role === 'volunteer') {
        await registerVolunteer({ email, password, name, phone, skills: selectedSkills, availability: selectedDays, address });
      } else {
        await registerCoordinator({ email, password, name });
      }
      await signOut(getAuth());
      setRegistered(true);
      toast.success('Account created! Please sign in.');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
    setLoading(false);
  }

  const inputCls = "w-full bg-gray-800 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Account Created</h2>
          <p className="text-gray-400 mb-6 text-sm">Your account is ready. Sign in to get started.</p>
          <Link to="/login" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-8 rounded-lg transition shadow-lg shadow-brand-600/30">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-xl shadow-brand-600/40 mb-3 text-2xl">🚨</div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the disaster response network</p>
        </div>
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex rounded-xl bg-gray-800 p-1 mb-6">
            {(['volunteer', 'coordinator'] as Role[]).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  role === r ? 'bg-brand-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
                }`}>
                {r === 'volunteer' ? '🙋 Volunteer' : '🎯 Coordinator'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            <input required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            <input required type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            {role === 'volunteer' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                  <input placeholder="Area / Address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <button key={skill} type="button" onClick={() => toggle(selectedSkills, skill, setSelectedSkills)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          selectedSkills.includes(skill) ? 'bg-blue-600 text-white border-blue-600' : 'border-white/10 text-gray-400 hover:border-blue-500 hover:text-blue-300'
                        }`}>{skill}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button key={day} type="button" onClick={() => toggle(selectedDays, day, setSelectedDays)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                          selectedDays.includes(day) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-white/10 text-gray-400 hover:border-emerald-500 hover:text-emerald-300'
                        }`}>{day.slice(0, 3)}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-brand-600/30 disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
