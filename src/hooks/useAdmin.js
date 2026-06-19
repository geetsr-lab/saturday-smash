// src/hooks/useAdmin.js
import { useState, useEffect } from 'react'

const ADMIN_PIN    = import.meta.env.VITE_ADMIN_PIN || '1234'
const STORAGE_KEY  = 'ss_admin_unlocked'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  })

  const unlock = (pin) => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setIsAdmin(false)
  }

  return { isAdmin, unlock, lock }
}
