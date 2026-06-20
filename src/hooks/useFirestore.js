import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp,
  getDoc, getDocs,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { generatePlayerId } from '../lib/playerid'

// ─── PLAYERS ────────────────────────────────────────────────
export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Sort by ratingPoints — falls back to 0 for old players (backward compatible)
    const q = query(collection(db, 'players'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort by ratingPoints desc in JS (handles missing field gracefully)
      data.sort((a, b) => (b.ratingPoints || 0) - (a.ratingPoints || 0))
      setPlayers(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { players, loading }
}

// FIX: lookup now matches by playerCode OR by raw Firestore document ID.
// Root cause of "player not found" for older players: playerCode was added
// later, so players created before that change have no playerCode field.
// Matching on doc ID as well means every player — old or new — resolves
// correctly, with zero changes to existing data.
export function usePlayer(playerIdOrCode) {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!playerIdOrCode) return
    const q = query(collection(db, 'players'))
    const unsub = onSnapshot(q, snap => {
      const found = snap.docs.find(
        d => d.id === playerIdOrCode || d.data().playerCode === playerIdOrCode
      )
      setPlayer(found ? { id: found.id, ...found.data() } : null)
      setLoading(false)
    })
    return () => unsub()
  }, [playerIdOrCode])
  return { player, loading }
}

// ─── MATCHES ────────────────────────────────────────────────
export function useMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { matches, loading }
}

export function usePlayerMatches(playerId) {
  const [matches, setMatches] = useState([])
  useEffect(() => {
    if (!playerId) return
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Filter matches involving this player (works for both singles and doubles)
      const mine = all.filter(m => {
        if (m.type === 'doubles') {
          return [...(m.teamAIds||[]), ...(m.teamBIds||[])].includes(playerId)
        }
        return m.playerAId === playerId || m.playerBId === playerId
      })
      setMatches(mine.slice(0, 10)) // last 10
    })
    return () => unsub()
  }, [playerId])
  return { matches }
}

// ─── SESSIONS ───────────────────────────────────────────────
export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { sessions, loading }
}

// ─── ADD PLAYER ─────────────────────────────────────────────
// SAFE: Only adds new fields. Existing players are untouched.
export async function addPlayer(name) {
  const playerCode = generatePlayerId(name)
  await addDoc(collection(db, 'players'), {
    name: name.trim(),
    playerCode,           // NEW: unique ID e.g. SAU827
    wins: 0,
    losses: 0,
    streak: 0,
    highestStreak: 0,     // NEW: tracks best ever streak
    ratingPoints: 0,      // NEW: starts at 0, +10 per win
    attendanceCount: 0,   // NEW: sessions attended
    attendancePercentage: 0, // NEW: % of sessions attended
    createdAt: serverTimestamp(),
  })
  return playerCode
}

export async function deletePlayer(id) {
  await deleteDoc(doc(db, 'players', id))
}

// ─── RECORD SINGLES ─────────────────────────────────────────
export async function recordSinglesMatch(playerA, playerB, winner, sessionId) {
  const loser = winner.id === playerA.id ? playerB : playerA
  const winnerP = winner.id === playerA.id ? playerA : playerB

  await addDoc(collection(db, 'matches'), {
    type: 'singles',
    playerAId: playerA.id, playerAName: playerA.name,
    playerBId: playerB.id, playerBName: playerB.name,
    winnerId: winnerP.id, winnerName: winnerP.name,
    loserId: loser.id, loserName: loser.name,
    sessionId: sessionId || null,
    createdAt: serverTimestamp(),
  })

  const newWinnerStreak = (winnerP.streak || 0) + 1
  await updateDoc(doc(db, 'players', winnerP.id), {
    wins: (winnerP.wins || 0) + 1,
    streak: newWinnerStreak,
    highestStreak: Math.max(winnerP.highestStreak || 0, newWinnerStreak),
    ratingPoints: (winnerP.ratingPoints || 0) + 10,
  })
  await updateDoc(doc(db, 'players', loser.id), {
    losses: (loser.losses || 0) + 1,
    streak: 0,
  })
}

// ─── RECORD DOUBLES ─────────────────────────────────────────
export async function recordDoublesMatch(teamA, teamB, winningTeam, sessionId) {
  const winners = winningTeam === 'A' ? teamA : teamB
  const losers = winningTeam === 'A' ? teamB : teamA

  await addDoc(collection(db, 'matches'), {
    type: 'doubles',
    teamAIds: teamA.map(p => p.id), teamANames: teamA.map(p => p.name),
    teamBIds: teamB.map(p => p.id), teamBNames: teamB.map(p => p.name),
    winnerTeam: winningTeam,
    winnerNames: winners.map(p => p.name),
    loserNames: losers.map(p => p.name),
    sessionId: sessionId || null,
    createdAt: serverTimestamp(),
  })

  for (const p of winners) {
    const newStreak = (p.streak || 0) + 1
    await updateDoc(doc(db, 'players', p.id), {
      wins: (p.wins || 0) + 1,
      streak: newStreak,
      highestStreak: Math.max(p.highestStreak || 0, newStreak),
      ratingPoints: (p.ratingPoints || 0) + 10,
    })
  }
  for (const p of losers) {
    await updateDoc(doc(db, 'players', p.id), {
      losses: (p.losses || 0) + 1,
      streak: 0,
    })
  }
}

// ─── SESSIONS ───────────────────────────────────────────────
export async function createSession(title) {
  const ref = await addDoc(collection(db, 'sessions'), {
    title: title.trim(),
    attendees: [],         // array of player IDs
    createdAt: serverTimestamp(),
    active: true,
  })
  return ref.id
}

export async function markAttendance(sessionId, playerId, playerName, allSessions, player) {
  const sessionRef = doc(db, 'sessions', sessionId)
  const sessionSnap = await getDoc(sessionRef)
  if (!sessionSnap.exists()) return
  const data = sessionSnap.data()
  const attendees = data.attendees || []
  if (attendees.includes(playerId)) return // already marked

  const newAttendees = [...attendees, playerId]
  await updateDoc(sessionRef, { attendees: newAttendees })

  // Update player attendance count
  const newCount = (player.attendanceCount || 0) + 1
  const totalSessions = allSessions.length
  const pct = totalSessions > 0 ? Math.round((newCount / totalSessions) * 100) : 100
  await updateDoc(doc(db, 'players', playerId), {
    attendanceCount: newCount,
    attendancePercentage: pct,
  })
}

export async function removeAttendance(sessionId, playerId, player, allSessions) {
  const sessionRef = doc(db, 'sessions', sessionId)
  const sessionSnap = await getDoc(sessionRef)
  if (!sessionSnap.exists()) return
  const data = sessionSnap.data()
  const newAttendees = (data.attendees || []).filter(id => id !== playerId)
  await updateDoc(sessionRef, { attendees: newAttendees })

  const newCount = Math.max(0, (player.attendanceCount || 0) - 1)
  const totalSessions = allSessions.length
  const pct = totalSessions > 0 ? Math.round((newCount / totalSessions) * 100) : 0
  await updateDoc(doc(db, 'players', playerId), {
    attendanceCount: newCount,
    attendancePercentage: pct,
  })
}
