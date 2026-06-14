# THE SYSTEM — Visual Hotspot-Alignment Audit (Claude Code / Opus)

**Date:** 2026-06-14
**Base commit:** `dac2135`
**Scope:** Audit and improve the image-backed app without redesigning it. This pass focuses on the area a DOM-only harness cannot cover: **whether invisible hotspots actually sit over the visible buttons in the art.**

> Companion to `AUDIT_REPORT_2026-06-14.md` (a concurrent Cowork/jsdom audit). That report verified routing + reward gating (30/30) and explicitly left "pixel-perfect hotspot alignment … not validated visually" as gap #6. **This report closes that gap with visual ground truth** and adds two further code fixes.

---

## How this was verified

- `node server.js` confirmed working (`/api/health`, `/api/summary` rev 149+, static serve). Preview/browser served on `:8766`.
- `npm run check` — PASS (before and after my edits).
- **Behavioural harness via `preview_eval` against the live running app** (not jsdom — the real browser DOM):
  - Bottom nav routing on **all 7 tabs + 70 section sub-screens + 11 nutrition views = 88 screens**: every screen renders exactly 7 nav hotspots in the correct order, active container matches, gold/XP unchanged on every switch (no reward leakage).
  - No dead buttons: 48 distinct `onclick` functions across all screens, **all defined**.
  - Reward flows runtime-tested: buy (gold −price, owned +1; re-buy blocked), equip (owned-only), meal log (+kcal/protein), quest complete (reward once, retry 0), impact mission (0 points on activate). All correct.
  - 1,225 screen hotspots scanned: none oversized, none out of bounds.
- **Visual ground truth** (the new part): I overlaid a labelled percentage grid on the actual `.jpg` art (via System.Drawing) and rendered the app with hotspots outlined in a real browser (Edge), so I could measure—not guess—where the nav bar and CTAs physically sit vs. where the hotspots are.

> Note: `preview_screenshot` times out in this environment on the image-heavy pages, so screenshots came from a real Edge window plus gridded crops of the source art.

---

## Headline finding: the 7-tab visual redesign is **incomplete**, so hotspots are misaligned on legacy sub-screens

The app mixes two generations of art:

| Generation | Example | Visible bottom bar | Nav-bar vertical band |
|---|---|---|---|
| **Redesigned (7-tab)** | `new-quests-command.jpg`, `new-shop-main.jpg` | Quests·Train·Hub·Nutrition·Shop·Impact·Profile | ~**86–91%** |
| **Legacy (5-tab)** | `quest-q03-detail.jpg` | Hub·Quests·Train·**Dungeons**·Profile | ~**80–85%** |
| **Legacy (4+add)** | `nutrition-n02-diary.jpg` | Hub·Train·**＋**·Nutrition·Profile | ~**83–87%** |
| **Legacy (5-tab, reordered)** | `shop-s02-item-detail.jpg` | Hub·Train·Quests·Shop·Profile | ~**78–82%** |

