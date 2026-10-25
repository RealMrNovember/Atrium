# Contributing to Atrium

Atrium is free to use and open to read. Contributions are very welcome — bug reports, fixes,
features, translations and design ideas.

> Atrium is **source-available**, not open source. Under the [Atrium License](LICENSE) you may fork
> and change the code **only to send a contribution back to this repository**. Please don't publish
> modified copies.

## Ways to help

- ⭐ **Star the repo** and share it — it helps more people find Atrium.
- 🐛 **Report bugs** with [an issue](https://github.com/RealMrNovember/Atrium/issues/new/choose): what you did, what you expected, what happened, your OS and Atrium version.
- 💡 **Suggest features** with an issue before writing large changes, so we can agree on the shape.
- 🌍 **Improve translations** — dictionaries live in `src/ortak/i18n/` (`en.ts` is the base).
- ☕ **Sponsor** — see the *Support* section of the README.

## Development setup

```bash
git clone https://github.com/RealMrNovember/Atrium.git
cd Atrium
npm install
npm run dev          # app with hot reload
npm run typecheck    # TypeScript check
npm run dist         # installer for your OS (output in dist/)
```

You need Node.js 20+ and, to run real agents, [Claude Code](https://docs.anthropic.com/en/docs/claude-code) signed in.
Turn on **Simulation** in the top bar to work on the UI without spending anything.

### Project layout

| Path | What lives there |
|---|---|
| `src/main/` | Electron main process: `motor.ts` (command flow), `claude.ts` (Claude Code driver), `sohbetler.ts` (chat import & live sub-agents), `depo.ts` (storage) |
| `src/renderer/` | React UI — `sahne/` is the isometric building and floors |
| `src/ortak/` | Shared types and the i18n dictionaries |
| `assets/brand/` | Logo sources (SVG); `npm run icons` regenerates app icons |

Code identifiers are in Turkish (the project's original language); comments may be Turkish or
English. Please follow the style of the file you are editing.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Keep the change focused; add or update translations for every language when you add UI text
   (`npm run typecheck` fails if a key is missing).
3. Run `npm run typecheck` and try your change in the app.
4. Open the pull request and describe **what** and **why**.
5. Sign the [CLA](CLA.md) when the bot asks (one comment, once).

## Security

Found a vulnerability? Please don't open a public issue — see [SECURITY.md](SECURITY.md).
