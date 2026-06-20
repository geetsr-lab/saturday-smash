import { useState } from 'react'
import { recordSinglesMatch, recordDoublesMatch } from '../hooks/useFirestore'

export default function RecordMatch({ players, sessions }) {
  const [mode, setMode] = useState('doubles')
  const [sessionId, setSessionId] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Singles
  const [sA, setSA] = useState('')
  const [sB, setSB] = useState('')
  const [sWinner, setSWinner] = useState('')

  // Doubles
  const [t1p1, setT1P1] = useState('')
  const [t1p2, setT1P2] = useState('')
  const [t2p1, setT2P1] = useState('')
  const [t2p2, setT2P2] = useState('')
  const [dWinner, setDWinner] = useState('')

  const sel = "w-full bg-slate-900 border border-slate-600 focus:border-yellow-400 rounded-xl px-4 py-4 text-white text-base outline-none transition-colors appearance-none cursor-pointer"

  function avail(exclude = []) {
    return players.filter(p => !exclude.includes(p.id))
  }

  const singlesReady = sA && sB && sA !== sB && sWinner
  const doublesUnique = [t1p1, t1p2, t2p1, t2p2].every(Boolean) && new Set([t1p1, t1p2, t2p1, t2p2]).size === 4
  const doublesReady = doublesUnique && dWinner

  async function handleSave() {
    setLoading(true)
    try {
      const sid = sessionId || null
      if (mode === 'singles') {
        const pA = players.find(p => p.id === sA)
        const pB = players.find(p => p.id === sB)
        const winner = players.find(p => p.id === sWinner)
        await recordSinglesMatch(pA, pB, winner, sid)
        setSA(''); setSB(''); setSWinner('')
      } else {
        const tA = [players.find(p => p.id === t1p1), players.find(p => p.id === t1p2)]
        const tB = [players.find(p => p.id === t2p1), players.find(p => p.id === t2p2)]
        await recordDoublesMatch(tA, tB, dWinner, sid)
        setT1P1(''); setT1P2(''); setT2P1(''); setT2P2(''); setDWinner('')
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (players.length < 2) return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-2">🏸 Record Match</h2>
      <p className="text-slate-400 text-center py-6">Add at least 2 players first.</p>
    </div>
  )

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">🏸 Record Match</h2>

      {/* Session picker — strongly recommended so matches link to sessions correctly */}
      {sessions?.length > 0 && (
        <div className="mb-4">
          <label className="text-slate-300 text-sm font-bold mb-1 block">
            📅 Session <span className="text-yellow-400">(select this so the match counts toward a session!)</span>
          </label>
          <select value={sessionId} onChange={e => setSessionId(e.target.value)} className={sel}>
            <option value="">No session (won't count in Sessions tab)</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          {!sessionId && (
            <p className="text-orange-400 text-xs mt-1">⚠️ Without a session selected, this match won't show up under any session's match count.</p>
          )}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex bg-slate-900 rounded-xl p-1 mb-5">
        <button onClick={() => setMode('doubles')}
          className={`flex-1 py-3 rounded-lg font-bold text-base transition-all ${mode === 'doubles' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
          👥 Doubles
        </button>
        <button onClick={() => setMode('singles')}
          className={`flex-1 py-3 rounded-lg font-bold text-base transition-all ${mode === 'singles' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
          🧍 Singles
        </button>
      </div>

      {mode === 'singles' ? (
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-sm font-medium mb-1 block">Player A</label>
            <select value={sA} onChange={e => { setSA(e.target.value); setSWinner('') }} className={sel}>
              <option value="">Select player...</option>
              {players.filter(p => p.id !== sB).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="text-center text-slate-500 font-bold">VS</div>
          <div>
            <label className="text-slate-400 text-sm font-medium mb-1 block">Player B</label>
            <select value={sB} onChange={e => { setSB(e.target.value); setSWinner('') }} className={sel}>
              <option value="">Select player...</option>
              {players.filter(p => p.id !== sA).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {sA && sB && sA !== sB && (
            <div>
              <label className="text-slate-400 text-sm font-medium mb-2 block">🏆 Winner</label>
              <div className="grid grid-cols-2 gap-3">
                {[sA, sB].map(id => {
                  const p = players.find(x => x.id === id)
                  return (
                    <button key={id} onClick={() => setSWinner(id)}
                      className={`py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${sWinner === id ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                      {p?.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900/60 rounded-xl p-4 border border-blue-500/30">
            <div className="text-blue-400 font-bold text-sm mb-3 uppercase tracking-wider">🔵 Team A</div>
            <div className="space-y-2">
              <select value={t1p1} onChange={e => { setT1P1(e.target.value); setDWinner('') }} className={sel}>
                <option value="">Player 1...</option>
                {avail([t1p2, t2p1, t2p2]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={t1p2} onChange={e => { setT1P2(e.target.value); setDWinner('') }} className={sel}>
                <option value="">Player 2...</option>
                {avail([t1p1, t2p1, t2p2]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="text-center text-slate-500 font-black text-xl">VS</div>
          <div className="bg-slate-900/60 rounded-xl p-4 border border-red-500/30">
            <div className="text-red-400 font-bold text-sm mb-3 uppercase tracking-wider">🔴 Team B</div>
            <div className="space-y-2">
              <select value={t2p1} onChange={e => { setT2P1(e.target.value); setDWinner('') }} className={sel}>
                <option value="">Player 1...</option>
                {avail([t1p1, t1p2, t2p2]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={t2p2} onChange={e => { setT2P2(e.target.value); setDWinner('') }} className={sel}>
                <option value="">Player 2...</option>
                {avail([t1p1, t1p2, t2p1]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          {doublesUnique && (
            <div>
              <label className="text-slate-400 text-sm font-medium mb-2 block">🏆 Which team won?</label>
              <div className="grid grid-cols-2 gap-3">
                {['A','B'].map(team => (
                  <button key={team} onClick={() => setDWinner(team)}
                    className={`py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${
                      dWinner === team
                        ? team === 'A' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}>
                    {team === 'A' ? '🔵' : '🔴'} Team {team}<br/>
                    <span className="text-xs font-normal opacity-80">
                      {team === 'A'
                        ? [t1p1,t1p2].map(id => players.find(p=>p.id===id)?.name).join(' & ')
                        : [t2p1,t2p2].map(id => players.find(p=>p.id===id)?.name).join(' & ')
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={handleSave}
        disabled={mode === 'singles' ? !singlesReady || loading : !doublesReady || loading}
        className="w-full mt-5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl transition-colors active:scale-95">
        {loading ? 'Saving...' : '✅ Save Match'}
      </button>
      {success && <p className="text-green-400 text-center text-sm mt-3 font-medium">✓ Match recorded! +10 rating points awarded 🎉</p>}
    </div>
  )
}
