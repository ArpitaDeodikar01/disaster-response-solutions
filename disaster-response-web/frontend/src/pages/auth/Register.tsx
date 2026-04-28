import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { registerVolunteer, registerCoordinator } from '../../services/auth';
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

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

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
      toast.success('Account created!');
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>

        {/* Role toggle */}
        <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
          {(['volunteer', 'coordinator'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium transition ${
                role === r ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input required type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          {role === 'volunteer' && (
            <>
              <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Address / Area" value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-sm border transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full text-sm border transition capitalize ${
                        selectedDays.includes(day)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 text-gray-600 hover:border-green-400'
                      }`}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
