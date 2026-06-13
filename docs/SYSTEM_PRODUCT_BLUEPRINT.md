# THE SYSTEM Product Blueprint

This file is the source of truth for future Codex passes and can be mirrored into Obsidian.

## Core Rule

The screenshot phone is the app. For image-backed screens, the user should interact with buttons inside the phone image via invisible hotspots. Do not add a second visible navigation bar, duplicate control panel, or scroll-down UI under the phone unless it is a non-public debug/admin surface.

## Navigation

- Hub: social home, friends, leaderboard, guild hall, raids, co-op, notifications and messages.
- Quests: daily/weekly objectives, streak protection, dungeon entry points, boss events.
- Train: workout split selection, realistic session logging, section/exercise editing, rewards after a real session.
- Nutrition: nutrition overview, diary, meal archive, recipe details, barcode/photo/voice/manual logging, progress insights.
- Shop: gear, boosts, cosmetics, cart, loadout, inventory/vault.
- Impact: charity cause, pledge, pact confirmation, missions, ledger, rewards, leaderboards.
- Profile: command hub, avatar editing, license editing, titles/badges, personal vault.

## Economy Rules

- XP and gold should only come from completed quests, logged workouts, completed dungeon requirements, valid impact missions, or confirmed purchases/refunds.
- Shop purchases must reduce gold and add an owned item.
- Consumables must be owned before use and should be consumed or marked active when used.
- Salvage should only refund gold for duplicate owned items.
- Preview, filter, select, view, and navigation clicks should not grant XP, gold, gems, guild XP, or impact points.

## Guilds And Social

- Friends are other hunters with profile, challenge, and message actions.
- Guilds are teams that pool guild points from quests, workouts, raids and impact.
- Guild Hall is the guild command centre: members, roles, announcements, shared vault, weekly raid, upgrades and activity.
- Co-op challenges are partnered goals, for example completing 30 workouts together. Rewards should unlock only when milestones are reached.

## Raids And Dungeons

- Dungeons are gated challenges tied to real progress requirements.
- Entering a gate starts or previews the raid; claiming rewards requires requirements to be met.
- World Boss participation should record participation; major rewards require weekly boss completion or contribution thresholds.
- Locked gates should show requirements, not grant rewards.

## Charity Impact

- Impact points represent mission actions and sponsor/pledge value.
- Charity pacts are accountability contracts: user chooses cause, duration, amount, plan type, then reviews and activates.
- Public launch requires verified payment/charity payout rails before live money handling.
- Pledge failure should route to chosen charity; subscription revenue is the business model, not hoping users fail.

## Current Design Patch Rules

- Hide external app nav on image screens; use image bottom-bar hotspots.
- Keep all interactive zones tight to visible buttons, tab labels, cards that are clearly tappable, or list rows that behave as tappable rows.
- Avoid huge generic hotspots over decorative art unless the art is clearly a card/button.
- Every “Buy”, “Confirm”, “Claim”, “Complete”, “Use”, “Salvage”, or “Equip” action must validate state before applying rewards or inventory changes.

## Image Gaps To Request From ChatGPT

Use this base style in every prompt:

> Create a premium mobile app screen for THE SYSTEM, dark navy/black futuristic hunter UI, electric cyan glow, purple accent highlights, gold reward accents, red danger accents only where relevant, rounded premium cards, mobile-first phone screenshot, high-end anime-inspired but original, no copyrighted characters or logos, no second outer navigation bar, bottom nav inside the phone only, exact same visual language as the existing THE SYSTEM concept screens.

### Needed Prompt 1: Unified Bottom Nav Variants

Create clean replacements for the main screens so every bottom nav uses the same six tabs in this exact order: Quests, Train, Hub, Nutrition, Shop, Profile. Active tab should glow cyan. Keep the existing screen content style identical. Produce variants for Hub, Quests, Train, Nutrition, Shop, Impact/Profile routing if needed.

### Needed Prompt 2: Dungeon Main Screen With Nutrition Nav

Create a THE SYSTEM Dungeons/Gates main screen with Iron Gate, Shadow Gate, Void Gate locked, and World Boss. Include bottom nav: Quests, Train, Hub, Nutrition, Shop, Profile. The screen should make each gate clearly tappable and include no duplicate external bar.

### Needed Prompt 3: Empty/Locked States

Create premium empty states for: no friends yet, no guild yet, no owned inventory, no meals logged today, no active impact pact, locked dungeon gate. Each should include a clear CTA button inside the phone screen and match the exact THE SYSTEM style.

### Needed Prompt 4: Real Confirmation Modals

Create modal overlays for: purchase confirmation, reward claim confirmation, delete/discard changes, activate charity pact, complete workout session. Each modal should have clear Confirm and Cancel buttons positioned inside the phone screen.

### Needed Prompt 5: Scan Loading And Error States

Create nutrition scanner loading and retry screens for barcode, photo meal scan, and voice log. Include confidence/loading indicators, retry button, manual entry fallback, and bottom nav inside the phone only.

### Needed Prompt 6: Account/Backend States

Create premium screens for sign in, sync complete, sync failed retry, export backup success, import backup confirmation, subscription plan selection, and verified charity payout status. Keep them original and consistent.

## Codex Implementation Notes

- Use user-supplied images exactly as assets.
- Do not generate approximate visuals when exact reference screens are required.
- If a new screen is missing, request a ChatGPT image prompt from this file and wait for the image batch.
- Keep changes scoped and test with browser clicks plus `npm run check`.
