# THE SYSTEM — Cowork Audit Report

**Date:** 2026-06-14
**Base commit:** `dac2135`
**Auditor scope:** Audit, verify, and improve the current app while preserving the premium image-backed UI and the seven-tab structure. No redesign, no new unrelated features.

---

## Summary

The app is in good shape. The earlier Codex passes that locked down navigation and reward gating hold up well: I built a headless DOM harness (jsdom) that loads `the-system.html`, boots it, and exercises real code paths. **29 of 30 behavioural checks passed on the first run.** The single failure was a genuine economy-integrity bug in `resolveImpactPact()`, now fixed and re-verified (30/30).

Navigation is correct and consistent across all seven tabs, no tab triggers a reward or penalty, and the reward functions are properly gated behind real completion/ownership/affordability with double-claim guards.

---

## Files changed

| File | Change |
|---|---|
| `the-system.html` | One-line guard added to `resolveImpactPact()` (≈line 1791) to stop repeated impact-point farming. |
| `docs/AUDIT_REPORT_2026-06-14.md` | This report (new). |

No other source files were modified. None of the previously completed fixes were touched or reverted.

---

## Bugs fixed

### 1. `resolveImpactPact()` granted +80 impact points on every click (economy integrity)

The function added 80 impact points and incremented `pactsResolved` with **no guard**, so it could be triggered repeatedly to farm impact points. The harness confirmed impact climbing `10 → 90 → 170` on three calls.

**Fix:** added an active-pact guard at the top of the function, matching the existing pattern in `completeImpactPackMission()`:

```js
if(!state.impact.pledge?.active) return showNotif("penalty","NO ACTIVE PACT","Activate an accountability pact before resolving it. Impact points are only awarded once per pact.");
```

Because resolving sets `pledge.active = false`, the second call is now a no-op. Re-verified: impact moves once and then stays flat (`single-claim` check passes).

**Reachability note:** this function is wired to the "SIMULATE RESOLVE" button inside the functional-layer control panel, which is hidden in `pixel-mode` (the public app). So this was primarily an admin/debug-surface integrity gap rather than a player-facing exploit — but it is exactly the class of issue the brief asked to eliminate ("no click should grant impact points"), so it's fixed regardless.

---

## What was verified (and passed)

**Tooling**
- `npm run check` — inline-script syntax validation: **OK**.
- `node server.js` — boots on `:8766`; `/api/health`, `/api/summary`, `/api/state` and the static `the-system.html` all serve correctly.
- Custom jsdom harness exercising live functions — **30/30 checks pass** after the fix.

**Bottom navigation (seven tabs)**
- `BOTTOM_TABS` defines exactly seven tabs in order: **Quests, Train, Hub, Nutrition, Shop, Impact, Profile** — consistent with the handoff.
- Every section's bottom hotspots delegate to a single `unifiedBottomHotspots()` source, so there is one nav definition and no drift.
- All seven tabs (plus the `dungeons` alias used by Quests) route correctly, set `currentTab`, and **grant zero XP / gold / impact / guild points** when tapped.
- No stale five-tab layout, no duplicate/second nav bar, no double-bottom-bar remnants found (`renderBottomNav` and all hotspot builders read from the same 7-tab array).

**Reward & state integrity (all gated correctly)**
- Quests reward only on completion; partial progress grants nothing; re-completing grants nothing (no double-reward).
- `buyItem` / `completeCartPurchase` / `buyShadowKey` validate gold and ownership; non-consumables cannot be double-owned.
- `salvageShopItem` refunds only when a true duplicate exists.
- `submitLog` (training) requires at least one logged working set before rewarding.
- `claimWeeklyQuestTier/Bonus`, `claimHubMissionRewards`, `claimPartnerRewards`, `claimBossReward`, `claimDungeon`, `completeImpactPackMission` all check completion **and** carry per-day/per-week double-claim guards.
- Preview / filter / select / navigation actions (impact cause selection, pledge building, screen switches) change no currency.

**Persistence**
- State persists to `localStorage` under namespaced `sl-*` keys and mirrors to the local API (`PUT /api/state`, `POST /api/events`) with a debounced queue. Daily and weekly resets are keyed by date. `data/system-state.json` shows live revisions (rev 149), confirming the backend round-trip works.

**Assets**
- All 82 image paths referenced in code exist in `assets/screens/`. No broken image references.

---

## Remaining gaps (not bugs — documented, not changed)

1. **Cosmetic selections don't persist.** Avatar frame, aura, crest, background, badge, archetype, "favourite recipe", "add to plan", and the impact "First Step Reward equipped" hotspots fire a success toast but **don't write state**. They are honest-looking but non-functional. ~141 of 640 hotspots are informational `showNotif`-only stubs; most are legitimately informational (filters, balance explainers), but the cosmetic ones above arguably should persist a choice. Recommend wiring these to `state.profile.cosmetics` and re-rendering the avatar.

2. **Scanner has no loading / error / low-confidence / retry states.** `barcode-scan`, `photo-scan`, `voice-log`, and `barcode-result` screens exist, but there is no loading spinner state, no failed-scan retry, and no manual-entry fallback screen. (See image prompts below.)

