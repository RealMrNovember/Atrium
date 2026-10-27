// Release history shown in the app ("What's new" and Settings → Updates). Newest first.
// Every language file must list the same versions in the same order.
export interface SurumNotu { surum: string; tarih: string; baslik: string; maddeler: string[] }

export const en: SurumNotu[] = [
  {
    surum: '1.6.1', tarih: '2026-10-27', baslik: "Scrolling fix",
    maddeler: [
      "The Local AI and Support pages now scroll properly in small windows."
    ]
  },
  {
    surum: '1.6.0', tarih: '2026-10-26', baslik: "You approve every change",
    maddeler: [
      "✅ Change preview: with file changes allowed, agents work on a copy of your project. Review every file and line, apply all or some, discard — and undo after applying.",
      "↪ Hand-offs: when an agent finishes, a colleague checks the work automatically (developer → QA by default).",
      "⏰ Scheduled work per floor: daily status rounds, weekly memory updates or any command at a set time.",
      "⚖️ Compare two AIs side by side — answers, cost, time and tokens.",
      "🧩 Team templates: Web agency, Mobile app, Content studio, Data & analytics, Game studio.",
      "📤 Share the lead’s report as a clean web page."
    ]
  },
  {
    surum: '1.5.0', tarih: '2026-10-26', baslik: "Many companies, one-click AI, built-in support",
    maddeler: [
      "🏙️ Run several companies — each with its own projects, team, memory and default AI tool. Switch from the ▾ menu next to the company name.",
      "⚡ One-click connect: Connect with ChatGPT, Connect with Google and Connect Claude install what is missing and open the sign-in page. The setup wizard now offers every AI tool.",
      "📊 The top bar shows one usage card per AI tool you use.",
      "📎 Attach images, PDFs and text files to a command. Create new projects and start new Claude Code chats right from Atrium — even with an empty folder.",
      "🛟 New Support page: send wishes, requests, complaints and bug reports and read our answers in the app. Optional free account with email or Google.",
      "🔒 A clear privacy promise: your projects, code, chats, memory and keys never leave your computer."
    ]
  },
  {
    surum: '1.4.2', tarih: '2026-10-25', baslik: "Faster updates",
    maddeler: [
      "🔄 Atrium now checks for a new version as soon as it opens and every 10 minutes after that.",
      "🛠️ Small reliability fixes."
    ]
  },
  {
    surum: '1.4.1', tarih: '2026-10-25', baslik: "Uncensored models in Local AI",
    maddeler: [
      "🔓 New “Uncensored” filter in the Local AI catalog with seven community models (Dolphin, Llama 2 Uncensored, Wizard Vicuna), each with a clear note on what that means.",
      "🛠️ Cancelling the Ollama download now cleans up the half-downloaded file."
    ]
  },
  {
    surum: '1.4.0', tarih: '2026-10-25', baslik: 'Many AIs, one office — plus local AI',
    maddeler: [
      "🤝 Agents can now run on Claude Code, OpenAI Codex CLI, Gemini CLI, Ollama or any OpenAI-compatible server — mixed on the same floor.",
      "🦙 New Local AI page: measures your computer and shows which models run fast, slowly or not at all.",
      "⬇️ Atrium downloads and installs Ollama and the models for you, then you can try them in a test chat.",
      "🔗 Give a local model to any agent; models that support tools read project files with safe, project-only tools."
    ]
  },
  {
    surum: '1.3.0', tarih: '2026-10-25', baslik: 'What’s new, right inside Atrium',
    maddeler: [
      '🎁 A “What’s new” window after every update, in your language.',
      '📜 Full version history in Profile & Settings → Updates.',
      '🔎 As soon as a new version is found — before it even downloads — a window shows what it brings.'
    ]
  },
  {
    surum: '1.2.0', tarih: '2026-10-25', baslik: 'The building talks back',
    maddeler: [
      '🪟 Chats open in the Claude app or your IDE glow as warm, dim windows; floors where someone is working shine bright.',
      '👋 When a chat waits for your decision or an agent has a problem, an agent leans out of the window, waves and calls you — click to jump to that chat.',
      '🔔 A soft “hey” sound and colored status dots in the floor list (calling · working · open).'
    ]
  },
  {
    surum: '1.1.3', tarih: '2026-10-25', baslik: 'Next-step boxes',
    maddeler: [
      '🧭 The “next step” box from the Claude desktop app (recap, question, answer buttons) now appears inside your chats.',
      '✅ Answer a waiting question with one click — Claude continues and works live on the floor.',
      '⏳ Chats waiting for your decision are marked in the chat lists.'
    ]
  },
  {
    surum: '1.1.2', tarih: '2026-10-25', baslik: 'Plan usage limits',
    maddeler: [
      '📊 On a Claude subscription, the top bar shows your session (5-hour) and weekly usage with reset times.',
      '💬 Continuing long chats has its own cap (default 5 USD).',
      '⚠️ Budget messages now say which cap was reached and where to change it.'
    ]
  },
  {
    surum: '1.1.1', tarih: '2026-10-25', baslik: 'Support Atrium',
    maddeler: ['☕ A “Buy me a coffee” link in the sidebar, the README and the showroom.']
  },
  {
    surum: '1.1.0', tarih: '2026-10-25', baslik: 'The office comes alive',
    maddeler: [
      '📋 Status round: the lead walks desk to desk and brings you one summary.',
      '💬 Continue your Claude Code chats from Atrium and watch them live on the floor.',
      '📁 Focus folders for every agent — fewer tokens.',
      '↕️ Reorder floors, 🏷️ your logo on the roof, 🔊 sound effects.',
      '🔄 Automatic updates and an in-app user guide in six languages.'
    ]
  },
  {
    surum: '1.0.1', tarih: '2026-10-25', baslik: 'Choose your floors',
    maddeler: [
      '🏢 Include or exclude projects, and add projects from any folder.',
      '🛡️ Agent runs stay strictly read-only and never write into your Claude Code history or memory.'
    ]
  },
  {
    surum: '1.0.0', tarih: '2026-10-25', baslik: 'Hello, Atrium',
    maddeler: [
      '🏢 Every project is a floor, every agent has a room.',
      '🧭 One command to the lead, one merged report back — the lead can even hire specialists.',
      '🧠 Project memory, Claude Code chat import, six languages, a setup wizard and Simulation mode.'
    ]
  }
]
