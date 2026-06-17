const CACHE = 'gifted-v1'

const PRECACHE_URLS = ['/', '/offline/']

const RUNTIME_CACHE = [
  {
    pattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
    name: 'cloudinary',
    maxEntries: 60,
    maxAge: 30 * 24 * 60 * 60,
  },
  {
    pattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
    name: 'fonts',
    maxEntries: 30,
    maxAge: 30 * 24 * 60 * 60,
  },
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  for (const rule of RUNTIME_CACHE) {
    if (rule.pattern.test(request.url)) {
      event.respondWith(cacheFirst(request, rule.name, rule.maxAge))
      return
    }
  }

  if (url.origin === location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/sw.js'
  )) {
    event.respondWith(cacheFirst(request, CACHE))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  }
})

async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName || CACHE)
  const cached = await cache.match(request)
  if (cached) {
    if (maxAge) {
      const date = new Date(cached.headers.get('date') || 0)
      if (Date.now() - date.getTime() > maxAge * 1000) {
        cache.delete(request)
        return fetchAndCache(request, cache)
      }
    }
    return cached
  }
  return fetchAndCache(request, cache)
}

async function networkFirst(request) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(request)
    return cached || new Response('Offline', { status: 503 })
  }
}

async function fetchAndCache(request, cache) {
  try {
    const res = await fetch(request)
    if (res.ok) cache.put(request, res.clone())
    return res
  } catch {
    return await caches.match(request) || new Response('', { status: 408 })
  }
}