3. **Empty / locked states are mostly missing.** Only `dungeon-d03-void-gate-locked` exists. There are no dedicated empty states for: no friends, no guild, empty inventory/vault, no meals logged, no active impact pact. (See image prompts below.)

4. **Doc inconsistency to resolve.** `CLAUDE_HANDOFF_PROMPTS.md` specifies **seven** tabs (incl. Impact); `SYSTEM_PRODUCT_BLUEPRINT.md` → "Needed Prompt 1" specifies **six** (Impact folded into Profile/routing). The code follows the **seven-tab** handoff. Pick one and align both docs. **Assumption made: seven tabs is correct** (it matches the live code and the handoff, which is the instruction-of-record).

5. **Legacy/unused assets.** ~37 older screen images in `assets/screens/` are no longer referenced (e.g. `hub.png`, `*-v1` style names, `nutrition-overview.jpg`). Harmless, but they could be archived to reduce repo weight.

6. **Pixel-perfect hotspot alignment** was validated *logically* (routing, no false rewards) but not *visually* per-pixel, because the design images can't be rendered to a screenshot in this environment. Recommend a quick manual spot-check in the browser on a real device width (the nav band is positioned at `top: 84.5%`, `height: 8%`, split into 7 equal columns).

---

## Exact image prompts needed for the next missing states

Base style (prepend to each): *Premium mobile app screen for THE SYSTEM, dark navy/black futuristic hunter UI, electric cyan glow, purple accents, gold reward accents, red danger accents only where relevant, rounded premium cards, anime-inspired but original, clean English text only, the in-app screen itself (not a phone mockup), ~590×1280 portrait, bottom nav inside the screen only with the seven tabs in order Quests · Train · Hub · Nutrition · Shop · Impact · Profile, no second outer navigation bar, no duplicated bottom bars.*

**1 — Scanner loading + error/retry pack**
- Barcode scanning **loading** state: live camera frame with a cyan scan-line animation feel, "SCANNING…" label, a confidence/progress indicator. Active tab: Nutrition.
- Scan **failed / retry** state: red-accented "COULDN'T READ THAT" card, a large **Retry** button and a secondary **Enter manually** button. Active tab: Nutrition.
- Photo-meal **low-confidence** state: detected items list each with a confidence % and an "Adjust" control, plus **Confirm** and **Rescan** buttons. Active tab: Nutrition.
- Voice-log **listening** state: waveform/pulse animation, "LISTENING…", and a **Stop** button with a manual fallback. Active tab: Nutrition.

**2 — Empty / locked states pack**
- **No friends yet:** centred illustration, "No allies recruited", primary CTA **Add Hunter**. Active tab: Hub.
- **No guild yet:** "You haven't joined a guild", CTAs **Browse Guilds** / **Create Guild**. Active tab: Hub.
- **Empty inventory / vault:** "Your vault is empty", CTA **Visit Shop**. Active tab: Shop.
- **No meals logged today:** "No meals logged", CTA **Log a meal** with scan/manual options. Active tab: Nutrition.
- **No active impact pact:** "No accountability pact active", CTA **Start a Pact**. Active tab: Impact.

**3 — Cosmetic-applied confirmation (optional, supports gap #1)**
- A subtle "STYLE SAVED" confirmation overlay showing the updated avatar with the newly selected frame/aura/crest, **Done** button. Active tab: Profile.

(For any additional missing screen, use the full template in `CLAUDE_HANDOFF_PROMPTS.md` under "Image Prompt Template For Missing States".)

---

## Risks & assumptions

- **Assumption:** seven-tab structure is canonical (per code + handoff), so I did **not** collapse Impact into Profile per the blueprint's six-tab prompt. Flag if the six-tab direction is actually preferred — that's a larger nav change, not done here.
- **Risk / environment note:** edits to `the-system.html` are on a OneDrive-synced path. After my edit, the Linux build mount briefly served a truncated copy of the file (a cloud-rehydration race). The **authoritative file on disk is complete and correct** — confirmed the closing `</script></body></html>` and the new guard line are present, and a reconstructed authoritative copy passes both `npm run check` and the full harness (30/30). If `npm run check` ever reports "No inline script found," it's this sync lag — wait for OneDrive to finish syncing and re-run; it does not indicate a real corruption.
- The `resolveImpactPact` fix is minimal and pattern-matched to existing guards; no behavioural change for the legitimate first resolve.
- No destructive operations were performed (no deletes, no permission/setting changes, no network writes beyond the app's own local API during the harness run, which used a stubbed `fetch`).

---

## Suggested next steps (ranked by user impact)

1. Wire cosmetic selections to persisted state + avatar re-render (gap #1) — most visible "looks broken" item.
2. Generate and integrate the scanner loading/error/retry screens (gap #2) — completes the most-used real flow (nutrition logging).
3. Generate and integrate empty/locked states (gap #3) — makes a fresh account feel finished.
4. Resolve the 6-vs-7 tab doc inconsistency and archive unused assets.
