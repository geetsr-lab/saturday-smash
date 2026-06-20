import { useState } from 'react'

// Simple "My Stats" entry point: tap button -> pick your name from a
// dropdown -> jump straight into your PlayerDashboard. No login, no
// password — matches the "no auth" requirement exactly.
export default function MyStats({ players, onSelect, onClose }) {
  const [selected, setSelected] = useState('')

  // Sort alphabetically so the dropdown is easy to scan for a 20-60 age range
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name))

  function handleGo() {
    if (selected) onSelect(selected)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">🏸 My Stats</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <p className="text-slate-400 text-sm mb-3">Select your name to see your stats</p>

        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 focus:border-yellow-400 rounded-xl px-4 py-4 text-white text-lg outline-none transition-colors mb-4"
          autoFocus
        >
          <option value="">Select your name...</option>
          {sortedPlayers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button
          onClick={handleGo}
          disabled={!selected}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold text-lg py-4 rounded-xl transition-colors active:scale-95"
        >
          View My Stats →
        </button>
      </div>
    </div>
  )
}
