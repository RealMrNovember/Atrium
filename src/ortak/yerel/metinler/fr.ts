import type { YerelMetinler } from './en'

export const fr: YerelMetinler = {
  modeller: {
    'llama3.2:1b': 'Minuscule et très rapide ; suffisant pour des questions courtes, des résumés et les vieux portables.',
    'llama3.2:3b': 'Petit modèle polyvalent de Meta ; bonne qualité pour sa taille et tourne presque partout.',
    'qwen3:4b': 'Petit modèle étonnamment capable, avec un mode réflexion ; un excellent premier agent sur du matériel modeste.',
    'gemma3:4b': 'Le petit modèle de Google ; comprend aussi les images, bon en rédaction et en résumés.',
    'phi4-mini': 'Le modèle compact de Microsoft ; fort en raisonnement et en maths pour sa taille.',
    'llama3.1:8b': 'Le 8B classique de Meta ; modèle généraliste fiable avec une bonne utilisation des outils.',
    'qwen3:8b': 'L’un des meilleurs modèles 8B ; fort en code, en raisonnement et dans de nombreuses langues.',
    'gemma3:12b': 'Modèle Google de taille moyenne avec vision ; écrit de façon très naturelle.',
    'qwen3:14b': 'Nettement plus malin que les modèles 8B ; le juste milieu pour une carte graphique de 12–16 Go.',
    'gpt-oss:20b': 'Le modèle à poids ouverts d’OpenAI ; bon raisonnement et bonne utilisation des outils, demande environ 16 Go.',
    'mistral-small:24b': 'Rapide, multilingue et fiable pour suivre les instructions.',
    'gemma3:27b': 'Le plus grand Gemma de Google ; excellent en rédaction et en compréhension d’images.',
    'qwen3:30b': 'Mixture-of-experts : la qualité d’un grand modèle, mais seulement 3B actifs à la fois, donc rapide.',
    'qwen3:32b': 'Modèle ouvert haut de gamme pour une carte de 24 Go ; fort en code et sur les tâches longues.',
    'llama3.3:70b': 'Proche des grands modèles cloud en qualité ; demande une station de travail ou un Mac de 64 Go.',
    'gpt-oss:120b': 'Le grand modèle ouvert d’OpenAI ; pour les machines haut de gamme avec 80 Go+ de mémoire.',
    'qwen2.5-coder:1.5b': 'Minuscule modèle de code ; pour des questions de code rapides sur du matériel faible.',
    'qwen2.5-coder:7b': 'Très bon modèle de code pour sa taille ; lit et explique bien le code.',
    'qwen2.5-coder:14b': 'Codeur solide qui s’attaque à de vrais projets ; parfait pour un agent développeur.',
    'devstral:24b': 'Conçu par Mistral pour le code agentique — explorer une base de code et modifier des fichiers.',
    'qwen2.5-coder:32b': 'L’un des meilleurs modèles de code ouverts ; proche de la qualité cloud sur les tâches de code.',
    'deepseek-r1:1.5b': 'Minuscule modèle de raisonnement qui réfléchit étape par étape ; surtout pour expérimenter.',
    'deepseek-r1:7b': 'Réfléchit avant de répondre ; bon en maths, en logique et en planification.',
    'deepseek-r1:14b': 'Raisonnement étape par étape plus solide ; plus lent mais des réponses plus soignées.',
    'phi4:14b': 'Le modèle de Microsoft axé sur le raisonnement ; excellent en maths et en logique.',
    'deepseek-r1:32b': 'Raisonnement approfondi pour les problèmes difficiles ; demande une carte de 24 Go.',
    'qwen2.5vl:7b': 'Lit les captures d’écran, documents et graphiques ; bonne reconnaissance de texte (OCR).',
    'llava:7b': 'Modèle d’images classique ; décrit les images et répond aux questions à leur sujet.',
    'nomic-embed-text': 'Transforme le texte en vecteurs pour la recherche (RAG) ; ce n’est pas un modèle de chat.',
    'mxbai-embed-large': 'Modèle d’embeddings de haute qualité pour la recherche sémantique ; ce n’est pas un modèle de chat.'
  },
  rehber: [
    {
      baslik: '🧠 Qu’est-ce que l’IA locale ?',
      maddeler: [
        'Un modèle local est une IA qui tourne entièrement sur ton ordinateur. Pas de compte, pas d’abonnement, pas d’internet une fois téléchargé.',
        'Ton code et tes documents ne quittent jamais la machine — pratique pour les projets privés ou clients.',
        'Les modèles locaux sont plus petits que Claude ou GPT, alors donne-leur des tâches ciblées : lire et expliquer du code, relectures, résumés, brouillons.'
      ]
    },
    {
      baslik: '📏 Paramètres, taille et mémoire',
      maddeler: [
        '« 8B » signifie 8 milliards de paramètres. Plus de paramètres = plus intelligent, mais plus de mémoire et plus lent.',
        'Atrium affiche les versions 4 bits qu’Ollama utilise par défaut : environ 0,6 Go par milliard de paramètres.',
        'Le modèle doit tenir en mémoire. La mémoire de la carte graphique (VRAM) est la plus rapide ; s’il n’y tient pas, le reste tourne sur le processeur et la RAM système, ce qui est plusieurs fois plus lent.',
        'Sur les Mac Apple Silicon, la mémoire est partagée, donc environ 70 % de la RAM peut servir au modèle.'
      ]
    },
    {
      baslik: '⬇️ Installation — un seul clic',
      maddeler: [
        'Clique sur « Télécharger et installer Ollama ». Atrium télécharge la version officielle depuis GitHub et l’installe (Windows : dans ton compte utilisateur, sans droits admin · macOS : dans Applications · Linux : dans le dossier de données d’Atrium).',
        'Quand le moteur indique « en marche », choisis un modèle marqué « Tourne vite » (ou « Recommandé pour toi ») et clique sur Télécharger.',
        'Les modèles sont de gros fichiers (1–40 Go). Les téléchargements continuent en arrière-plan ; tu peux continuer à travailler.'
      ]
    },
    {
      baslik: '🔗 Relier un modèle à un agent',
      maddeler: [
        'Ouvre un étage, clique sur un agent, règle « Outil d’IA » sur Ollama, puis choisis ton modèle.',
        'Choisis un modèle marqué « Peut être un agent » : il peut ouvrir et lire les fichiers du projet avec les outils de fichiers sûrs d’Atrium. Les autres modèles répondent uniquement à partir des instructions et de la mémoire du projet.',
        'Tu peux mélanger les outils sur le même étage — par exemple Claude comme chef de projet et un modèle de code local comme développeur.',
        'Règle « Par défaut pour les nouveaux agents » dans Profil et réglages → Outils d’IA pour que les nouvelles recrues l’utilisent.'
      ]
    },
    {
      baslik: '🔌 LM Studio et autres serveurs',
      maddeler: [
        'Tu utilises déjà LM Studio, llama.cpp, vLLM ou une API cloud ? Choisis « Compatible OpenAI » dans Outils d’IA et saisis son adresse.',
        'LM Studio : démarre son serveur local, puis utilise http://localhost:1234/v1.',
        'La liste des modèles est lue automatiquement depuis le serveur.'
      ]
    },
    {
      baslik: '💡 Astuces',
      maddeler: [
        'La première réponse est lente le temps que le modèle se charge en mémoire ; les suivantes sont bien plus rapides.',
        'Ferme les applis gourmandes (navigateurs avec plein d’onglets, jeux) pour libérer de la mémoire pour les gros modèles.',
        'Sur un portable, branche le chargeur — le mode batterie ralentit la carte graphique.',
        'Commence petit : si un modèle 4B est assez rapide, essaie la taille au-dessus.'
      ]
    }
  ]
}
