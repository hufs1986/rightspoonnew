// Basic minimal Service Worker for PWA installability requirements
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
});

// A simple fetch handler to pass the Chrome PWA checks
self.addEventListener('fetch', (event) => {
    // For now we just pass through network requests.
    // In advanced setups we could Cache everything for offline reading.
});
