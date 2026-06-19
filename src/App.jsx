import { useState } from 'react'
import { usePlayers, useMatches } from './hooks/useFirestore'
import AdminGate from './components/AdminGate'
import AddPlayer from './components/AddPlayer'
import RecordMatch from './components/RecordMatch'
import Leaderboard from './components/Leaderboard'
import MatchHistory from './components/MatchHistory'

const TABS = [
  { id: 'leaderboard', label: 'Standings', icon: '🏆' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
]

export default function App() {
  const [tab, setTab] = useState('leaderboard')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const { players, loading: playersLoading } = usePlayers()
  const { matches, loading: matchesLoading } = useMatches()

  function handleAdminTab() {
    if (isAdmin) setTab('admin')
    else setShowPin(true)
  }

  function handleUnlock() {
    setIsAdmin(true)
    setShowPin(false)
    setTab('admin')
  }

  const loading = playersLoading || matchesLoading

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {showPin && <AdminGate onUnlock={handleUnlock} onClose={() => setShowPin(false)} />}

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏸</span>
            <div>
              <h1 className="text-xl font-black text-white leading-none">Saturday Smash</h1>
              <p className="text-slate-500 text-xs">Badminton League</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-400/30">
                ADMIN
              </span>
            )}
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-center">
            <div>
              <div className="text-5xl mb-3 animate-bounce">🏸</div>
              <p className="text-slate-400">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {tab === 'leaderboard' && <Leaderboard players={players} />}
            {tab === 'history' && <MatchHistory matches={matches} />}
            {tab === 'admin' && isAdmin && (
              <div className="space-y-4">
                <RecordMatch players={players} />
                <AddPlayer players={players} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-20">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => t.id === 'admin' ? handleAdminTab() : setTab(t.id)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${tab === t.id ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  )
}
