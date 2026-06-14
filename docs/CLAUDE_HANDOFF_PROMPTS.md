# THE SYSTEM - Claude Cowork / Claude Code Handoff

## Files To Upload Or Attach

Upload these at the start of the Claude session and tell Claude to wait until all files are available before acting:

- Repo zip: `C:\Users\maxay\Dropbox\PC\Downloads\the-system-repo-for-claude-code.zip`
- Design archive zip: `C:\Users\maxay\Dropbox\PC\Downloads\the_system_image_archive_all_pdfs.zip`
- Safety backup zip: `C:\Users\maxay\Dropbox\PC\Downloads\the-system-backups\the-system-safe-backup-20260614-150858.zip`

If Claude Code can access a local folder directly, point it at:

- Repo folder: `C:\Users\maxay\the-system`
- Main app: `C:\Users\maxay\the-system\the-system.html`
- Local server: `C:\Users\maxay\the-system\server.js`
- App URL after server starts: `http://localhost:8766/the-system.html`

## Current App State

THE SYSTEM is a mobile-first fitness, nutrition, progression, guild, shop, dungeon, and charity-impact web app. The current build is mostly a single-file app backed by high-fidelity design images. Interactivity is handled with invisible hotspot buttons layered over the design images, plus real JavaScript state for XP, gold, quest progress, nutrition logs, inventory, workouts, guild actions, and impact actions.

The visual style must match the uploaded design archive:

- Dark black/navy UI
- Electric cyan glow
- Purple accents
- Gold rewards and currency
- Red danger/boss warnings
- Premium anime-game inspired progression system
- Seven bottom tabs: `Quests`, `Train`, `Hub`, `Nutrition`, `Shop`, `Impact`, `Profile`

Important: the app must feel like a real app, not just images. Every clickable element should either do a meaningful action, navigate to a sensible state, open a modal, update state, or be deliberately non-clickable.

## Recent Fixes Already Completed By Codex

Base commit before the Claude/Cowork audit pass: `dac2135`

Already fixed:

- Bottom nav hotspots now sit over the visible tab icons.
- The backing screen images no longer steal pointer events.
- Bottom nav responds on pointerdown and click, with duplicate-tap protection.
- Browser smoke test confirmed Nutrition and Shop tabs switch correctly with no penalty popup.
- Workout logging no longer grants duplicate/random extra XP.
- Hub mission rewards are now gated behind actual completion.
- Escape closes notifications.

Do not undo these fixes.

## Prompt For Claude Cowork

You are joining THE SYSTEM as a senior product-engineering coworker. Wait until you have both uploaded files before acting:

1. `the-system-repo-for-claude-code.zip`
2. `the_system_image_archive_all_pdfs.zip`

Your job is not to redesign the app from scratch. Your job is to audit, improve, and document the current app while preserving its exact premium visual direction.

Core rules:

- Treat the uploaded design archive as the visual source of truth.
- Preserve the seven-tab app structure: Quests, Train, Hub, Nutrition, Shop, Impact, Profile.
- Do not create unrelated new features.
- Do not claim a button works unless you verified it in the app or by reading the code path.
- Do not grant XP, gold, guild XP, items, impact points, or streak progress from random clicks.
- State changes must be tied to real user actions: completing quests, logging meals, finishing workouts, purchasing items, joining raids, choosing causes, or claiming verified rewards.
- If a feature is only visual and not functional, mark it clearly as a gap.
- If an image is missing for a required state, write an exact image-generation prompt instead of approximating the UI in code.

Audit goals:

1. Verify the bottom nav works on every major screen and never triggers unrelated penalty/notice popups.
2. Verify every hotspot is placed directly over its visible button or card.
3. Find any double-bottom-bar issues, duplicate navs, stale five-tab layouts, or mismatched icons.
4. Identify actions that falsely reward the player.
5. Identify actions that should update state but currently do nothing.
6. Identify missing screens/modals needed for complete interaction flows.
7. Check whether app state persists correctly in localStorage.
8. Check whether the app can be served locally with `node server.js`.
9. Produce a clear implementation plan, ranked by user impact.

Implementation scope:

- Fix bugs you can verify safely.
- Improve hotspot placement and routing.
- Improve modal open/close behavior.
- Improve state integrity for rewards, purchases, quests, workouts, nutrition, guilds, raids, and impact.
- Add small missing state handlers where the design already exists.
- Avoid large rewrites unless absolutely necessary.

