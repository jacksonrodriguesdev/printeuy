// App instalável DESLIGADO (APP_ATIVO = false em src/lib/app-pwa.ts).
// Este service worker só existe para se remover dos aparelhos que instalaram o app antes:
// assume no lugar do antigo, apaga os caches, cancela o próprio registro e recarrega as abas.
// O worker completo (cache, offline, notificações) está em public/sw-app-desligado.js.txt.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) await caches.delete(k);
      await self.registration.unregister();
      for (const c of await self.clients.matchAll({ type: "window" })) c.navigate(c.url);
    })(),
  );
});
