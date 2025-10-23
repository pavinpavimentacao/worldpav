// Service Worker para notificações push
// WorldPav PWA

const CACHE_NAME = 'worldpav-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache aberto');
        // Tentar adicionar URLs ao cache, mas não falhar se algum não existir
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.log('Não foi possível cachear:', url))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  // Ignorar requisições que não são GET ou que são para APIs externas
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retornar do cache ou buscar da rede
        return response || fetch(event.request).catch(() => {
          // Se falhar, não retornar nada (evita erros no console)
          console.log('Falha ao buscar:', event.request.url);
        });
      })
  );
});

// Gerenciar notificações push
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push recebido', event);
  
  let data = {
    title: 'WorldRental',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'worldrental-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-72x72.png'
      }
    ]
  };

  // Se há dados no push, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  console.log('Service Worker: Exibindo notificação', data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      actions: data.actions,
      data: data.data || {}
    })
  );
});

// Gerenciar cliques em notificações
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notificação clicada', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir o app ou focar na janela existente
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Se há uma janela aberta, focar nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não há janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Gerenciar notificações fechadas
self.addEventListener('notificationclose', function(event) {
  console.log('Service Worker: Notificação fechada', event);
});

// Background sync para notificações offline
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizar dados offline quando voltar online
      syncOfflineData()
    );
  }
});

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    // Aqui você pode implementar sincronização de dados offline
    console.log('Service Worker: Sincronizando dados offline');
  } catch (error) {
    console.error('Service Worker: Erro na sincronização', error);
  }
}

// Gerenciar mensagens do app
self.addEventListener('message', function(event) {
  console.log('Service Worker: Mensagem recebida', event);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Carregado com sucesso!');