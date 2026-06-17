# Feed The Boys — Dev Log

---

## Session: June 17 2026

### What was built

Started from an implementation prompt (`feed-the-boys-prompt.md`) and built a complete Electron desktop widget from scratch. The widget sits in the bottom-right corner of the screen, has no title bar (frameless), floats above all other windows, and tracks how long ago the cats were fed. It escalates through six personality states — from mildly passive-aggressive to full existential crisis — the longer feeding is overdue. By the end of the session the app was running live via `npm run dev`, with all data persisting across restarts, a settings panel for editing cat names and schedules, a feeding history modal, and OS notifications wired up. Two bugs from the original session were also fixed: the settings panel Save button was hidden off-screen, and a minimize button was added.

---

### Key decisions

- **electron-store@7 instead of @8** — Version 8 switched to ESM-only (a JavaScript module format that doesn't work in Electron's main process without extra config). Version 7 is the last one that works out of the box as CommonJS (the default Node.js module format Electron expects).

- **vite-plugin-electron/simple over electron-forge** — The prompt specified Vite as the build tool. `vite-plugin-electron` plugs directly into the existing Vite setup with minimal config. electron-forge is a full scaffold that would have replaced the Vite setup entirely.

- **Tailwind CSS v3 instead of v4** — Running `npm install tailwindcss` grabbed v4 by default, which has a completely different setup (no `tailwind.config.js`, no `init` command, CSS-only config). The prompt specified v3. Had to explicitly pin: `npm install tailwindcss@3`.

- **Removed `"type": "module"` from package.json** — The Vite scaffold adds this field, which tells Node.js to treat every `.js` file as ESM. The compiled Electron main process (`dist-electron/main.js`) became ESM, but electron-store v7 uses CommonJS-only globals (`__filename`). Removing the field makes `.js` files CJS by default, which is what Electron needs. (Two config files — `tailwind.config.js` and `postcss.config.js` — had to be converted from `export default` to `module.exports =` as a result.)

- **Notifications dispatched inside `useHungerTick` hook** — The original prompt had a gap: it said to detect state transitions in `useHungerTick` but the hook code it showed didn't actually fire notifications. The hook now holds a `prevStateRef` and fires the OS notification internally when state crosses the `fed → hungry` threshold.

- **Settings panel uses fixed height + scrollable inner section** — The window is locked at 280px by the `BrowserWindow` config. If the settings content overflows (more cats, more schedule slots), the Save button would disappear off-screen. Fix: `h-[280px]` on the container, `overflow-y-auto flex-1` on the content section, and the Save/Cancel row is `shrink-0` so it always stays pinned at the bottom.

---

### Problems hit + how they were fixed

- **[Problem]** `npm install tailwindcss` installed v4, and `npx tailwindcss init -p` failed with "could not determine executable to run"
  **[Cause]** Tailwind v4 dropped the `tailwindcss` CLI binary entirely — configuration moved to CSS files only
  **[Fix]** Pinned to v3: `npm install tailwindcss@3 postcss autoprefixer`, then ran `npx tailwindcss init -p` successfully

- **[Problem]** Electron binary wasn't on disk after `npm install`
  **[Cause]** Electron's post-install script downloads a platform binary (~100MB). The download was deferred or didn't run during the install step (common on slow connections or first-time setups)
  **[Fix]** Ran `node node_modules/electron/install.js` manually to trigger the download. Took ~30s in the background

- **[Problem]** App crashed on launch: `ReferenceError: __filename is not defined in ES module scope`
  **[Cause]** `package.json` had `"type": "module"`, which makes Node.js treat every `.js` file as ESM. `dist-electron/main.js` became ESM, but electron-store v7 uses `__filename` — a CommonJS-only global that doesn't exist in ESM
  **[Fix attempt 1]** Added `rollupOptions.output.format: 'cjs'` to `vite.config.ts`. Didn't work — Vite 8 uses Rolldown (not Rollup) as its bundler, so `rollupOptions` was silently ignored
  **[Fix attempt 2 — worked]** Removed `"type": "module"` from `package.json`. Updated `tailwind.config.js` and `postcss.config.js` to use `module.exports =` instead of `export default`. This makes all `.js` output CJS by default, which is what Electron expects

- **[Problem]** Settings panel Save button was cut off — couldn't save schedule changes
  **[Cause]** The settings panel used `min-h-[280px]` and `flex-col gap-3`, so content grew past the 280px window height and pushed the Save/Cancel row off the bottom of the screen
  **[Fix]** Changed to `h-[280px]` (fixed height), made the inner content section `overflow-y-auto flex-1 min-h-0` so it scrolls, and added `shrink-0` to the Save/Cancel row so it never gets squeezed out

- **[Problem]** No minimize button on the widget
  **[Cause]** The window is frameless — Electron removes the native title bar, so there are no default window controls (close, minimize, zoom)
  **[Fix]** Added a `window:minimize` IPC channel: registered in `main.ts` (`ipcMain.handle('window:minimize', () => win.minimize())`), exposed in `preload.ts` (`minimize: () => ipcRenderer.invoke('window:minimize')`), declared in `types.ts`, and wired to a `−` button in the Widget bottom bar

---

### Repetitive patterns to remember

- **Every Electron + Vite project needs the same bootstrap**: scaffold with Vite → install electron + vite-plugin-electron → remove `"type": "module"` → convert config files to CJS → add `"main": "dist-electron/main.js"` to package.json. Do this before writing any app code.

- **electron-store version check**: Always pin `electron-store@7` for CJS projects. Running `npm install electron-store` without a version tag will grab v8+ (ESM-only) and break the main process.

- **Tailwind version check**: `npm install tailwindcss` installs v4. If the project needs v3 (for `tailwind.config.js` / `@apply` / the standard setup), always specify `tailwindcss@3`.

