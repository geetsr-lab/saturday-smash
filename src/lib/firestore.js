// src/lib/firestore.js
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Players ───────────────────────────────────────────────────────────────

export function subscribeToPlayers(callback) {
  const q = query(collection(db, 'players'), orderBy('wins', 'desc'))
  return onSnapshot(q, (snap) => {
    const players = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(players)
  })
}

export async function addPlayer(name) {
  await addDoc(collection(db, 'players'), {
    name: name.trim(),
    wins: 0,
    losses: 0,
    streak: 0,
    createdAt: serverTimestamp(),
  })
}

// ─── Matches ───────────────────────────────────────────────────────────────

export function subscribeToMatches(callback) {
  const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const matches = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(matches)
  })
}

export async function recordMatch(players, playerAId, playerBId, winnerId) {
  const loserId = winnerId === playerAId ? playerBId : playerAId

  const winner = players.find((p) => p.id === winnerId)
  const loser  = players.find((p) => p.id === loserId)

  // Save match
  await addDoc(collection(db, 'matches'), {
    playerAId,
    playerBId,
    playerAName: players.find((p) => p.id === playerAId)?.name,
    playerBName: players.find((p) => p.id === playerBId)?.name,
    winnerId,
    winnerName: winner?.name,
    createdAt: serverTimestamp(),
  })

  // Update winner stats
  await updateDoc(doc(db, 'players', winnerId), {
    wins:   (winner?.wins   || 0) + 1,
    streak: (winner?.streak || 0) + 1,
  })

  // Update loser stats (streak resets)
  await updateDoc(doc(db, 'players', loserId), {
    losses: (loser?.losses || 0) + 1,
    streak: 0,
  })
}
