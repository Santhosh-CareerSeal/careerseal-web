import axios from 'axios'

// Lightweight GET cache to make page-to-page navigation feel instant.
// Cache-first within a short TTL, then refetch. Shared across pages, so data
// fetched on one page (e.g. /profile/details) loads instantly on the next.
const cache = new Map() // url -> { data, ts }
const TTL = 30_000 // 30s — long enough to make navigation instant, short enough to stay fresh

// Drop-in replacement for axios.get that serves a recent cached copy instantly.
// Returns the same shape axios does ({ data }), so callers using res.data are unchanged.
export async function cget(url, config) {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.ts < TTL) {
    // Serve cached now, and quietly refresh in the background so the next hit is fresh.
    axios.get(url, config).then(res => cache.set(url, { data: res.data, ts: Date.now() })).catch(() => {})
    return { data: hit.data, cached: true }
  }
  const res = await axios.get(url, config)
  cache.set(url, { data: res.data, ts: Date.now() })
  return res
}

// Clear cached entries whose URL contains any of the given substrings.
// Call after a mutation so the next load reflects the change immediately.
export function invalidate(...patterns) {
  for (const key of cache.keys()) {
    if (patterns.some(p => key.includes(p))) cache.delete(key)
  }
}

// Wipe everything (e.g. on logout).
export function clearCache() { cache.clear() }
