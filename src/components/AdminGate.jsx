import { useState } from 'react'
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

export default function AdminGate({ onUnlock, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit() {
    if (pin === ADMIN_PIN) { onUnlock() }
    else {
      setError(true); setPin('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="text-slate-400 mt-1 text-sm">Enter PIN to manage players & matches</p>
        </div>
        <input
          type="password" inputMode="numeric" value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="• • • •" maxLength={8} autoFocus
          className={`w-full text-center text-3xl font-bold tracking-widest bg-slate-900 border-2 rounded-xl p-4 text-white outline-none mb-4 transition-colors ${error ? 'border-red-500' : 'border-slate-600 focus:border-yellow-400'}`}
        />
        {error && <p className="text-red-400 text-center text-sm mb-3 font-medium">Wrong PIN. Try again.</p>}
        <button onClick={handleSubmit}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-lg py-4 rounded-xl transition-colors active:scale-95 mb-3">
          Unlock Admin
        </button>
        <button onClick={onClose} className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
