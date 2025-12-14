// Tên cache
const CACHE_NAME = 'expense-manager-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Cài đặt Service Worker
self.addEventListener('install', event => {
  console.log('🛠 Service Worker đang cài đặt...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Đang cache tài nguyên cần thiết...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Cache thành công!');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Lỗi khi cache:', error);
      })
  );
});

// Kích hoạt Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker đang kích hoạt...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑 Xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker đã sẵn sàng!');
      return self.clients.claim();
    })
  );
});

// Xử lý các request
self.addEventListener('fetch', event => {
  // Bỏ qua các request không phải HTTP
  if (!event.request.url.startsWith('http')) return;
  
  // Chiến lược: Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Trả về từ cache nếu có
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Không có trong cache, fetch từ network
        return fetch(event.request.clone())
          .then(networkResponse => {
            // Kiểm tra response hợp lệ
            if (!networkResponse || networkResponse.status !== 200 || 
                networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone response để cache
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          })
          .catch(error => {
            console.log('🌐 Không thể fetch từ network:', error);
            
            // Nếu là request HTML, trả về trang chính từ cache
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Có thể trả về fallback cho các loại file khác
            if (event.request.url.includes('.css')) {
              return new Response('/* Fallback CSS */', {
                headers: { 'Content-Type': 'text/css' }
              });
            }
            
            if (event.request.url.includes('.js')) {
              return new Response('// Fallback JS', {
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
            
            // Trả về null cho các loại khác
            return new Response('', {
              status: 408,
              statusText: 'Offline'
            });
          });
      })
  );
});

// Xử lý background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-expenses') {
    console.log('🔄 Đang đồng bộ dữ liệu...');
    event.waitUntil(syncExpenses());
  }
});

// Xử lý push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Có thông báo mới từ Quản Lý Chi Tiêu',
    icon: './icon-192x192.png',
    badge: './icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Mở ứng dụng'
      },
      {
        action: 'close',
        title: 'Đóng'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Quản Lý Chi Tiêu', options)
  );
});

// Xử lý click notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('./index.html')
    );
  }
});

// Hàm đồng bộ dữ liệu
async function syncExpenses() {
  try {
    // Lấy dữ liệu chờ từ IndexedDB hoặc localStorage
    const pendingData = await getPendingData();
    
    if (pendingData && pendingData.length > 0) {
      // Giả lập gửi dữ liệu lên server
      console.log(`🔄 Đang đồng bộ ${pendingData.length} khoản chi tiêu...`);

      
      // Sau khi đồng bộ thành công, xóa dữ liệu chờ
      await clearPendingData();
      console.log('✅ Đồng bộ thành công!');
    }
  } catch (error) {
    console.error('❌ Lỗi đồng bộ:', error);
  }
}

// Các hàm hỗ trợ
async function getPendingData() {
  // Trong thực tế, bạn sẽ lấy từ IndexedDB
  return [];
}

async function clearPendingData() {
  // Trong thực tế, bạn sẽ xóa từ IndexedDB
}

// Periodic sync (nếu trình duyệt hỗ trợ)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-expenses') {
      event.waitUntil(updateExpenses());
    }
  });
}

async function updateExpenses() {
  console.log('🔄 Cập nhật dữ liệu định kỳ...');
  // Cập nhật dữ liệu từ server nếu có
}