export default function MatchHistory({ matches }) {
  function formatTime(ts) {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  if (!matches.length) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
        <div className="text-5xl mb-3">📋</div>
        <p className="text-slate-400">No matches yet.<br/>Record your first match!</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">📋 Match History</h2>
        <span className="text-slate-400 text-sm">{matches.length} matches</span>
      </div>
      <div className="divide-y divide-slate-700/50">
        {matches.map((match) => (
          <div key={match.id} className="px-4 py-4">
            {/* Badge for type */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${match.type === 'doubles' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {match.type === 'doubles' ? '👥 Doubles' : '🧍 Singles'}
              </span>
              <span className="text-slate-500 text-xs">{formatTime(match.createdAt)}</span>
            </div>

            {match.type === 'doubles' ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-base ${match.winnerTeam === 'A' ? 'text-white' : 'text-slate-500'}`}>
                    🔵 {match.teamANames?.join(' & ')}
                    {match.winnerTeam === 'A' && ' 🏆'}
                  </span>
                </div>
                <div className="text-slate-600 text-sm pl-1">vs</div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-base ${match.winnerTeam === 'B' ? 'text-white' : 'text-slate-500'}`}>
                    🔴 {match.teamBNames?.join(' & ')}
                    {match.winnerTeam === 'B' && ' 🏆'}
                  </span>
                </div>
                <div className="text-green-400 text-sm font-medium mt-1">
                  ✓ Team {match.winnerTeam} won ({match.winnerNames?.join(' & ')})
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-base ${match.winnerId === match.playerAId ? 'text-white' : 'text-slate-500'}`}>
                    {match.playerAName} {match.winnerId === match.playerAId && '🏆'}
                  </span>
                  <span className="text-slate-600 text-sm">vs</span>
                  <span className={`font-bold text-base ${match.winnerId === match.playerBId ? 'text-white' : 'text-slate-500'}`}>
                    {match.playerBName} {match.winnerId === match.playerBId && '🏆'}
                  </span>
                </div>
                <div className="text-green-400 text-sm font-medium mt-1">✓ {match.winnerName} won</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
