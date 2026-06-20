import { calculateBadges } from '../lib/badges'
import { useEffect, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { openWhatsApp, copyToClipboard } from '../lib/share'

// Auto-fix old players that have wins but 0 ratingPoints
async function backfillRatingPoints(players) {
  for (const p of players) {
    const expectedPts = (p.wins || 0) * 10
    if ((p.ratingPoints || 0) === 0 && expectedPts > 0) {
      try {
        await updateDoc(doc(db, 'players', p.id), {
          ratingPoints: expectedPts,
          highestStreak: p.highestStreak || p.streak || 0,
          attendanceCount: p.attendanceCount || 0,
          attendancePercentage: p.attendancePercentage || 0,
        })
      } catch(e) { console.error('backfill error', e) }
    }
  }
}

// FIX: was window.open(..., '_blank') which mobile browsers (esp. iOS
// Safari / in-app browsers) frequently block as a popup, causing the
// "message disappears / WhatsApp opens empty" bug. location.href is the
// reliable cross-platform approach (Android, iPhone, WhatsApp Web).
export function sharePlayerAchievement(player, players, achievement) {
  const text = `🏸 *Saturday Smash*\n\n${achievement.icon} *${player.name}* earned *${achievement.label}*!\n\n📊 Stats:\n✅ Wins: ${player.wins||0}\n❌ Losses: ${player.losses||0}\n⭐ Rating: ${player.ratingPoints||((player.wins||0)*10)} pts\n🔥 Streak: ${player.streak||0}\n\n_Saturday Smash Badminton League_ 🏸`
  openWhatsApp(text)
}

// Single source of truth for the Top-5 share text — used by both the
// WhatsApp button and the Copy button so they can never drift out of sync.
function buildLeaderboardText(players) {
  const top5 = [...players].sort((a,b) => getPoints(b) - getPoints(a)).slice(0, 5)
  const rows = top5.map((p, i) => {
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣']
    const total = (p.wins||0) + (p.losses||0)
    const pct = total > 0 ? Math.round((p.wins/total)*100) : 0
    return `${medals[i]} ${p.name} — ${getPoints(p)} pts | ${p.wins||0}W (${pct}%)`
  }).join('\n')
  return `🏸 *Saturday Smash — Top 5*\n\n${rows}\n\n_Updated live every Saturday!_ 🔥`
}

export function shareLeaderboard(players) {
  openWhatsApp(buildLeaderboardText(players))
}

// Safely get points — fallback to wins×10 for old players
function getPoints(player) {
  if ((player.ratingPoints || 0) > 0) return player.ratingPoints
  return (player.wins || 0) * 10
}

export default function Leaderboard({ players }) {
  const [copied, setCopied] = useState(false)

  // Auto-backfill rating points for existing players on first load
  useEffect(() => {
    if (players.length > 0) backfillRatingPoints(players)
  }, [players.length])

  if (!players.length) return (
    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
      <div className="text-5xl mb-3">🏸</div>
      <p className="text-slate-400">No players yet. Ask admin to add players!</p>
    </div>
  )

  // Sort using safe getPoints
  const sorted = [...players].sort((a, b) => getPoints(b) - getPoints(a))
  const mvp = sorted[0]
  const streakLeader = [...players].sort((a,b) => (b.streak||0) - (a.streak||0))[0]

  function handleShareLeaderboard() {
    shareLeaderboard(players)
  }

  async function handleCopyLeaderboard() {
    const ok = await copyToClipboard(buildLeaderboardText(players))
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <div className="space-y-4">
      {/* MVP & Streak cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">MVP</div>
          <div className="text-white font-bold text-base leading-tight">{mvp.name}</div>
          <div className="text-yellow-400 text-sm mt-1">{getPoints(mvp)} pts</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/30 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Hot Streak</div>
          <div className="text-white font-bold text-base leading-tight">{streakLeader.name}</div>
          <div className="text-orange-400 text-sm mt-1">{streakLeader.streak||0} in a row</div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button onClick={handleShareLeaderboard}
          className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          📲 Share Top 5
        </button>
        <button onClick={handleCopyLeaderboard}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm px-4 rounded-xl transition-colors">
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {/* Standings table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">📊 Standings</h2>
          <span className="text-slate-500 text-xs">Sorted by rating pts</span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 px-4 py-2 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-700/50">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Pts</div>
          <div className="col-span-2 text-center">W/L</div>
          <div className="col-span-2 text-center">Win%</div>
        </div>

        <div className="divide-y divide-slate-700/50">
          {sorted.map((player, i) => {
            const total = (player.wins||0) + (player.losses||0)
            const pct = total > 0 ? Math.round((player.wins/total)*100) : 0
            const pts = getPoints(player)
            const medals = ['🥇','🥈','🥉']
            const badges = calculateBadges({ ...player, ratingPoints: pts }, sorted)

            return (
              <div key={player.id} className={`px-4 py-4 ${i === 0 ? 'bg-yellow-400/5' : ''}`}>
                <div className="grid grid-cols-12 items-center">
                  {/* Rank */}
                  <div className="col-span-1 text-xl">
                    {medals[i] || <span className="text-slate-500 text-sm font-bold">{i+1}</span>}
                  </div>

                  {/* Name */}
                  <div className="col-span-5">
                    <a
                      href={`/player/${player.playerCode || player.id}`}
                      className="text-white font-bold text-base hover:text-yellow-400 transition-colors block"
                    >
                      {player.name}
                    </a>
                    {player.playerCode && (
                      <span className="text-slate-500 text-xs font-mono">{player.playerCode}</span>
                    )}
                  </div>

                  {/* Points */}
                  <div className="col-span-2 text-center">
                    <span className="text-yellow-400 font-black text-xl">{pts}</span>
                  </div>

                  {/* W/L */}
                  <div className="col-span-2 text-center">
                    <span className="text-green-400 font-bold">{player.wins||0}</span>
                    <span className="text-slate-600 text-xs">/</span>
                    <span className="text-red-400">{player.losses||0}</span>
                  </div>

                  {/* Win% */}
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-bold ${pct>=60?'text-green-400':pct>=40?'text-yellow-400':'text-slate-400'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap pl-8">
                    {badges.map((b, idx) => (
                      <button key={idx}
                        onClick={() => sharePlayerAchievement(player, players, b)}
                        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-full text-yellow-400 transition-colors"
                        title="Tap to share on WhatsApp">
                        {b.icon} {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
