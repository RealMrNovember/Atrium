export interface YerelMetinler {
  /** model id → one-sentence description */
  modeller: Record<string, string>
  rehber: { baslik: string; maddeler: string[] }[]
}

export const en: YerelMetinler = {
  modeller: {
    'llama3.2:1b': 'Tiny and very fast; fine for short questions, summaries and old laptops.',
    'llama3.2:3b': 'Small all-rounder from Meta; good quality for its size and runs almost anywhere.',
    'qwen3:4b': 'Surprisingly capable small model with a thinking mode; a great first agent on modest hardware.',
    'gemma3:4b': 'Google’s small model; understands images too, good at writing and summaries.',
    'phi4-mini': 'Microsoft’s compact model; strong at reasoning and maths for its size.',
    'llama3.1:8b': 'Classic 8B from Meta; dependable general model with solid tool use.',
    'qwen3:8b': 'One of the best 8B models; strong at code, reasoning and many languages.',
    'gemma3:12b': 'Mid-size Google model with vision; writes very naturally.',
    'qwen3:14b': 'Clearly smarter than 8B models; a sweet spot for a 12–16 GB graphics card.',
    'gpt-oss:20b': 'OpenAI’s open-weight model; good reasoning and tool use, needs about 16 GB.',
    'mistral-small:24b': 'Fast, multilingual and reliable at following instructions.',
    'gemma3:27b': 'Google’s largest Gemma; excellent writing and image understanding.',
    'qwen3:30b': 'Mixture-of-experts: large-model quality but only 3B active at a time, so it is quick.',
    'qwen3:32b': 'Top-tier open model for a 24 GB card; strong at code and long tasks.',
    'llama3.3:70b': 'Close to large cloud models in quality; needs a workstation or a 64 GB Mac.',
    'gpt-oss:120b': 'OpenAI’s big open model; for high-end machines with 80 GB+ memory.',
    'qwen2.5-coder:1.5b': 'Tiny code model; for quick code questions on weak hardware.',
    'qwen2.5-coder:7b': 'Very good code model for its size; reads and explains code well.',
    'qwen2.5-coder:14b': 'Strong coder that handles real projects; great for a developer agent.',
    'devstral:24b': 'Built by Mistral for agentic coding — exploring a codebase and editing files.',
    'qwen2.5-coder:32b': 'One of the best open code models; near cloud quality on code tasks.',
    'deepseek-r1:1.5b': 'Tiny reasoning model that thinks step by step; mostly for experiments.',
    'deepseek-r1:7b': 'Thinks before answering; good for maths, logic and planning.',
    'deepseek-r1:14b': 'Stronger step-by-step reasoning; slower but more careful answers.',
    'phi4:14b': 'Microsoft’s reasoning-focused model; excellent at maths and logic.',
    'deepseek-r1:32b': 'Deep reasoning for hard problems; needs a 24 GB card.',
    'qwen2.5vl:7b': 'Reads screenshots, documents and charts; good OCR.',
    'llava:7b': 'Classic image model; describes pictures and answers questions about them.',
    'dolphin-phi:2.7b': "Small uncensored model based on Microsoft Phi-2; runs on almost any computer.",
    'llama2-uncensored:7b': "Classic uncensored Llama 2 fine-tune; answers directly without moralising.",
    'dolphin-mistral:7b': "Popular uncensored Mistral 7B by Eric Hartford; good at chat and creative writing.",
    'dolphin-llama3:8b': "Uncensored Llama 3 8B; smarter than the Llama 2 versions, good at instructions and code.",
    'dolphin3:8b': "Dolphin 3.0 on Llama 3.1: the newest general-purpose uncensored model in this list.",
    'wizard-vicuna-uncensored:13b': "Larger uncensored chat model; longer, more detailed answers, needs about 9 GB.",
    'dolphin-mixtral:8x7b': "Uncensored mixture-of-experts on Mixtral; the strongest here, for 32 GB+ machines.",
    'nomic-embed-text': 'Turns text into vectors for search (RAG); not a chat model.',
    'mxbai-embed-large': 'High-quality embedding model for semantic search; not a chat model.'
  },
  rehber: [
    {
      baslik: '🧠 What is local AI?',
      maddeler: [
        'A local model is an AI that runs entirely on your computer. No account, no subscription, no internet once it is downloaded.',
        'Your code and documents never leave the machine — useful for private or client projects.',
        'Local models are smaller than Claude or GPT, so give them focused tasks: reading and explaining code, reviews, summaries, drafts.'
      ]
    },
    {
      baslik: '📏 Parameters, size and memory',
      maddeler: [
        '“8B” means 8 billion parameters. More parameters = smarter, but more memory and slower.',
        'Atrium shows the 4-bit versions Ollama uses by default: roughly 0.6 GB per billion parameters.',
        'The model must fit in memory. Graphics-card memory (VRAM) is fastest; if it does not fit, the rest runs on the processor and system RAM, which is several times slower.',
        'On Apple Silicon Macs memory is shared, so about 70% of RAM can be used for the model.'
      ]
    },
    {
      baslik: '⬇️ Installing — one click',
      maddeler: [
        'Click “Download & install Ollama”. Atrium downloads the official release from GitHub and installs it (Windows: into your user account, no admin needed · macOS: into Applications · Linux: inside Atrium’s data folder).',
        'When the engine shows “running”, pick a model marked “Runs fast” (or “Recommended for you”) and click Download.',
        'Models are big files (1–40 GB). Downloads continue in the background; you can keep working.'
      ]
    },
    {
      baslik: '🔗 Connecting a model to an agent',
      maddeler: [
        'Open a floor, click an agent and set “AI tool” to Ollama, then choose your model.',
        'Pick a model marked “Can be an agent”: it can open and read project files with Atrium’s safe file tools. Other models answer only from the instructions and project memory.',
        'You can mix tools on the same floor — for example Claude as the lead and a local coder model as the developer.',
        'Set “Default for new agents” in Profile & Settings → AI tools to make new hires use it.'
      ]
    },
    {
      baslik: '🔌 LM Studio and other servers',
      maddeler: [
        'Already using LM Studio, llama.cpp, vLLM or a cloud API? Choose “OpenAI compatible” in AI tools and enter its address.',
        'LM Studio: start its local server, then use http://localhost:1234/v1.',
        'The model list is read from the server automatically.'
      ]
    },
    {
      baslik: '💡 Tips',
      maddeler: [
        'The first answer is slow while the model loads into memory; the next ones are much faster.',
        'Close heavy apps (browsers with many tabs, games) to free memory for bigger models.',
        'On laptops, plug in the charger — battery mode slows the graphics card down.',
        'Start small: if a 4B model is fast enough, try the next size up.'
      ]
    }
  ]
}
