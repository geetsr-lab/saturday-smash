// Generate unique player ID like SAU827
export function generatePlayerId(name) {
  const prefix = name.trim().substring(0, 3).toUpperCase()
  const suffix = Math.floor(100 + Math.random() * 900)
  return `${prefix}${suffix}`
}
