import { useState } from 'react'
import { usePlayers, useMatches, useSessions } from './hooks/useFirestore'
import AdminGate from './components/AdminGate'
import AddPlayer from './components/AddPlayer'
import RecordMatch from './components/RecordMatch'
import Leaderboard from './components/Leaderboard'
import MatchHistory from './components/MatchHistory'
import Sessions from './components/Sessions'
import MyStats from './components/MyStats'
import RelinkMatches from './components/RelinkMatches'
import PlayerDashboard from './pages/PlayerDashboard'

// Simple client-side routing — no router library needed
function getRoute() {
  const path = window.location.pathname
  const match = path.match(/^\/player\/([A-Za-z0-9]+)$/i)
  if (match) return { page: 'player', code: match[1] }
  return { page: 'home' }
}

const TABS = [
  { id: 'leaderboard', label: 'Standings', icon: '🏆' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'sessions', label: 'Sessions', icon: '📅' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
]

export default function App() {
  const route = getRoute()

  // Player profile page (via shared /player/CODE link)
  if (route.page === 'player') {
    return <PlayerDashboard playerCode={route.code} />
  }

  return <HomeApp />
}

function HomeApp() {
  const [tab, setTab] = useState('leaderboard')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showMyStats, setShowMyStats] = useState(false)
  const [viewingPlayerId, setViewingPlayerId] = useState(null)
  const { players, loading: pLoading } = usePlayers()
  const { matches, loading: mLoading } = useMatches()
  const { sessions, loading: sLoading } = useSessions()

  function handleAdminTab() {
    if (isAdmin) setTab('admin')
    else setShowPin(true)
  }

  function handleUnlock() {
    setIsAdmin(true)
    setShowPin(false)
    setTab('admin')
  }

  function handleMyStatsSelect(playerId) {
    setShowMyStats(false)
    setViewingPlayerId(playerId)
  }

  const loading = pLoading || mLoading || sLoading

  // Inline player dashboard view — no URL change needed, so the back
  // button just clears local state and returns to whichever tab was open.
  if (viewingPlayerId) {
    return (
      <PlayerDashboard
        playerCode={viewingPlayerId}
        onBack={() => setViewingPlayerId(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {showPin && <AdminGate onUnlock={handleUnlock} onClose={() => setShowPin(false)} />}
      {showMyStats && (
        <MyStats
          players={players}
          onSelect={handleMyStatsSelect}
          onClose={() => setShowMyStats(false)}
        />
      )}

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
              <span className="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-400/30">ADMIN</span>
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
            {/* My Stats button — large, obvious, top of homepage */}
            <button
              onClick={() => setShowMyStats(true)}
              className="w-full mb-4 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-slate-900 font-black text-lg py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              🏸 My Stats
            </button>

            {tab === 'leaderboard' && <Leaderboard players={players} />}
            {tab === 'history' && <MatchHistory matches={matches} />}
            {tab === 'sessions' && <Sessions sessions={sessions} players={players} matches={matches} />}
            {tab === 'admin' && isAdmin && (
              <div className="space-y-4">
                <RecordMatch players={players} sessions={sessions} />
                <AddPlayer players={players} />
                <RelinkMatches matches={matches} sessions={sessions} players={players} />
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
