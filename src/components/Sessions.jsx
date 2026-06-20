import { useState } from 'react'
import { createSession, markAttendance, removeAttendance } from '../hooks/useFirestore'

export default function Sessions({ sessions, players, matches }) {
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSession, setActiveSession] = useState(null)

  async function handleCreate() {
    if (!newTitle.trim()) return
    setLoading(true)
    try {
      const id = await createSession(newTitle)
      setNewTitle('')
      setActiveSession(id)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  async function toggleAttendance(session, player) {
    const present = (session.attendees || []).includes(player.id)
    if (present) {
      await removeAttendance(session.id, player.id, player, sessions)
    } else {
      await markAttendance(session.id, player.id, player.name, sessions, player)
    }
  }

  // Calculate session MVP
  function getSessionMVP(session) {
    if (!session || !matches.length) return null
    const sessionMatches = matches.filter(m => m.sessionId === session.id)
    const winsMap = {}
    sessionMatches.forEach(m => {
      if (m.type === 'singles') {
        winsMap[m.winnerId] = (winsMap[m.winnerId] || 0) + 1
      } else if (m.type === 'doubles') {
        const winners = m.winnerTeam === 'A' ? m.teamAIds : m.teamBIds
        ;(winners || []).forEach(id => { winsMap[id] = (winsMap[id] || 0) + 1 })
      }
    })
    let mvpId = null, mvpWins = 0
    Object.entries(winsMap).forEach(([id, w]) => { if (w > mvpWins) { mvpWins = w; mvpId = id } })
    if (!mvpId) return null
    const mvpPlayer = players.find(p => p.id === mvpId)
    return mvpPlayer ? { ...mvpPlayer, sessionWins: mvpWins } : null
  }

  // Share session summary
  function shareSession(session) {
    const mvp = getSessionMVP(session)
    const sessionMatches = matches.filter(m => m.sessionId === session.id)
    const sorted = [...players].sort((a,b) => (b.ratingPoints||0)-(a.ratingPoints||0))
    const rank1 = sorted[0]

    // Biggest climber — player with most wins in this session
    const winsInSession = {}
    sessionMatches.forEach(m => {
      if (m.type === 'singles') winsInSession[m.winnerId] = (winsInSession[m.winnerId]||0)+1
      else (m.winnerTeam==='A' ? m.teamAIds : m.teamBIds || []).forEach(id => { winsInSession[id]=(winsInSession[id]||0)+1 })
    })
    let climberId = null, climberWins = 0
    Object.entries(winsInSession).forEach(([id, w]) => { if (w > climberWins) { climberWins=w; climberId=id } })
    const climber = climberId ? players.find(p => p.id === climberId) : null

    // Longest streak in session
    let streakLeader = [...players].sort((a,b)=>(b.streak||0)-(a.streak||0))[0]

    const text = `🏸 *${session.title}*\n\n` +
      `🏆 MVP: ${mvp ? mvp.name + ` (${mvp.sessionWins} wins)` : 'TBD'}\n` +
      `🔥 Hot Streak: ${streakLeader ? streakLeader.name + ` (${streakLeader.streak||0})` : '-'}\n` +
      `👑 Rank #1: ${rank1 ? rank1.name : '-'}\n` +
      `📈 Biggest Climber: ${climber ? climber.name : '-'}\n` +
      `🎮 Matches Played: ${sessionMatches.length}\n` +
      `👥 Players Present: ${(session.attendees||[]).length}\n\n` +
      `_Saturday Smash 🏸_`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const expandedSession = sessions.find(s => s.id === activeSession)

  return (
    <div className="space-y-4">
      {/* Create new session */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">📅 Create Session</h2>
        <div className="flex gap-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Saturday Smash #12"
            className="flex-1 bg-slate-900 border border-slate-600 focus:border-yellow-400 rounded-xl px-4 py-4 text-white text-base outline-none transition-colors placeholder-slate-500"
          />
          <button onClick={handleCreate} disabled={loading || !newTitle.trim()}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold px-5 py-4 rounded-xl transition-colors active:scale-95">
            {loading ? '...' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Sessions list */}
      {sessions.map(session => {
        const mvp = getSessionMVP(session)
        const isOpen = activeSession === session.id
        const sessionMatches = matches.filter(m => m.sessionId === session.id)
        return (
          <div key={session.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <button onClick={() => setActiveSession(isOpen ? null : session.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
              <div className="text-left">
                <div className="text-white font-bold text-base">{session.title}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {(session.attendees||[]).length} players • {sessionMatches.length} matches
                  {mvp && <span className="text-yellow-400 ml-2">🏆 MVP: {mvp.name}</span>}
                </div>
              </div>
              <span className="text-slate-400 text-xl">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 border-t border-slate-700 pt-4 space-y-4">
                {/* MVP banner */}
                {mvp && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 text-center">
                    <div className="text-yellow-400 font-black text-lg">🏆 MVP OF THE SESSION</div>
                    <div className="text-white font-bold text-xl mt-1">{mvp.name}</div>
                    <div className="text-yellow-400 text-sm">{mvp.sessionWins} wins this session</div>
                  </div>
                )}

                {/* Attendance */}
                <div>
                  <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">Mark Attendance</div>
                  <div className="grid grid-cols-2 gap-2">
                    {players.map(p => {
                      const present = (session.attendees || []).includes(p.id)
                      return (
                        <button key={p.id} onClick={() => toggleAttendance(session, p)}
                          className={`py-3 px-4 rounded-xl font-medium text-sm transition-all active:scale-95 flex items-center gap-2 ${
                            present ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-slate-900 border border-slate-700 text-slate-400'
                          }`}>
                          <span>{present ? '✅' : '⬜'}</span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Share */}
                <button onClick={() => shareSession(session)}
                  className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  📲 Share Session Summary on WhatsApp
                </button>
              </div>
            )}
          </div>
        )
      })}

      {sessions.length === 0 && (
        <div className="text-center py-8 text-slate-500">No sessions yet. Create one above!</div>
      )}
    </div>
  )
}
