// All badge logic in one place - purely calculated from existing data
// No new fields needed for badges - calculated on the fly

export function calculateBadges(player, allPlayers) {
  const badges = []
  const wins = player.wins || 0
  const streak = player.streak || 0
  const highestStreak = player.highestStreak || streak
  const attendance = player.attendanceCount || 0
  const totalMatches = wins + (player.losses || 0)
  
  // Sort to find rank
  const sorted = [...allPlayers].sort((a, b) => (b.ratingPoints || 0) - (a.ratingPoints || 0))
  const rank = sorted.findIndex(p => p.id === player.id) + 1

  // Winning badges
  if (highestStreak >= 3 || streak >= 3)
    badges.push({ icon: '🔥', label: 'Hot Streak', desc: '3 wins in a row' })
  if (highestStreak >= 5 || streak >= 5)
    badges.push({ icon: '⚡', label: 'Unstoppable', desc: '5 wins in a row' })
  if (rank === 1 && wins > 0)
    badges.push({ icon: '👑', label: 'King of the Court', desc: 'Ranked #1' })

  // Participation badges
  if (totalMatches >= 1)
    badges.push({ icon: '🏸', label: 'First Match', desc: 'First recorded match' })
  if (totalMatches >= 100)
    badges.push({ icon: '💯', label: 'Century Club', desc: '100 matches played' })

  // Attendance badges
  if (attendance >= 5)
    badges.push({ icon: '📅', label: 'Regular', desc: 'Attended 5 sessions' })
  if (attendance >= 15)
    badges.push({ icon: '🎯', label: 'Dedicated', desc: 'Attended 15 sessions' })
  if (attendance >= 30)
    badges.push({ icon: '🏆', label: 'Legend', desc: 'Attended 30 sessions' })

  return badges
}

export function getRatingColor(points) {
  if (points >= 100) return 'text-yellow-400'
  if (points >= 50) return 'text-blue-400'
  if (points >= 20) return 'text-green-400'
  return 'text-slate-400'
}
