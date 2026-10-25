export const en = `# Atrium User Guide

## Welcome
Atrium is your AI agent office. Every project is a **floor** of your company building and every agent works in its own **room**, at its own desk. You give one command to the project lead; the lead runs the team and brings you **one** clear report. The final call is always yours.

## First run
The setup wizard walks you through six steps:
1. **Language** — English, Türkçe, Deutsch, Français, Italiano or Русский. Agents also write their reports in this language.
2. **Company** — name, slogan, owner and an optional logo (it also appears on the roof of your building).
3. **Projects** — choose the folder that holds your projects. Click a project to include or exclude it, or add projects from any other folder.
4. **Claude** — Atrium checks that Claude Code is installed and signed in. You can sign in from here, or use an Anthropic API key (stored encrypted on your computer).
5. **Chats** — Atrium finds your Claude Code conversations and files them by project.
6. **Limits** — the per-agent and daily spending caps.

You can run the wizard again any time from **Profile & Settings**.

## The building
- The home page shows your company card and the building. **Click a floor** to step inside.
- **Lit windows** mean someone is working on that floor: an Atrium agent, a guest sub-agent, or a Claude Code chat that is active right now.
- **Reorder floors**: drag a floor in the left list, or use the ▲ ▼ buttons that appear when you hover it.
- Your **logo** stands on the roof once you upload it.
- **Bright windows** mean someone is working right now; **warm, dim windows** mean a Claude Code chat is open in the Claude app but idle.
- When something needs you — a chat waiting for your decision or an agent with a problem — an agent leans out of that floor's window, waves and calls you. Click it to jump straight to that chat.

## Inside a floor
A floor has eight rooms around a corridor. Room 1 belongs to the **project lead** (the one with the crown). The default team is a developer, a UI/UX designer, test & quality, a researcher and a memory keeper.
- **Click an agent** to see what it is doing right now, its work log and its job description.
- **Click an empty room** to hire a new agent.
- Speech bubbles show live activity, e.g. \`📄 reading cart.ts\` or \`🔎 searching "total"\`. A glowing screen means the agent is working.
- An orange agent with a star is a **guest**: a sub-agent started in one of your Claude Code chats. An orange **Claude** character is a Claude Code chat that is active right now.

## Giving commands
1. Open the **Command** tab and write what you want, then press **Send** (or Ctrl+Enter).
2. The lead reads the project memory and splits the work into up to four tasks. If no one fits, the lead **hires a specialist** — the new agent walks out of the elevator into an empty room.
3. Agents walk to the lead's office to take their task, return to their desk and work, then walk back with a report.
4. The lead merges everything into one report: *Summary · Done · Findings and risks · Waiting for your decision · Next steps*.

**Allow file changes** is off by default: the team only reviews and proposes. Turn it on when you want edits; agents then work one at a time. **Stop** cancels a running command.

## Status round
Want to know where a project stands? Press **📋 Status round**, or simply ask the lead something like *"How is the project going? Ask everyone and give me a short report."*
The lead walks from desk to desk, listens to each agent's short status report (done, in progress, risks, next), returns to its office and gives you one summary. Status reports are read-only and use a small budget.

## Project memory and focus folders
Each floor keeps a short **project memory**: what the project is, its stack and structure, how to run it, your goals and decisions, things to watch out for, recent work and lessons. Every agent reads it **first** instead of scanning the whole project — this is Atrium's biggest token saver.
- Press **Extract memory** on a floor to create it; press it again to refresh it. You can also edit it by hand in the **Memory** tab.
- After every job the memory updates itself (*Recent work* and *Learned*).
- When memory is extracted, Atrium also suggests **focus folders** for every agent (e.g. the developer → \`src/api\`). Agents start in their focus folders and stay inside them unless the task needs more. You can change them in the agent's card.

## Claude Code chats
- The **Chats** page lists every Claude Code conversation on your computer, filed by project. A green dot means the chat is active right now.
- Open a chat to read it. Type in the box at the bottom to **continue the chat from Atrium**: Claude works in that project, you see its answers and steps live, and a Claude character works on the floor at the same time.
- Continuing a chat follows the same safety rules: no shell commands, file changes only if you allow them.
- Chats are read locally only; nothing leaves your computer.

## Team
In the **Team** tab you can rename agents, edit their job descriptions, choose a model (Haiku: fast and cheap · Sonnet: balanced · Opus: most capable), give web access, set focus folders, move them to another room or remove them. The lead cannot be removed.

## Reports
The **Reports** page collects every command from every floor with the lead's report, the team's individual reports and the cost.

## Costs and limits
- **Today ≈ $X** is the cost Claude Code reports for today's agent runs.
  - If you signed in with a **Claude subscription** (Pro / Max), this is an **API-equivalent estimate**: it is not charged separately and counts toward your plan's usage limits instead.
  - If you use an **API key**, it is real API spending.
- **Cap** is Atrium's own **daily safety limit**. Agents never start work that could go past it. If a run times out or is cancelled and its cost can't be read, the full per-agent cap is counted, so the daily cap is never under-counted.
- Change both caps in **Profile & Settings → Limits and safety**.

## Safety
- Agents cannot read \`.env\`, key or password files, cannot run shell commands and cannot start their own sub-agents.
- Agents never commit, push, install packages, message anyone or publish anything.
- Text from web pages and files is treated as data, never as instructions.

## Simulation
Turn on **Simulation** in the top bar to try everything — commands, hiring, status rounds, animations — without calling Claude and without spending anything. Simulation never writes to project memory.

## Sounds
Footsteps, keyboard clicks, the elevator bell, a hiring jingle and a chime when a report is ready. Toggle them with the 🔊 button in the top bar or in Settings.

## Updates
Atrium checks for updates when it starts and every few hours. When a new version is ready you'll see a banner — press **Restart and update**. You can also check manually in **Profile & Settings → Updates**. On macOS the update opens the download page.

## Troubleshooting
- **"Claude Code was not found"** — install it with \`npm install -g @anthropic-ai/claude-code\`, or set its path in Settings.
- **"Claude Code is not signed in"** — open Settings → Claude connection and press **Sign in with Claude**, then **Check again**.
- **"daily cap"** — today's cap is reached; raise it in Settings or wait until tomorrow.
- **A floor is missing** — check the project folder and the excluded projects in Settings, then press ↻ next to *Floors*.

## Support
Atrium is free. If it helps you, please ⭐ star it on GitHub, share it, and report bugs or ideas in GitHub Issues.
Made by CiciByte Technology, Inc. — cicibyte.com
`
