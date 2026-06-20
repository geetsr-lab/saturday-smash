import { usePlayer, usePlayerMatches, usePlayers } from '../hooks/useFirestore'
import { calculateBadges } from '../lib/badges'
import { sharePlayerAchievement } from '../components/Leaderboard'
import ShareButtons from '../components/ShareButtons'

export default function PlayerDashboard({ playerCode, onBack }) {
  const { player, loading } = usePlayer(playerCode)
  const { players } = usePlayers()
  const { matches } = usePlayerMatches(player?.id)

  // Works whether we got here via the homepage "My Stats" dropdown
  // (onBack is provided) or via a shared /player/CODE link (no onBack,
  // so we just navigate home).
  function goBack() {
    if (onBack) onBack()
    else window.location.href = '/'
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-3">🏸</div>
        <p className="text-slate-400">Loading profile...</p>
      </div>
    </div>
  )

  if (!player) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-white text-xl font-bold mb-2">Player Not Found</h2>
        <p className="text-slate-400 mb-6">No player with ID <span className="text-yellow-400 font-mono font-bold">{playerCode}</span></p>
        <button onClick={goBack} className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-xl">← Back to App</button>
      </div>
    </div>
  )

  const sorted = [...players].sort((a,b) => (b.ratingPoints||0)-(a.ratingPoints||0))
  const rank = sorted.findIndex(p => p.id === player.id) + 1
  const totalPlayers = players.length
  const total = (player.wins||0) + (player.losses||0)
  const winPct = total > 0 ? Math.round((player.wins/total)*100) : 0
  const badges = calculateBadges(player, players)


  function getMatchResult(match) {
    if (match.type === 'doubles') {
      const inTeamA = (match.teamAIds||[]).includes(player.id)
      const inTeamB = (match.teamBIds||[]).includes(player.id)
      const won = (inTeamA && match.winnerTeam==='A') || (inTeamB && match.winnerTeam==='B')
      const teammates = inTeamA
        ? (match.teamANames||[]).filter(n => n !== player.name)
        : (match.teamBNames||[]).filter(n => n !== player.name)
      const opponents = inTeamA ? match.teamBNames : match.teamANames
      return {
        won,
        label: won ? `Win (Doubles)` : `Loss (Doubles)`,
        against: `vs ${(opponents||[]).join(' & ')}`,
        color: won ? 'text-green-400' : 'text-red-400',
        icon: won ? '✅' : '❌',
      }
    } else {
      const won = match.winnerId === player.id
      const opponent = match.playerAId === player.id ? match.playerBName : match.playerAName
      return {
        won,
        label: won ? `Win` : `Loss`,
        against: `vs ${opponent}`,
        color: won ? 'text-green-400' : 'text-red-400',
        icon: won ? '✅' : '❌',
      }
    }
  }

  const badgeText = badges.map(b => `${b.icon} ${b.label}`).join(' | ')
  const profileShareText = `🏸 *Saturday Smash Profile*\n\n👤 *${player.name}*\n🎯 Rank: #${rank} of ${totalPlayers}\n⭐ Rating: ${player.ratingPoints||0} pts\n✅ Wins: ${player.wins||0}\n❌ Losses: ${player.losses||0}\n📊 Win Rate: ${winPct}%\n🔥 Streak: ${player.streak||0}\n📅 Sessions: ${player.attendanceCount||0} (${player.attendancePercentage||0}%)\n\n${badgeText ? `🎖️ ${badgeText}` : ''}\n\n_Saturday Smash Badminton League_ 🏸`

  const medals = ['🥇','🥈','🥉']

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-10">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={goBack} className="text-slate-400 hover:text-white text-2xl transition-colors">←</button>
          <div>
            <h1 className="text-lg font-black text-white leading-none">Player Profile</h1>
            <p className="text-slate-500 text-xs">Saturday Smash 🏸</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-4xl font-black text-white">{player.name}</div>
              <div className="text-yellow-400 font-mono text-sm mt-1">{player.playerCode || playerCode}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl">{medals[rank-1] || `#${rank}`}</div>
              <div className="text-slate-400 text-xs mt-1">Leaderboard Position: #{rank} of {totalPlayers}</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Rating', value: player.ratingPoints||0, unit: 'pts', color: 'text-yellow-400' },
              { label: 'Matches Played', value: total, color: 'text-blue-400' },
              { label: 'Wins', value: player.wins||0, color: 'text-green-400' },
              { label: 'Losses', value: player.losses||0, color: 'text-red-400' },
              { label: 'Win Rate', value: `${winPct}%`, color: winPct>=60?'text-green-400':winPct>=40?'text-yellow-400':'text-slate-400' },
              { label: 'Current Streak', value: player.streak||0, color: 'text-orange-400' },
              { label: 'Highest Streak', value: player.highestStreak||player.streak||0, color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-900 rounded-xl p-3 text-center">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}{stat.unit ? '' : ''}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-bold">📅 Attendance</div>
              <div className="text-slate-400 text-sm">{player.attendanceCount||0} sessions attended</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-400">{player.attendancePercentage||0}%</div>
              <div className="text-slate-500 text-xs">attendance rate</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-3">🎖️ Badges</h3>
            <div className="grid grid-cols-1 gap-2">
              {badges.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <div className="text-white font-bold text-sm">{b.label}</div>
                      <div className="text-slate-500 text-xs">{b.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => sharePlayerAchievement(player, players, b)}
                    className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                    📲 Share
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent matches */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h3 className="text-white font-bold text-lg">Recent Matches</h3>
          </div>
          {matches.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500">No matches yet</div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {matches.map(match => {
                const result = getMatchResult(match)
                return (
                  <div key={match.id} className="px-5 py-4 flex items-center gap-3">
                    <span className="text-2xl">{result.icon}</span>
                    <div>
                      <div className={`font-bold ${result.color}`}>{result.label}</div>
                      <div className="text-slate-400 text-sm">{result.against}</div>
                    </div>
                    {result.won && <span className="ml-auto text-yellow-400 text-xs font-bold">+10 pts</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Share profile — WhatsApp + copy fallback, works reliably on Android/iPhone/WhatsApp Web */}
        <ShareButtons text={profileShareText} label="Share My Profile" />
      </div>
    </div>
  )
}
