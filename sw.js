const CACHE = "system-v4-5-train-pack";
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
  "./assets/screens/profile-command.jpg",
  "./assets/screens/train-t01-main.jpg",
  "./assets/screens/train-t02-split-selector.jpg",
  "./assets/screens/train-t03-upper-lower.jpg",
  "./assets/screens/train-t04-ppl.jpg",
  "./assets/screens/train-t05-arnold.jpg",
  "./assets/screens/train-t06-full-body.jpg",
  "./assets/screens/train-t07-custom-builder.jpg",
  "./assets/screens/train-t08-edit-section.jpg",
  "./assets/screens/train-t09-edit-exercise.jpg",
  "./assets/screens/train-t10-session-complete.jpg"
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