After changes, produce a report with:

- Files changed
- Bugs fixed
- Features improved
- Tests/checks run
- Remaining gaps
- Exact image prompts needed for the next missing states
- Any risks or assumptions

## Prompt For Claude Code / Ultracode

You are working inside the THE SYSTEM repo. Use the uploaded design archive as a visual reference and the repo as the source of truth. Work like a careful senior engineer.

Before editing:

1. Inspect the file tree.
2. Open `package.json`, `server.js`, and `the-system.html`.
3. Run the existing check command if available.
4. Identify current tab/navigation architecture, hotspot system, state persistence, and reward functions.

Primary objective:

Make the current app more functional and professional without breaking the premium image-backed UI.

Highest-priority tasks:

1. Bottom navigation integrity
   - Confirm all seven bottom tabs route correctly.
   - Confirm no tab click triggers penalty, reward, or unrelated modal.
   - Confirm navigation works from main screens, detail screens, modals, and sub-screens where the nav is visible.

2. Hotspot accuracy
   - Hotspots must sit directly on visible buttons/cards.
   - If a visible element is not meant to be clickable, do not add a hotspot.
   - If a hotspot exists but the visible UI does not show a button, remove or relocate it.

3. Reward integrity
   - Quest progress only rewards when progress reaches completion.
   - Purchases decrease gold.
   - Equipped items affect loadout/power only when owned.
   - Food logging changes nutrition totals.
   - Workout logging changes workout/session stats.
   - Impact points come from impact actions, missions, or relevant completions.
   - No random click should grant XP, gold, gems, guild XP, impact points, items, or streak progress.

4. Core flows to verify and improve
   - Quests: view detail, add progress, complete, claim rewards.
   - Train: change split, edit workout/exercise, log session, completion screen.
   - Hub: notifications, messages, friends, add hunter, leaderboard, guild hall, raid, co-op challenge.
   - Nutrition: overview, diary, recipe archive/detail, barcode/photo/voice/manual log, confirmation, progress.
   - Shop/Vault: item detail, purchase confirmation, item acquired, inventory, loadout, equip comparison.
   - Impact: cause detail, choose cause, pledge flow, pact confirmation, impact ledger, leaderboard, rewards, mission complete/fail states.
   - Profile: edit avatar, hunter command, quest/train/nutrition/impact/vault/shop shortcuts, edit license, title/badge, settings/export.

5. Visual consistency checks
   - Use only the established icons/symbol meanings from the design archive.
   - Remove or flag symbols that do not match our standard set.
   - Remove non-English or garbled text if present.
   - Do not replace high-quality design images with lower-quality approximations.

Testing expectations:

- Run the project check command.
- Run the local server if possible.
- Use browser/manual verification for at least the seven bottom tabs and several major action flows.
- Report any flows you could not verify.

Critical instruction:

Do not say "done" unless the app actually works. If a feature is only visually represented, say "visual only" and list what backend/state logic is missing.

## Image Prompt Template For Missing States

When a missing state needs a new design image, use this template and fill it precisely:

Create a high-fidelity mobile app screen for THE SYSTEM. Use the exact same visual style as the provided reference images in the uploaded design archive: dark black/navy interface, electric cyan glow, purple accents, gold reward highlights, red danger highlights, premium futuristic mobile-game UI, sharp rounded cards, anime-inspired hunter progression energy, clean English text only, and the established seven-tab bottom navigation: Quests, Train, Hub, Nutrition, Shop, Impact, Profile.

Screen dimensions should match a phone app viewport, approximately 590x1280 or the same aspect ratio as the existing generated screens. This should be the in-app screen itself, not a separate phone mockup unless specifically requested.

Create this exact screen:

- Section/tab:
- Triggered by:
- Purpose:
- Main title:
- Header stats:
- Primary cards:
- Buttons:
- Modal/overlay behavior if any:
- Rewards or state changes shown:
- Bottom nav active tab:
- Required standard icons:
- Avoid:
  - non-English text
  - random new symbols
  - duplicated bottom bars
  - unreadable tiny text
  - different art direction
  - changing the established tab order

The result must look like it belongs to the existing THE SYSTEM design archive, not a new redesign.
