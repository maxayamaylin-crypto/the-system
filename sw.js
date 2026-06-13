const CACHE = "system-v4-10-shop-pack";
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
  "./assets/screens/nutrition-n01-overview.jpg",
  "./assets/screens/nutrition-n02-diary.jpg",
  "./assets/screens/nutrition-n03-archive.jpg",
  "./assets/screens/nutrition-n04-recipe-detail.jpg",
  "./assets/screens/nutrition-n05-barcode-scan.jpg",
  "./assets/screens/nutrition-n06-barcode-result.jpg",
  "./assets/screens/nutrition-n07-photo-scan.jpg",
  "./assets/screens/nutrition-n08-voice-log.jpg",
  "./assets/screens/nutrition-n09-confirmation.jpg",
  "./assets/screens/nutrition-n10-progress.jpg",
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
  "./assets/screens/train-t10-session-complete.jpg",
  "./assets/screens/hub-g02-notifications.jpg",
  "./assets/screens/hub-g02-raid-detail.jpg",
  "./assets/screens/hub-g03-messages.jpg",
  "./assets/screens/hub-g03-system-chat.jpg",
  "./assets/screens/hub-g04-quick-actions.jpg",
  "./assets/screens/hub-g05-mission-complete.jpg",
  "./assets/screens/hub-g06-confirmation.jpg",
  "./assets/screens/hub-g06-purchase-confirmation.jpg",
  "./assets/screens/hub-g09-sync-complete.jpg",
  "./assets/screens/hub-h02-friends.jpg",
  "./assets/screens/hub-h03-add-hunter.jpg",
  "./assets/screens/hub-h04-friend-profile.jpg",
  "./assets/screens/hub-h05-leaderboard.jpg",
  "./assets/screens/hub-h06-guild-hall.jpg",
  "./assets/screens/hub-h07-guild-members.jpg",
  "./assets/screens/hub-h08-raid-detail.jpg",
  "./assets/screens/hub-h09-coop-challenge.jpg",
  "./assets/screens/hub-h10-license.jpg",
  "./assets/screens/hub-h11-create-guild.jpg",
  "./assets/screens/quest-q03-detail.jpg",
  "./assets/screens/quest-q04-add-progress.jpg",
  "./assets/screens/quest-q04-advanced-progress.jpg",
  "./assets/screens/quest-q05-weekly-tracker.jpg",
  "./assets/screens/quest-q07-streak-alert.jpg",
  "./assets/screens/dungeon-d01-iron-gate.jpg",
  "./assets/screens/dungeon-d02-shadow-gate.jpg",
  "./assets/screens/dungeon-d03-void-gate-locked.jpg",
  "./assets/screens/dungeon-d04-world-boss.jpg",
  "./assets/screens/dungeon-d05-raid-prep.jpg",
  "./assets/screens/shop-s02-item-detail.jpg",
  "./assets/screens/shop-s03-purchase-confirm.jpg",
  "./assets/screens/shop-s03-item-acquired.jpg",
  "./assets/screens/shop-s04-gear-inventory.jpg",
  "./assets/screens/shop-s05-boosts.jpg",
  "./assets/screens/shop-s06-cosmetics.jpg",
  "./assets/screens/shop-s07-loadout.jpg",
  "./assets/screens/shop-s08-compare.jpg",
  "./assets/screens/shop-s09-cart.jpg",
  "./assets/screens/shop-s10-vault.jpg"
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
