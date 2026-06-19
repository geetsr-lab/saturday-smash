export function getBadge(player, players) {
  const sorted = [...players].sort((a, b) => (b.wins||0) - (a.wins||0))
  const streakSorted = [...players].sort((a, b) => (b.streak||0) - (a.streak||0))
  const badges = []
  if (sorted[0]?.id === player.id && (player.wins||0) > 0) badges.push({ icon: '🏆', label: 'MVP' })
  if (streakSorted[0]?.id === player.id && (player.streak||0) >= 3) badges.push({ icon: '🔥', label: `${player.streak} Streak` })
  const total = (player.wins||0) + (player.losses||0)
  const pct = total > 0 ? Math.round((player.wins / total) * 100) : 0
  if (pct === 100 && total >= 3) badges.push({ icon: '⚡', label: 'Unbeaten' })
  if ((player.wins||0) >= 10) badges.push({ icon: '💎', label: 'Legend' })
  if ((player.wins||0) >= 5) badges.push({ icon: '⭐', label: 'Pro' })
  return badges
}

export function shareToWhatsApp(player, players) {
  const badges = getBadge(player, players)
  const total = (player.wins||0) + (player.losses||0)
  const pct = total > 0 ? Math.round((player.wins / total) * 100) : 0
  const badgeText = badges.map(b => b.icon + ' ' + b.label).join(' | ')
  const text = `🏸 *Saturday Smash Leaderboard*\n\n👤 *${player.name}*\n✅ Wins: ${player.wins||0}\n❌ Losses: ${player.losses||0}\n📊 Win Rate: ${pct}%\n🔥 Streak: ${player.streak||0}\n${badgeText ? `\n🎖️ Badges: ${badgeText}` : ''}\n\n_Join us every Saturday! 🏸_`
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

export function shareLeaderboard(players) {
  const top5 = [...players].sort((a,b)=>(b.wins||0)-(a.wins||0)).slice(0,5)
  const rows = top5.map((p,i) => {
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣']
    const total = (p.wins||0)+(p.losses||0)
    const pct = total>0 ? Math.round((p.wins/total)*100) : 0
    return `${medals[i]} ${p.name} — ${p.wins||0}W/${p.losses||0}L (${pct}%)`
  }).join('\n')
  const text = `🏸 *Saturday Smash — Top 5*\n\n${rows}\n\n_Updated live every Saturday!_ 🔥`
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

export default function Leaderboard({ players }) {
  if (!players.length) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
        <div className="text-5xl mb-3">🏸</div>
        <p className="text-slate-400">No players yet.<br/>Ask admin to add players!</p>
      </div>
    )
  }

  const sorted = [...players].sort((a,b) => (b.wins||0)-(a.wins||0))
  const mvp = sorted[0]
  const streakLeader = [...players].sort((a,b)=>(b.streak||0)-(a.streak||0))[0]

  return (
    <div className="space-y-4">
      {/* MVP & Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">🏆</div>
          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">MVP</div>
          <div className="text-white font-bold text-base leading-tight">{mvp.name}</div>
          <div className="text-yellow-400 text-sm mt-1">{mvp.wins||0} wins</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/30 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Hot Streak</div>
          <div className="text-white font-bold text-base leading-tight">{streakLeader.name}</div>
          <div className="text-orange-400 text-sm mt-1">{streakLeader.streak||0} in a row</div>
        </div>
      </div>

      {/* Share full leaderboard */}
      <button onClick={() => shareLeaderboard(players)}
        className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
        <span>📲</span> Share Top 5 on WhatsApp
      </button>

      {/* Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">📊 Standings</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          <div className="grid grid-cols-12 px-4 py-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">W</div>
            <div className="col-span-2 text-center">L</div>
            <div className="col-span-2 text-center">%</div>
          </div>
          {sorted.map((player, i) => {
            const total = (player.wins||0) + (player.losses||0)
            const pct = total > 0 ? Math.round((player.wins/total)*100) : 0
            const medals = ['🥇','🥈','🥉']
            const badges = getBadge(player, players)
            return (
              <div key={player.id} className={`px-4 py-4 ${i === 0 ? 'bg-yellow-400/5' : ''}`}>
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-1 text-lg">
                    {medals[i] || <span className="text-slate-500 text-sm font-bold">{i+1}</span>}
                  </div>
                  <div className="col-span-5">
                    <div className="text-white font-semibold text-base">{player.name}</div>
                    {badges.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {badges.map((b,idx) => (
                          <span key={idx} className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-yellow-400">
                            {b.icon} {b.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-center text-green-400 font-bold text-lg">{player.wins||0}</div>
                  <div className="col-span-2 text-center text-red-400 font-medium">{player.losses||0}</div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-bold ${pct>=60?'text-green-400':pct>=40?'text-yellow-400':'text-slate-400'}`}>{pct}%</span>
                  </div>
                </div>
                {/* Share individual */}
                <button onClick={() => shareToWhatsApp(player, players)}
                  className="mt-2 w-full text-xs text-slate-500 hover:text-green-400 transition-colors flex items-center justify-end gap-1">
                  <span>📲</span> Share {player.name}'s stats
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
