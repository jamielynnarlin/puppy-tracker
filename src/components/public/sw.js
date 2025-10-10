// PuppyTrainer Pro Service Worker
// Provides offline functionality and caching for the PWA

const CACHE_NAME = 'puppytrainer-pro-v1';
const STATIC_CACHE = 'puppytrainer-static-v1';
const DYNAMIC_CACHE = 'puppytrainer-dynamic-v1';

// Files to cache immediately when service worker installs
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets that should be cached immediately
];

// Cache strategies for different types of requests
const CACHE_STRATEGIES = {
  // Cache first for static assets (CSS, JS, images)
  static: ['css', 'js', 'png', 'jpg', 'jpeg', 'svg', 'ico', 'woff', 'woff2'],
  // Network first for API calls and dynamic data
  dynamic: ['api', 'json'],
  // Stale while revalidate for HTML pages
  pages: ['html', 'htm']
};

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handling logic
async function handleRequest(request) {
  const url = new URL(request.url);
  const extension = getFileExtension(url.pathname);
  
  try {
    // Strategy 1: Cache First (for static assets)
    if (CACHE_STRATEGIES.static.includes(extension)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First (for API calls and dynamic data)
    if (CACHE_STRATEGIES.dynamic.includes(extension) || url.pathname.includes('api')) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate (for HTML pages)
    if (CACHE_STRATEGIES.pages.includes(extension) || url.pathname === '/') {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Network First
    return await networkFirst(request);
    
  } catch (error) {
    console.error('❌ Request failed:', error);
    return await getCachedResponse(request) || createOfflinePage();
  }
}

// Cache First strategy - good for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const response = await fetch(request);
  await cacheResponse(request, response.clone(), STATIC_CACHE);
  return response;
}

// Network First strategy - good for dynamic data
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(request, response.clone(), DYNAMIC_CACHE);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📱 Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate strategy - good for pages
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      cacheResponse(request, response.clone(), DYNAMIC_CACHE);
      return response;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Helper function to cache responses
async function cacheResponse(request, response, cacheName) {
  if (response.status === 200) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  }
}

// Helper function to get cached response
async function getCachedResponse(request) {
  return await caches.match(request);
}

// Helper function to get file extension
function getFileExtension(pathname) {
  const lastDot = pathname.lastIndexOf('.');
  return lastDot > 0 ? pathname.slice(lastDot + 1).toLowerCase() : '';
}

// Create offline fallback page
function createOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PuppyTrainer Pro - Offline</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 2rem; 
          background: #1f2937; 
          color: white; 
        }
        .offline-container { 
          max-width: 400px; 
          margin: 0 auto; 
          padding: 2rem; 
        }
        .offline-icon { 
          font-size: 3rem; 
          margin-bottom: 1rem; 
        }
        .retry-btn { 
          background: #3b82f6; 
          color: white; 
          border: none; 
          padding: 0.75rem 1.5rem; 
          border-radius: 0.5rem; 
          cursor: pointer; 
          margin-top: 1rem; 
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🐕</div>
        <h1>PuppyTrainer Pro</h1>
        <h2>You're offline</h2>
        <p>It looks like you're not connected to the internet. Some features may not be available until you're back online.</p>
        <button class="retry-btn" onclick="window.location.reload()">Retry</button>
        <p style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.7;">
          Your data is safely stored locally and will sync when you're back online.
        </p>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync for when connectivity is restored
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Here you could sync any offline data with the server
      // For now, just log that sync is available
      console.log('📡 Connectivity restored - ready to sync data')
    );
  }
});

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New training reminder!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('PuppyTrainer Pro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('🐕 PuppyTrainer Pro Service Worker loaded successfully!');