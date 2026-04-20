// Service Worker for PWA + Push Notifications
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});

// Fetch handler for PWA installability
self.addEventListener('fetch', (event) => {
    // Pass through network requests
});

// 📲 Push Notification 수신
self.addEventListener('push', (event) => {
    let data = { title: '오른스푼', body: '새로운 콘텐츠가 올라왔습니다!', url: '/' };

    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        console.error('Push data parse error:', e);
    }

    const options = {
        body: data.body,
        icon: '/logo-character.jpg',
        badge: '/drumtong119-logo.png',
        vibrate: [200, 100, 200],
        tag: 'rightspoon-new-article',
        renotify: true,
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: '📖 읽어보기' },
            { action: 'close', title: '닫기' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 🔔 알림 클릭 시 해당 페이지로 이동
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // 이미 열린 탭이 있으면 포커스
            for (const client of clients) {
                if (client.url.includes('rightspoon') && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // 없으면 새 탭 열기
            return self.clients.openWindow(url);
        })
    );
});
