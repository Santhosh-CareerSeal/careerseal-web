// Network-first service worker with safe fallbacks.
// Key rule: respondWith must ALWAYS resolve to a Response, never undefined.
const CACHE = 'grid-v2'

self.addEventListener('install', e => { self.skipWaiting() })

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // drop old caches, then take control
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Only handle same-origin requests. Let the browser handle cross-origin
  // (the API on Render, Supabase storage, Google) natively.
  if (url.origin !== self.location.origin) return

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(async () => {
        const cached = await caches.match(req)
        if (cached) return cached
        // SPA navigation offline → serve the cached app shell so routing still works
        if (req.mode === 'navigate') {
          const shell = (await caches.match('/index.html')) || (await caches.match('/'))
          if (shell) return shell
        }
        // Last resort — a real Response, never undefined
        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
      })
  )
})
