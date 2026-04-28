import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Message { role: 'user' | 'model'; text: string; }

const API_KEY = (import.meta as unknown as { env: Record<string, string> }).env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are a helpful assistant embedded in a Disaster Response Coordination Platform.
Users are either Coordinators (who manage disaster needs, create tasks, assign volunteers) or Volunteers (who accept and complete tasks).
Help them navigate the app, understand urgency scores, task statuses, CSV import, volunteer matching, and general disaster response best practices.
Be concise, empathetic, and action-oriented. Keep responses short and clear.`;

export default function GeminiChat() {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!user) return null;

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const contents = [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nMy role: ${role ?? 'unknown'}.` }] },
        { role: 'model', parts: [{ text: 'Understood. How can I help?' }] },
        ...updated.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      ];

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Gemini API error');
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.';
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err: unknown) {
      setMessages((prev) => [...prev, { role: 'model', text: `⚠️ ${(err as Error).message}` }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle AI assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-xl transition-all duration-200 hover:scale-105 ${
          open ? 'bg-gray-800 text-white rotate-0' : 'bg-brand-600 text-white shadow-brand-600/40'
        }`}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-gray-950 border border-white/10 rounded-2xl shadow-modal flex flex-col overflow-hidden"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-gray-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-sm">🤖</div>
              <div>
                <p className="text-white font-semibold text-sm">AI Assistant</p>
                <p className="text-gray-400 text-xs capitalize">{role ?? 'assistant'} mode</p>
              </div>
            </div>
            <button onClick={() => setMessages([])} className="text-xs text-gray-500 hover:text-gray-300 transition px-2 py-1 rounded hover:bg-white/5">
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10 space-y-2">
                <p className="text-3xl">👋</p>
                <p className="text-gray-300 font-medium">Hi, I'm your AI assistant</p>
                <p className="text-xs text-gray-500">Ask me about tasks, needs, volunteers, or how to use the platform.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 border border-white/5 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex gap-1 items-center">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-3 py-3 border-t border-white/10 bg-gray-900 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-3.5 py-2 text-sm font-bold transition disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
