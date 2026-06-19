import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('wins', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { players, loading }
}

export function useMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])
  return { matches, loading }
}

export async function addPlayer(name) {
  await addDoc(collection(db, 'players'), {
    name: name.trim(), wins: 0, losses: 0, streak: 0,
    createdAt: serverTimestamp(),
  })
}

export async function deletePlayer(id) {
  await deleteDoc(doc(db, 'players', id))
}

// Singles match
export async function recordSinglesMatch(playerA, playerB, winner) {
  const loser = winner.id === playerA.id ? playerB : playerA
  const winnerP = winner.id === playerA.id ? playerA : playerB
  await addDoc(collection(db, 'matches'), {
    type: 'singles',
    playerAId: playerA.id, playerAName: playerA.name,
    playerBId: playerB.id, playerBName: playerB.name,
    winnerId: winnerP.id, winnerName: winnerP.name,
    loserId: loser.id, loserName: loser.name,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'players', winnerP.id), {
    wins: (winnerP.wins || 0) + 1, streak: (winnerP.streak || 0) + 1,
  })
  await updateDoc(doc(db, 'players', loser.id), {
    losses: (loser.losses || 0) + 1, streak: 0,
  })
}

// Doubles match
export async function recordDoublesMatch(teamA, teamB, winningTeam) {
  const winners = winningTeam === 'A' ? teamA : teamB
  const losers = winningTeam === 'A' ? teamB : teamA
  await addDoc(collection(db, 'matches'), {
    type: 'doubles',
    teamAIds: teamA.map(p => p.id),
    teamANames: teamA.map(p => p.name),
    teamBIds: teamB.map(p => p.id),
    teamBNames: teamB.map(p => p.name),
    winnerTeam: winningTeam,
    winnerNames: winners.map(p => p.name),
    loserNames: losers.map(p => p.name),
    createdAt: serverTimestamp(),
  })
  for (const p of winners) {
    await updateDoc(doc(db, 'players', p.id), {
      wins: (p.wins || 0) + 1, streak: (p.streak || 0) + 1,
    })
  }
  for (const p of losers) {
    await updateDoc(doc(db, 'players', p.id), {
      losses: (p.losses || 0) + 1, streak: 0,
    })
  }
}
