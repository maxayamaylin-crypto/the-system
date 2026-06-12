const CACHE = "system-v4-4-train-profile";
const FILES = [
  "./",
  "./the-system.html",
  "./manifest.json",
  "./assets/screens/hub.png",
  "./assets/screens/quests.png",
  "./assets/screens/shop.png",
  "./assets/screens/impact.png",
  "./assets/screens/nutrition-overview.jpg",
  "./assets/screens/nutrition-archive.jpg",
  "./assets/screens/nutrition-scan.jpg",
  "./assets/screens/nutrition-diary.jpg",
  "./assets/screens/nutrition-progress.jpg",
  "./assets/screens/training-workout.jpg",
  "./assets/screens/profile-command.jpg"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return response;
  }).catch(() => caches.match(e.request)));
});
