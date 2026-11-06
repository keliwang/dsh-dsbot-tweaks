# DS Bot Tweaks

English | [中文](README.zh.md)

> A home for small tweaks to [DS Bot](https://github.com/deepseek-ai/deepseek-harness): one bundle instead of one package per tweak.

Each tweak is a small client-side UI addition. DS Bot's own package is never modified, so upgrades cannot overwrite them.

## Tweaks

| Tweak | Where | What it does |
|---|---|---|
| **Native interface switch** | Beside DS Bot's bottom-left settings gear | One click switches to the native DSH interface (classic agent mode) |

## Install

Requires **DS Bot** in the target profile (verified with ds-bot 0.3.0).

**Harness Desktop (macOS, Windows)**

1. Open **Plugins** in the sidebar → **Add plugin**.
2. Enter this repository's absolute path, e.g. `/path/to/dsh-dsbot-tweaks`.
3. Install, then refresh the page (⌘R / Ctrl+R). If DSH asks for a restart, quit it completely and reopen.

**Harness Web / CLI**

```sh
dsh plugin --profile <profile> add /path/to/dsh-dsbot-tweaks
```

The package has no host-side dependencies, so installing straight from the source directory (link) works — no packing needed.

## Use

### Native interface switch

DS Bot's bottom-left footer gets one extra round button (⇄; hover shows the hint) beside the settings gear.

1. After refreshing, click the **switch button beside the gear**.
2. The page switches to the native DSH interface (classic agent mode). To come back, use the **DS Bot** button at the bottom of the native sidebar.

The button only appears on the DS Bot surface.

## Add another tweak

Sources are split one file per tweak. Three steps:

1. Add a file under `src/client/tweaks/` exporting a factory that returns `{ id, enabled(), apply(), install? }`.
2. Register it in `TWEAKS` in `src/client/index.js`.
3. `npm run build` to regenerate `client.js`, then refresh the page.

One shared `MutationObserver` calls `apply()` of every enabled tweak on the frame after the page changes, so `apply()` must be idempotent and cheap. Use `install()` for a tweak's own listeners or timers; it runs once.

See [docs/adding-a-tweak.md](docs/adding-a-tweak.md) for the template and rules.

## How it works and limits

- Tweaks depend on the DOM DS Bot renders. The native-interface switch uses `.bt-leftcol-foot`, `button.bt-account` and `span.bt-you`; a future DS Bot footer change needs the matching selector updated.
- The switch prefers DS Bot's own action (`actions.setSurface('agent')`, the same call the Settings row makes), so it switches in memory without a reload. That action has no public seam; it is borrowed from the gear button's React fiber, which is a private structure. If it cannot be borrowed after a DS Bot/React change, the tweak falls back to writing `localStorage['ds-bot:surface']` and reloading the page — same behavior, just a few seconds slower.
- No network, no disk writes, no credentials.

## Development

```
dsh-dsbot-tweaks/
├── package.json           # bundle + client manifest
├── cordis.patch.yml       # inserts the plugin row into the profile
├── index.js               # host half (empty)
├── client.js              # built artifact, do not edit by hand
├── src/client/
│   ├── index.js           # entry: the TWEAKS registry
│   ├── lib/               # shared: dom, surface, borrowed DS Bot actions
│   └── tweaks/            # one file per tweak
├── scripts/build-client.mjs
├── docs/adding-a-tweak.md
├── locale/ icon.svg
└── README*.md
```

DSH loads exactly one `client.js` per package, so the sources are bundled by esbuild:

```sh
pnpm install     # once; installs the esbuild devDependency
npm run build    # src/client → client.js
npm run check    # fails when client.js is stale
```

Rebuild after source edits, then refresh the page. Plugin conventions are documented in the DSH source at `docs/user/develop/basic/publish.md`.

When testing in DS Bot: confirm a tweak appears as expected, that repeated passes do not insert duplicates, and that it disappears where it should not apply.

## Uninstall

Remove it from the Plugins page, or:

```sh
dsh plugin --profile <profile> remove dsh-dsbot-tweaks
```

Then refresh the page; nothing else is left behind.
