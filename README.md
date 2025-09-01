# 🤖 Grook Bot

Bot Discord multifonctions inspiré par l'univers de **Grook**.  
Il combine des outils de **modération**, des **mini‑jeux** interactifs, des commandes "fun" et des **easter eggs ultra rares** pour rendre votre serveur vivant et sécurisé.

## 🆕 Nouveautés de la version 3.0.0

La version 3 de Grook introduit une révolution complète du gameplay et de l'architecture :

- **🕵️ GrookSpy révolutionné** : Jeu d'Undercover complet avec 80+ paires de mots équilibrées, interface premium et vraies règles du jeu
- **🎮 Mini-jeux consolidés** : Tous regroupés dans `/grookgames` pour une meilleure organisation
- **🥚 Easter eggs ultra rares** : Fréquences drastiquement réduites (Rickroll 0.01%, Lazy 0.1%)
- **🎨 Interface premium** : Embeds colorés cohérents avec feedback instantané
- **🧹 Architecture nettoyée** : Code optimisé, fichiers redondants supprimés
- **📊 Statistiques avancées** : Suivi détaillé des performances de jeu

Cette version majeure transforme Grook en une véritable pépite de bot Discord, prêt pour un usage intensif en production.

## 🔧 Installation et lancement

1. **Cloner** ce dépôt ou créer un nouveau dossier et y copier les fichiers.
2. Exécuter `npm install` pour installer les dépendances.
3. Copier le fichier `.env.example` en `.env` et remplir les variables :
   - `DISCORD_TOKEN` : le token de votre bot (obtenu dans le [Discord Developer Portal](https://discord.com/developers/applications)).
   - `VIRUSTOTAL_API_KEY` : clé API VirusTotal (facultatif, utilisée pour analyser les liens). Laisser vide pour désactiver l'analyse.
   - `WEBHOOK_URL` : (optionnel) l’URL du webhook Discord qui recevra les notifications de démarrage, déploiement et erreur. Si vide, un webhook interne est utilisé.
   - `SKIP_WEBHOOK` : (optionnel) mettre `true` pour désactiver l’envoi de notifications (utile en développement).
4. Lancer le bot avec `npm start`. En développement, utilisez `npm run dev` pour un rechargement automatique.

5. Pour (re)déployer les commandes slash sur Discord sans démarrer le bot, utilisez `npm run deploy`.  
   - Ce script charge toutes les commandes depuis `src/commands` et les enregistre via l’API Discord.  
   - Assurez‑vous d’avoir défini les variables `DISCORD_TOKEN` (token du bot) et `CLIENT_ID` (ID de l’application Discord) dans votre `.env`.  
   - Pour un déploiement sur un serveur spécifique (idéal en phase de test), définissez également `GUILD_ID`.  
   - Exemple : `CLIENT_ID=123... GUILD_ID=456... npm run deploy`.

## 📂 Arborescence

```
grook-bot/
├─ .env.example         # Exemple de configuration
├─ package.json         # Dépendances et scripts
├─ README.md            # Ce fichier
├─ src/
│  ├─ index.js          # Point d’entrée du bot
│  ├─ loader/
│  │  ├─ commands.js    # Chargement et enregistrement des slash commands
│  │  └─ events.js      # Enregistrement des événements
│  ├─ commands/         # Commandes organisées par catégories
│  │  ├─ moderation/    # Commandes de modération
│  │  ├─ fun/           # Commandes fun (mini‑jeux simples)
│  │  ├─ games/         # Jeux interactifs plus complexes
│  │  └─ util/          # Utilitaires (help, ping…)
│  ├─ features/         # Modules internes (casier, logs, VT, easter eggs…)
│  ├─ utils/            # Fonctions utilitaires (durées, texte…)
│  ├─ data/             # Données persistantes (config, cas, warnings…)
│  └─ events/           # Événements Discord (messageCreate, interactionCreate)
└─ .gitignore
```

## ⚙️ Commandes de modération

Ces commandes nécessitent les permissions Discord adéquates pour fonctionner (ban, kick, gérer les messages, etc.). Les logs sont envoyés dans un salon défini via `/modlogs`.

- `/ban @user [raison]` : bannit un utilisateur définitivement.  
- `/kick @user [raison]` : expulse un utilisateur du serveur.  
- `/mute @user [durée] [raison]` : mute un utilisateur pendant un temps donné (timeout natif).  
- `/unmute @user` : lève le mute.  
- `/warn @user [raison]` : enregistre un avertissement.  
- `/warnings @user` : liste les avertissements d’un membre.  
- `/clear [nombre]` : supprime un nombre de messages dans le salon.  
- `/lock #channel` / `/unlock #channel` : verrouille/déverrouille un salon.  
- `/slowmode #channel [secondes]` : active un mode lent pour calmer un canal.  
- `/nick @user [nouveau_pseudo]` : change le pseudo d’un membre.  
- `/modlogs #channel` : définit le salon où les actions de modération sont enregistrées.  
- `/serverinfo` : affiche des informations générales sur le serveur.  
- `/userinfo @user` : affiche les informations d’un membre.  
- `/case @user` : affiche le casier disciplinaire d’un membre.  
- `/case remove <id>` : supprime un cas disciplinaire.  
- `/cases` : liste tous les cas du serveur (optionnel).  
- `/panic` : verrouille tous les salons textuels et active un slowmode global (anti‑raid).  
*Les commandes utilitaires (help, ping, status, version, say) ont été déplacées dans une section dédiée plus bas.*

Les cas et avertissements sont stockés dans des fichiers JSON (voir `src/data/`).

## 🥚 Easter Eggs

Grook comporte plusieurs surprises aléatoires :

1. **🎲 Rickroll Ultra Rare** : Avec seulement 0.01% de chance, un message « GG, voilà ta récompense » peut apparaître avec un bouton menant vers un célèbre lien YouTube. Parfois Grook se ravise et répond simplement « Non, pas aujourd'hui 😏 ».
2. **😴 Lazy Responses** : Très rarement (0.1% des commandes), Grook peut refuser d'exécuter une commande avec des réponses créatives comme « Erreur 418 : Je suis une théière » ou « Mode nuit activé. Réessaie demain ! ».

Ces easter eggs sont maintenant **légendaires** - si rares que les découvrir devient un véritable événement sur votre serveur !

## 🎉 Commandes fun

Pour égayer le serveur, quelques commandes simples :

- `/grookrate <truc>` : note quelque chose de 0 à 10 de façon sarcastique.  
- `/grookfortune` : prédit l'avenir d'un membre façon cookie chinois.  
- `/grookquote <lien_ou_id>` : cite un message de façon stylée.  
- `/grookstats` : affiche les statistiques des mini‑jeux (victoires par membre).

## 🛠️ Commandes utilitaires

 Ces commandes fournissent des informations sur le bot ou permettent d’interagir avec lui de manière pratique ou administrative.

 - `/help` : liste toutes les commandes disponibles en fonction de vos permissions et les regroupe par catégorie. Ajoutez un nom de commande (ex. `/help commande:ban`) pour obtenir une aide détaillée (description, options, permissions requises et commandes associées).
 - `/ping` : mesure la latence aller‑retour (API) et le ping WebSocket, et affiche les résultats dans un embed lisible.
 - `/status` : affiche un résumé de l’état actuel du bot : uptime, latences, nombre de serveurs et d’utilisateurs, mémoire utilisée et version.
 - `/version` : renvoie la version actuelle du bot (lue dans `package.json`).
 - `/config` : permet aux administrateurs de consulter et de modifier les paramètres du serveur (prefixe, easter eggs, messages de bienvenue…). Utilisez `/config list` pour voir tous les paramètres, `/config get clé:<clé>` pour récupérer une valeur et `/config set clé:<clé> valeur:<valeur>` pour la définir.
 - `/say <message>` : envoie un message via le bot dans le salon courant. **Réservé aux administrateurs**.

## 🎮 Jeux interactifs

### 🕵️ GrookSpy - Le Jeu d'Undercover Ultime
Commandez `/grookspy` pour lancer une partie d'Undercover révolutionnaire :

- **🎯 80+ paires de mots** soigneusement équilibrées par difficulté
- **🎭 Vraies règles** : Tous les joueurs ont le même mot sauf UN (l'undercover)
- **🎨 Interface premium** avec embeds colorés et conseils stratégiques
- **⏰ Gestion du temps** optimisée (30s inscription, 90s indices, 60s vote)
- **📊 Statistiques détaillées** de fin de partie avec analyse des votes
- **🧠 Validation intelligente** des indices pour éviter la triche

### 🎮 Mini-Jeux Rapides
Utilisez `/grookgames` pour accéder à une collection de jeux instantanés :

- **🔢 Guess** : Devinez le nombre (Grook peut mentir !)
- **⌨️ Typer** : Course de frappe avec phrases créatives
- **🪙 Flip** : Pile ou face avec effets spéciaux rares
- **🎯 Roulette** : Roulette russe virtuelle

Tous les jeux incluent un système de statistiques et de victoires pour encourager la compétition !

## 🔍 Analyse des liens (LinkGuardianLite)

Grook peut analyser les liens postés sans recourir à l’API VirusTotal. Le module **LinkGuardianLite** calcule un score de risque en fonction de critères simples (extensions de domaine suspectes, punycode, nombre de sous‑domaines, raccourcisseurs, mots‑clés de phishing…) et, en option, effectue une requête **HEAD** rapide pour inspecter le type de contenu.

- Si `LINK_GUARDIAN_ENABLED` est activé et que le score atteint ou dépasse `LINK_RISK_THRESHOLD` (par défaut 3), le bot envoie un avertissement dans le salon ou en message privé selon `LINK_REPLY_MODE` (`reply`, `dm` ou `silent`).
- `LINK_HEAD_CHECK=true` active l’inspection HEAD (timeout 2 s) pour mieux évaluer les fichiers binaires ou les redirections.

Aucun appel à un service externe n’est effectué ; la configuration se fait dans les variables d’environnement.

## 🤖 Conversations LLM (optionnel)

Grook peut désormais discuter grâce à un LLM local via [Ollama](https://ollama.com/). Lorsque vous mentionnez le bot (`@Grook`), il génère une réponse naturelle en français à l’aide d’un modèle hébergé en local. Pour activer cette fonctionnalité :

1. **Installez et démarrez Ollama** : suivez les instructions d’[installation](https://ollama.com/download) puis lancez `ollama serve` sur la machine qui héberge le bot.
2. **Téléchargez un modèle** prenant en charge le français, par exemple :

   ```bash
   ollama pull llama3.1:8b
   # ou un modèle plus léger : ollama pull phi4
   ```

3. **Configurez votre `.env`** (voir `.env.example`) avec les variables suivantes :

   - `LLM_ON_MENTION=true` : active la réponse via LLM lorsque le bot est mentionné.
   - `OLLAMA_HOST=http://127.0.0.1:11434` : adresse de votre instance Ollama.
   - `OLLAMA_MODEL=llama3.1:8b` : nom du modèle à utiliser (modifiez selon votre choix).
   - `LLM_MAX_TOKENS` et `LLM_TEMPERATURE` : ajustez la longueur et la créativité des réponses (optionnel).

4. **Redémarrez le bot**. Lorsqu’un utilisateur mentionne Grook, il répondra via le LLM ; s’il n’y parvient pas, il retombera sur une réponse aléatoire « humaine ».

Cette fonctionnalité est entièrement optionnelle et n’envoie aucune donnée à des services externes (Ollama fonctionne en local).

## 📌 Contribuer

Le code est organisé de façon modulaire. Chaque commande est dans son propre fichier. Les données persistantes (cas, avertissements, statistiques et configuration) se trouvent dans `src/data/`.  
N’hésitez pas à proposer des améliorations ou à compléter les jeux existants.

## 📄 Licence

Ce projet est publié sous licence MIT. Vous pouvez l’utiliser et le modifier librement en respectant cette licence.

## 🗂️ Versioning

Le numéro de version du bot est stocké dans le fichier `package.json` (champ `version`).  
Pour toute modification majeure ou mineure du code, pensez à incrémenter cette valeur.  

Le projet propose deux outils pour gérer les versions :

1. **Commande slash `/version`** — elle répond avec la version courante du bot afin que les utilisateurs puissent vérifier rapidement s’ils disposent de la dernière version déployée.

2. **Scripts de release** — utilisez `npm run release:patch`, `npm run release:minor` ou `npm run release:major` pour incrémenter automatiquement le numéro de version avec un message de commit approprié.  
   *Remarque :* pour que le commit et le tag soient créés correctement, votre dépôt doit être initialisé avec Git et la branche doit être propre.