The code overlays a **single unified 7-tab hotspot band at `top:84.5%, height:8%` (84.5–92.5%)** on every screen (`unifiedBottomHotspots`). That band aligns well with the *redesigned* main screens (so the seven main tabs look and work correctly — consistent with the other report's routing pass and the earlier smoke test). **But on the ~57 legacy sub-screens the visible bar is a different 5-tab / 4+add layout sitting higher up**, so:

- The user sees a stale 5-tab bar (wrong tabs: shows *Dungeons*, missing *Nutrition/Shop/Impact*; inconsistent order).
- Tapping a *visible* legacy tab can miss the real (lower) hotspot; the hotspots route correctly but don't line up with what's drawn.

A jsdom harness can't catch this because it never renders the images — it correctly reports "routing works," which is true; the defect is purely visual/positional.

**Impact:** Medium-High. The app is still navigable (every sub-screen has working in-screen Back buttons, and the main 7 tabs are correctly aligned), but sub-screens look unfinished and the bottom bar is misleading there.

**Recommended fix (not done here — needs image pipeline + per-screen visual iteration):** regenerate the 57 legacy sub-screens with the same 7-tab bottom bar at the same position as the `new-*` screens (prompts below). Once art is consistent, the existing unified band fits everything. Do **not** just move the shared band — because legacy bars sit at *different* heights, no single band fits both generations; the real fix is consistent art.

---

## Secondary finding: content-hotspot vertical drift on the redesigned main screens

Even on the new art, several content hotspots were calibrated to an older layout and now sit too low. Measured against the grid:

**`new-quests-command.jpg`:**
- Visible **START RAID** button = **83.5–87%**, but the unified nav band starts at **84.5%**, so the lower half of START RAID is under the nav hotspots → tapping its centre fires a nav tab, not Start Raid.
- The `"Start Raid"` content hotspot is coded at `top:89,h:4` (89–93%) — that's over the *nav bar*, not the button. `"World Boss"` (`top:84`) and the daily-quest row hotspots (`top:35/41/47`) are each ~1 row / several-% low relative to the art.

**`new-shop-main.jpg`:**
- "Daily Deals / Loyalty Points / VIP Discount" cards are visible at **80–84%**, but their hotspots are coded at `top:86,h:6` (86–92%) → they land on the nav bar instead of the cards.

**Impact:** Medium. These are real "button doesn't do what it looks like it should" cases on high-traffic screens. **Fix needs the same per-screen visual re-calibration** and is best done together with the art-consistency fix above, with a browser/device check per screen.

---

## Code fixes applied this pass (verified)

All in `the-system.html`; `npm run check` passes; each verified live via `preview_eval`.

### 1. `equipProfileTitle()` — could equip an unearned title (integrity)
The Profile → Title screen's `equipProfileTitle()` force-pushed any title into `unlocks.titles` and activated it with **no unlock check**, so e.g. "Shadow Hunter / Iron Will" (requires a 7-day streak) could be equipped without earning it. The Awakening screen's `setActiveTitle()` already gated this; the two paths were inconsistent.
**Fix:** equip only if the title is already unlocked **or** its `check()` genuinely passes; otherwise show a "TITLE LOCKED" notice. Verified: locked title at streak<7 is blocked; default + genuinely-earned titles still equip.

### 2. `submitLog()` — training toast over-claimed "+200 XP"
The completion toast always said "+200 XP" even when the gym quest was already complete (so 0 XP was actually granted — XP is correctly routed through the quest to avoid duplicates). The over-statement was cosmetic but violated "don't claim a reward that wasn't given."
**Fix:** capture the real XP delta around the quest update and only show the XP line when XP was actually awarded. (Gold/Guild/Impact unchanged.)

> A third change in the working tree — the `resolveImpactPact()` active-pact guard — was made by the **concurrent Cowork audit**, not this pass (see that report). It is present, correct, and I independently confirmed the function is now single-claim.

---

## Confirmed healthy (independent runtime verification)

- **Bottom-nav routing** correct & reward-free on all 88 screens; correct active tab; no double bottom bar (external `#tabs` + `.functional-layer` are `display:none` in pixel-mode).
- **Reward integrity** excellent: every grant site (quests, weekly tiers, training, dungeons, world boss, hub mission, partner push, impact mission/pact, nutrition target, salvage) is gated behind real completion/ownership/affordability with per-day/week double-claim guards. Pure view/select/nav clicks grant nothing.
- **No dead buttons**; **all 82 referenced images exist**; **Escape closes** the notification overlay (`keydown` → `closeNotif`), which also auto-closes and has a Confirm button.
- **Persistence** works (localStorage `sl-*` + debounced `PUT /api/state`; `data/system-state.json` live).

---

## Remaining gaps (visual/feature — not regressions)

1. **Legacy sub-screen art (57 screens)** still shows the old 5-tab/4+add bottom bar → regenerate to the 7-tab layout (top priority for "feels finished").
2. **Content-hotspot re-calibration** on `new-*` main screens (quests, shop measured; recommend checking all `new-*` screens against the art).
3. Items the concurrent report already lists and I concur with: cosmetic selections don't persist; scanner has no loading/error/retry states; empty/locked states mostly missing; 6-vs-7-tab doc inconsistency (7 is canonical); ~37 unused legacy assets could be archived.

---

## Image-generation prompts for the missing/legacy states

**Base style (prepend to each):** *Premium mobile app screen for THE SYSTEM — dark navy/black futuristic hunter UI, electric cyan glow, purple accents, gold reward accents, red danger accents only where relevant, rounded premium cards, anime-inspired but original, clean English text only; the in-app screen itself (not a phone mockup), ~590×1280 portrait; bottom navigation INSIDE the screen with exactly seven tabs in this order — Quests · Train · Hub · Nutrition · Shop · Impact · Profile — positioned as a single bar across the very bottom (icons + labels occupying roughly the bottom 86–92% band, matching `new-quests-command.jpg`); no second outer navigation bar, no duplicated bottom bars, no five-tab layouts, no "Dungeons" tab.*

**Pack A — Re-skin the 57 legacy sub-screens to the 7-tab bar.** Regenerate each of these with identical content but the standard 7-tab bottom bar in the standard position (currently they carry a stale 5-tab / 4+add bar):
- Quests: `quest-q03-detail`, `quest-q04-add-progress`, `quest-q04-advanced-progress`, `quest-q05-weekly-tracker`, `quest-q07-streak-alert`
- Train: `train-t02-split-selector`, `train-t03-upper-lower`, `train-t04-ppl`, `train-t05-arnold`, `train-t06-full-body`, `train-t07-custom-builder`, `train-t08-edit-section`, `train-t09-edit-exercise`
- Nutrition: `nutrition-n01-overview`, `nutrition-n02-diary`, `nutrition-n04-recipe-detail`, `nutrition-n05-barcode-scan`, `nutrition-n06-barcode-result`, `nutrition-n07-photo-scan`, `nutrition-n08-voice-log`, `nutrition-n09-confirmation`, `nutrition-n10-progress`
- Shop: `shop-s02-item-detail`, `shop-s04-gear-inventory`, `shop-s05-boosts`, `shop-s06-cosmetics`, `shop-s07-loadout`, `shop-s08-compare`, `shop-s09-cart`, `shop-s10-vault`
- Hub: `hub-g03-system-chat`, `hub-g06-purchase-confirmation`, `hub-g09-sync-complete`, `hub-h02-friends`, `hub-h03-add-hunter`, `hub-h04-friend-profile`, `hub-h05-leaderboard`, `hub-h06-guild-hall`, `hub-h07-guild-members`, `hub-h08-raid-detail`, `hub-h09-coop-challenge`, `hub-h10-license`, `hub-h11-create-guild`
- Impact: `impact-i02-cause-detail`, `impact-i03-choose-cause`, `impact-i04-pledge-builder`, `impact-i05-pact-confirmation`, `impact-i06-ledger`, `impact-i07-leaderboard`, `impact-i08-rewards`, `impact-i09-missions`, `impact-i10-mission-complete`, `impact-i11-pact-resolved`
- Profile: `profile-p02-edit-avatar`, `profile-p03-edit-license`, `profile-p04-title-badge`, `profile-p08-vault`

**Pack B — Scanner loading/error/retry & empty/locked states:** see the matching prompts in `AUDIT_REPORT_2026-06-14.md` (no need to duplicate).

---

## Risks & assumptions

- **Concurrency:** another audit session edited `the-system.html` in the same working tree during this pass (it added the `resolveImpactPact` guard and wrote `AUDIT_REPORT_2026-06-14.md`). The file currently contains both that fix and my two; `npm run check` passes. If a later write reverts my two edits, re-apply them (they're small and described above).
- I did **not** blindly move the shared nav band or re-calibrate content hotspots, because (a) no single band fits the two art generations and (b) per-screen re-calibration needs reliable visual iteration, which the screenshot tooling here can't provide. Doing it blind would risk breaking the currently-aligned main screens. This is documented for a focused follow-up with the art pipeline.
- Runtime reward tests mutated the save file; it was **backed up and restored** (verified gold 22905 / 4 owned / impact 3250 / totalXp 2465 after restore).
- I replaced a Codex python static server on `:8766` with the canonical `node server.js` (it adds the `/api` persistence the task asked to verify).
- Temp tooling files added: `.claude/launch.json` and `docs/.claude/launch.json` (preview-server config; safe to delete).
