export const fr = `# Guide d'utilisation d'Atrium

## Bienvenue
Atrium est ton bureau d'agents IA. Chaque projet est un **étage** de l'immeuble de ton entreprise et chaque agent travaille dans sa propre **pièce**, à son propre bureau. Tu donnes une seule commande au chef de projet ; le chef de projet dirige l'équipe et te remet **un** rapport clair. La décision finale t'appartient toujours.

## Premier lancement
L'assistant de configuration te guide en six étapes :
1. **Langue** — English, Türkçe, Deutsch, Français, Italiano ou Русский. Les agents rédigent aussi leurs rapports dans cette langue.
2. **Entreprise** — nom, slogan, propriétaire et un logo facultatif (il apparaît aussi sur le toit de ton immeuble).
3. **Projets** — choisis le dossier qui contient tes projets. Clique sur un projet pour l'inclure ou l'exclure, ou ajoute des projets depuis n'importe quel autre dossier.
4. **Claude** — Atrium vérifie que Claude Code est installé et connecté. Tu peux te connecter ici, ou utiliser une clé API Anthropic (stockée chiffrée sur ton ordinateur).
5. **Discussions** — Atrium trouve tes conversations Claude Code et les range par projet.
6. **Limites** — les plafonds de dépenses par agent et par jour.

Tu peux relancer l'assistant à tout moment depuis **Profil et paramètres**.

## L'immeuble
- La page d'accueil affiche la carte de ton entreprise et l'immeuble. **Clique sur un étage** pour y entrer.
- Les **fenêtres allumées** signifient que quelqu'un travaille à cet étage : un agent Atrium, un sous-agent invité, ou une discussion Claude Code active en ce moment.
- **Réorganiser les étages** : fais glisser un étage dans la liste de gauche, ou utilise les boutons ▲ ▼ qui apparaissent quand tu le survoles.
- Ton **logo** se dresse sur le toit une fois que tu l'as téléversé.
- Les **fenêtres vives** signifient que quelqu’un travaille en ce moment ; les **fenêtres chaudes et tamisées** indiquent un chat Claude Code ouvert dans l’app Claude mais inactif.
- Quand on a besoin de toi — un chat attend ta décision ou un agent a un problème — un agent se penche à la fenêtre de cet étage, te fait signe et t’appelle. Clique dessus pour aller directement à ce chat.

## Dans un étage
Un étage compte huit pièces autour d'un couloir. La pièce 1 appartient au **chef de projet** (celui qui porte la couronne). L'équipe par défaut comprend un développeur, un designer UI/UX, un responsable tests et qualité, un chercheur et un gardien de la mémoire.
- **Clique sur un agent** pour voir ce qu'il fait en ce moment, son journal de travail et sa fiche de poste.
- **Clique sur une pièce vide** pour recruter un nouvel agent.
- Les bulles de dialogue montrent l'activité en direct, par ex. \`📄 reading cart.ts\` ou \`🔎 searching "total"\`. Un écran lumineux signifie que l'agent travaille.
- Un agent orange avec une étoile est un **invité** : un sous-agent lancé dans l'une de tes discussions Claude Code. Un personnage **Claude** orange est une discussion Claude Code active en ce moment.

## Donner des commandes
1. Ouvre l'onglet **Commande** et écris ce que tu veux, puis appuie sur **Envoyer** (ou Ctrl+Entrée).
2. Le chef de projet lit la mémoire du projet et répartit le travail en quatre tâches au maximum. Si personne ne convient, le chef de projet **recrute un spécialiste** — le nouvel agent sort de l'ascenseur et rejoint une pièce vide.
3. Les agents vont au bureau du chef de projet pour prendre leur tâche, retournent à leur bureau et travaillent, puis reviennent avec un rapport.
4. Le chef de projet fusionne tout en un seul rapport : *Résumé · Fait · Constats et risques · En attente de ta décision · Prochaines étapes*.

**Autoriser les modifications de fichiers** est désactivé par défaut : l'équipe se contente d'examiner et de proposer. Active-le quand tu veux des modifications ; les agents travaillent alors l'un après l'autre. **Arrêter** annule une commande en cours.

## Tour de statut
Tu veux savoir où en est un projet ? Appuie sur **📋 Tour de statut**, ou demande simplement au chef de projet quelque chose comme *« Comment avance le projet ? Demande à tout le monde et fais-moi un court rapport. »*
Le chef de projet passe de bureau en bureau, écoute le court rapport de statut de chaque agent (fait, en cours, risques, suite), retourne à son bureau et te donne un seul résumé. Les rapports de statut sont en lecture seule et utilisent un petit budget.

## Mémoire du projet et dossiers de focus
Chaque étage garde une courte **mémoire du projet** : ce qu'est le projet, sa stack et sa structure, comment le lancer, tes objectifs et décisions, les points d'attention, les travaux récents et les leçons apprises. Chaque agent la lit **en premier** au lieu de parcourir tout le projet — c'est la plus grande économie de tokens d'Atrium.
- Appuie sur **Extraire la mémoire** à un étage pour la créer ; appuie à nouveau pour l'actualiser. Tu peux aussi la modifier à la main dans l'onglet **Mémoire**.
- Après chaque tâche, la mémoire se met à jour toute seule (*Travaux récents* et *Appris*).
- Quand la mémoire est extraite, Atrium suggère aussi des **dossiers de focus** pour chaque agent (par ex. le développeur → \`src/api\`). Les agents démarrent dans leurs dossiers de focus et y restent, sauf si la tâche exige davantage. Tu peux les modifier dans la fiche de l'agent.

## Discussions Claude Code
- La page **Discussions** liste toutes les conversations Claude Code de ton ordinateur, rangées par projet. Un point vert signifie que la discussion est active en ce moment.
- Ouvre une discussion pour la lire. Écris dans la zone en bas pour **continuer la discussion depuis Atrium** : Claude travaille dans ce projet, tu vois ses réponses et ses étapes en direct, et un personnage Claude travaille en même temps à l'étage.
- Continuer une discussion suit les mêmes règles de sécurité : pas de commandes shell, modifications de fichiers seulement si tu les autorises.
- Les discussions sont lues uniquement en local ; rien ne quitte ton ordinateur.

## Outils d’IA
Atrium n'est pas lié à une seule IA. Chaque agent a son propre **Outil d’IA**, et différents outils peuvent travailler côte à côte sur le même étage :
- **Claude Code** — l'outil par défaut ; l'agent le plus performant et le seul avec l'affichage de l'utilisation du forfait et les plafonds en dollars.
- **OpenAI Codex CLI** — installe-le avec \`npm i -g @openai/codex\`, puis clique sur **Se connecter** dans Profil et réglages → Outils d’IA.
- **Gemini CLI** — installe-le avec \`npm i -g @google/gemini-cli\`, connecte-toi avec Google ou enregistre une clé API Gemini.
- **Ollama** — des modèles gratuits qui tournent sur ton propre ordinateur (voir IA locale).
- **Compatible OpenAI** — LM Studio, llama.cpp, vLLM, OpenRouter ou l'API OpenAI : saisis l'adresse et, si besoin, une clé.

Pour changer l'outil d'un agent, clique dessus et modifie **Outil d’IA** et **Modèle**. **Par défaut pour les nouveaux agents** détermine ce qu'utilisent les nouvelles recrues ; quand le chef de projet tourne sur un outil autre que Claude, les agents qu'il embauche utilisent le même outil et le même modèle.

## IA locale
La page **IA locale** mesure ton ordinateur (processeur, mémoire, carte graphique, disque libre) et montre quels modèles tourneront vite, lentement ou pas du tout.
1. Clique sur **Télécharger et installer Ollama** — Atrium télécharge le moteur officiel et l'installe pour toi.
2. Choisis un modèle marqué **Tourne vite** ou **Recommandé pour toi** et clique sur **Télécharger**.
3. Essaie-le dans le chat de test, puis confie-le à un agent : Outil d’IA **Ollama**, Modèle **ton modèle**.
Les modèles marqués **Peut être un agent** peuvent ouvrir et lire les fichiers du projet avec les outils de fichiers sûrs d'Atrium ; les autres répondent uniquement à partir des instructions et de la mémoire du projet. La page contient aussi un petit guide sur les tailles, la mémoire et des astuces.

## Équipe
Dans l'onglet **Équipe**, tu peux renommer les agents, modifier leurs fiches de poste, choisir un modèle (Haiku : rapide et économique · Sonnet : équilibré · Opus : le plus performant), donner l'accès au web, définir des dossiers de focus, les déplacer dans une autre pièce ou les supprimer. Le chef de projet ne peut pas être supprimé.

## Rapports
La page **Rapports** rassemble chaque commande de chaque étage avec le rapport du chef de projet, les rapports individuels de l'équipe et le coût.

## Coûts et limites
- **Aujourd'hui ≈ $X** est le coût que Claude Code indique pour les exécutions d'agents du jour.
  - Si tu t'es connecté avec un **abonnement Claude** (Pro / Max), c'est une **estimation équivalente API** : elle n'est pas facturée séparément et compte à la place dans les limites d'utilisation de ton forfait.
  - Si tu utilises une **clé API**, ce sont de vraies dépenses d'API.
- **Plafond** est la propre **limite de sécurité quotidienne** d'Atrium. Les agents ne démarrent jamais un travail qui pourrait la dépasser. Si une exécution expire ou est annulée et que son coût ne peut pas être lu, le plafond complet par agent est comptabilisé, de sorte que le plafond quotidien n'est jamais sous-estimé.
- Modifie les deux plafonds dans **Profil et paramètres → Limites et sécurité**.

## Sécurité
- Les agents ne peuvent pas lire les fichiers \`.env\`, de clés ou de mots de passe, ne peuvent pas exécuter de commandes shell et ne peuvent pas lancer leurs propres sous-agents.
- Les agents ne font jamais de commit ni de push, n'installent pas de paquets, n'envoient de message à personne et ne publient rien.
- Le texte des pages web et des fichiers est traité comme des données, jamais comme des instructions.

## Simulation
Active **Simulation** dans la barre du haut pour tout essayer — commandes, recrutement, tours de statut, animations — sans appeler Claude et sans rien dépenser. La simulation n'écrit jamais dans la mémoire du projet.

## Sons
Pas, clics de clavier, sonnette de l'ascenseur, jingle de recrutement et carillon quand un rapport est prêt. Active-les ou désactive-les avec le bouton 🔊 de la barre du haut ou dans les paramètres.

## Mises à jour
Atrium cherche des mises à jour au démarrage et toutes les quelques heures. Quand une nouvelle version est prête, une bannière apparaît — appuie sur **Redémarrer et mettre à jour**. Tu peux aussi vérifier manuellement dans **Profil et paramètres → Mises à jour**. Sur macOS, la mise à jour ouvre la page de téléchargement.

## Dépannage
- **« Claude Code est introuvable »** — installe-le avec \`npm install -g @anthropic-ai/claude-code\`, ou indique son chemin dans les paramètres.
- **« Claude Code n'est pas connecté »** — ouvre Paramètres → Connexion à Claude et appuie sur **Se connecter avec Claude**, puis sur **Vérifier à nouveau**.
- **« plafond quotidien »** — le plafond du jour est atteint ; augmente-le dans les paramètres ou attends demain.
- **Un étage manque** — vérifie le dossier des projets et les projets exclus dans les paramètres, puis appuie sur ↻ à côté de *Étages*.

## Assistance
Atrium est gratuit. S'il t'est utile, mets-lui une ⭐ étoile sur GitHub, partage-le, et signale les bugs ou les idées dans les GitHub Issues.
Made by CiciByte Technology, Inc. — cicibyte.com
`
