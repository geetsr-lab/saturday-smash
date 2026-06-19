import { useState } from 'react'
import { addPlayer, deletePlayer } from '../hooks/useFirestore'

export default function AddPlayer({ players }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleAdd() {
    if (!name.trim()) return
    setLoading(true)
    try {
      await addPlayer(name.trim())
      setName(''); setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleDelete(player) {
    if (confirmDelete === player.id) {
      await deletePlayer(player.id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(player.id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">👤 Add Player</h2>
        <div className="flex gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Player name" maxLength={30}
            className="flex-1 bg-slate-900 border border-slate-600 focus:border-yellow-400 rounded-xl px-4 py-4 text-white text-lg outline-none transition-colors placeholder-slate-500"
          />
          <button onClick={handleAdd} disabled={loading || !name.trim()}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-lg px-6 py-4 rounded-xl transition-colors active:scale-95">
            {loading ? '...' : '+ Add'}
          </button>
        </div>
        {success && <p className="text-green-400 text-sm mt-3 font-medium">✓ Player added!</p>}
      </div>

      {players.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">🗑️ Remove Player</h2>
          <div className="space-y-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-slate-900 rounded-xl px-4 py-3">
                <div>
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-slate-500 text-sm ml-2">{p.wins}W/{p.losses}L</span>
                </div>
                <button onClick={() => handleDelete(p)}
                  className={`text-sm font-bold px-4 py-2 rounded-lg transition-all active:scale-95 ${
                    confirmDelete === p.id
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-700 text-red-400 hover:bg-red-500/20'
                  }`}>
                  {confirmDelete === p.id ? '⚠️ Confirm?' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
