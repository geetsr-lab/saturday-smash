import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

// SAFE, OPT-IN TOOL — admin-only.
// Root cause recap: historical matches recorded with "No session" selected
// have sessionId: null forever. This tool lets an admin manually attach
// specific orphaned matches to a session, ONE AT A TIME, with a visible
// confirmation. It never runs automatically and never touches matches
// that already have a sessionId.
export default function RelinkMatches({ matches, sessions, players }) {
  const [targetSession, setTargetSession] = useState('')
  const [linking, setLinking] = useState(null)

  const unlinked = matches.filter(m => !m.sessionId)

  function describeMatch(m) {
    if (m.type === 'doubles') {
      return `${(m.teamANames||[]).join(' & ')} vs ${(m.teamBNames||[]).join(' & ')}`
    }
    return `${m.playerAName} vs ${m.playerBName}`
  }

  async function handleLink(match) {
    if (!targetSession) return
    setLinking(match.id)
    try {
      await updateDoc(doc(db, 'matches', match.id), { sessionId: targetSession })
    } catch (e) {
      console.error('relink error', e)
    }
    setLinking(null)
  }

  if (unlinked.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-white mb-1">🔗 Link Old Matches to Sessions</h2>
        <p className="text-slate-400 text-sm">All matches are already linked to a session. Nothing to fix here!</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <h2 className="text-lg font-bold text-white mb-1">🔗 Link Old Matches to Sessions</h2>
      <p className="text-slate-400 text-sm mb-4">
        These {unlinked.length} matches were saved without a session, so they don't count toward any
        session's match total. Pick a session below, then tap a match to attach it. This never deletes
        or changes anything else.
      </p>

      <select
        value={targetSession}
        onChange={e => setTargetSession(e.target.value)}
        className="w-full bg-slate-900 border border-slate-600 focus:border-yellow-400 rounded-xl px-4 py-3 text-white text-base outline-none mb-4"
      >
        <option value="">Select a session to link matches to...</option>
        {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>

      <div className="space-y-2">
        {unlinked.map(m => (
          <div key={m.id} className="flex items-center justify-between bg-slate-900 rounded-xl px-4 py-3">
            <span className="text-white text-sm">{describeMatch(m)}</span>
            <button
              onClick={() => handleLink(m)}
              disabled={!targetSession || linking === m.id}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-slate-900 font-bold text-xs px-3 py-2 rounded-lg transition-colors active:scale-95"
            >
              {linking === m.id ? 'Linking...' : 'Link'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