- **The Electron binary download is separate from `npm install`**: The `electron` package ships a post-install script that downloads a platform-specific binary. It sometimes doesn't run automatically. If `npm run dev` launches but Electron never opens, run `node node_modules/electron/install.js`.

- **`npm run dev` must be run from the project directory**: Running it from the parent directory (`Portfolio/`) fails with "Could not read package.json". Always `cd feed-the-boys` first, or use an absolute path with `cd /path/to/project && npm run dev`.

- **Frameless windows need drag regions via CSS**: Without a title bar, the window can't be moved. Add `style={{ WebkitAppRegion: 'drag' }}` to the card background, then `style={{ WebkitAppRegion: 'no-drag' }}` to every button and interactive element inside it.

---

### Permission prompts this session

| What was asked | Why | Outcome |
|---|---|---|
| `git init` in feed-the-boys/ | Set up version control | Approved — confirmed project-level, not Portfolio root |
| `npm create vite@latest` | Scaffold the project | Approved |
| `npm install electron electron-store@7 ...` | Install runtime dependencies | Approved |
| `npm install -D electron-builder @types/node` | Install dev dependencies | Approved |
| `node modules/electron/install.js` | Download Electron binary | Approved |
| `request_access` for Finder/screenshot | Verify widget launched visually | Timed out (300s) — verified via `pgrep Electron` instead |
| Multiple `npm run dev` attempts | Test each fix iteration | Approved each time |

---

### Open questions / next session

- **Tray icon**: Currently, minimizing sends the widget to the Dock. A proper menu-bar tray icon would let the user bring it back without going to the Dock — more appropriate for an always-on utility.
- **Window restore after minimize**: `win.minimize()` minimizes to Dock since `skipTaskbar: true` is set. Verify this feels right on macOS, or switch to `win.hide()` + a tray icon restore flow.
- **`npm run build` not yet tested**: The `electron-builder` packaging step was not run this session. Test `npm run build` to verify it produces a `.dmg`.
- **eslint.config.js uses ESM syntax** (`import`): Removing `"type": "module"` means `npm run lint` will fail because `eslint.config.js` has `import` statements in a now-CJS context. Either rename to `eslint.config.mjs` or convert to `require()`.

---

## Session: June 17 2026 (continued)

### What was built

Replaced emoji placeholders with custom PNG illustrations for each hunger state, made all arc text white and legible, wired up a message rotation system that cycles through 3 copy variants per state every 5-7 minutes without any user interaction.

---

### Key decisions

- **PNG illustrations go in `src/assets/cat-mood/`** — importing them as Vite module assets (via `import catFed from '../assets/cat-mood/cat-fed.png'`) lets Vite handle URL rewriting for both the dev server and the production `dist/` build. Putting them in `public/` would require manual path management in Electron's `file://` protocol context.

- **White background PNGs rendered in a rounded container** — The illustrations have white backgrounds (not transparent). Rather than using CSS blend modes (which darken the cat illustration itself on a dark card), the image sits inside a `rgba(255, 250, 242, 1)` rounded rectangle. This creates a deliberate "sticker card" effect inside the dark widget.

- **Copy rotation is timer-based, not state-based** — The previous implementation only swapped messages when `hungerState` changed. Now a `setTimeout` in Widget.tsx fires every 5-7 minutes (randomized each time) and increments `copyIndex`. `CatDisplay` uses `copyIndex % messages.length` to pick the current variant. The timer is cleared immediately when hunger state is `fed`.

- **3 message variants per state** — Enough to feel varied across a ~15-20 minute window without exhausting a message pool. The pattern from `messages.ts` is now embedded in `COMPOSITIONS` directly alongside the image mapping, so the state config is self-contained.

- **SVG drop-shadow filter for text legibility** — White arc text on a dark card is inherently legible, but the SVG `<feDropShadow>` filter adds a subtle `rgba(0,0,0,0.6)` shadow that prevents the text from disappearing if the background behind it is lighter (e.g., the cat illustration's white container).

---

### Problems hit + how they were fixed

- **`request_access` for screenshot timed out (300s)** — Can't visually verify the widget mid-session from this tool. Verified via clean build output (`npm run dev` produced zero errors, Electron process confirmed running via `pgrep`). Known limitation from prior session as well.

---

### Repetitive patterns to remember

- **Vite asset imports for Electron** — Always import images as `import img from '../assets/filename.png'` rather than putting them in `public/` and using string paths. Vite handles the URL rewriting; string paths break under Electron's `file://` protocol in production.

- **PNG with white background on dark UI** — `mix-blend-mode: multiply` sounds right but darkens the illustration itself on a very dark card background. The "sticker card" approach (rounded container with light fill) is more predictable.

---

### Permission prompts this session

| What was asked | Why | Outcome |
|---|---|---|
| `request_access` for screenshot | Verify widget UI after changes | Timed out (300s) — verified via build logs + pgrep instead |
| `gh repo create feed-the-boys` | Push to GitHub for the first time | Approved — created public repo at github.com/kelvinnIce/feed-the-boys |

---

### Open questions / next session

- **Screenshot verification still pending** — Neither session has been able to visually confirm the widget looks right. A fresh `request_access` + screenshot at the start of the next session should be the first thing done.
- **Image white background feels intentional but unverified** — The sticker-card approach may look clunky depending on how much of the card is visible. An alternative is sourcing transparent-background versions of the illustrations.
- **`npm run build` still untested** — The packaging step (`electron-builder`) has not been run. A `.dmg` is needed before the app can be shared or installed permanently.
- **GitHub repo is live**: [github.com/kelvinnIce/feed-the-boys](https://github.com/kelvinnIce/feed-the-boys)
