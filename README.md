# 🤖 Grook Bot

Bot Discord multifonctions inspiré par l'univers de **Grook**.  
Il combine des outils de **modération**, des **mini‑jeux** interactifs, des commandes "fun" et des **easter eggs** pour rendre votre serveur vivant et sécurisé.

## 🆕 Nouveautés de la version 2.0.0

La version 2 de Grook introduit plusieurs améliorations majeures axées sur la stabilité et l’ergonomie :

- **Direction artistique harmonisée** : toutes les commandes utilisent désormais une palette de couleurs cohérente via un helper d’embed (`utils/embed.js`). Les embeds s’adaptent automatiquement (succès, erreur, info, avertissement) pour une lecture claire.
- **Notifications via webhook** : un webhook Discord configurable (`WEBHOOK_URL`) prévient lorsqu’une mise à jour est déployée, que le bot démarre ou qu’une erreur critique se produit. Pour désactiver ces notifications en développement, définissez `SKIP_WEBHOOK=true`.
- **Déploiement des slash commands amélioré** : le script `npm run deploy` élimine les doublons et envoie un rapport de succès/échec via le webhook. Un indicateur `WIPE_BEFORE_DEPLOY=true` supprime les commandes avant un nouveau déploiement.
- **Gestion de configuration asynchrone** : la commande `/config` s’appuie sur un service (`services/configService.js`) pour lire/écrire les paramètres de manière atomique et non bloquante. Les réponses utilisent les nouveaux embeds.
- **Log d’audit et ratelimit interne** : les actions sensibles sont journalisées dans `logs/audit.log` et un système de jetons limite le spam de commandes par utilisateur.
- **Bump de version** : le projet passe en `2.0.0` (voir `package.json`). Le numéro de version est exposé via `/version` et repris dans les notifications de démarrage.

Ces nouveautés visent à rendre Grook prêt pour un déploiement en production stable et élégant. Consultez la suite du README pour la liste complète des commandes et des fonctionnalités.

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

1. **Rickroll** : de temps en temps, un message « GG, voilà ta récompense » apparaît avec un bouton menant vers un célèbre lien YouTube. Parfois Grook se ravise et répond simplement « Non, pas aujourd’hui 😏 ».
2. **Flemme** : Grook peut refuser d’exécuter une commande (rarement) et répondre « Laisse‑moi dormir zebi », ou « Demande à Google frère », ou « J’ai la flemme, reviens plus tard ».  
3. **Prophéties** : Grook poste parfois une prophétie absurde dans le salon de discussion.

Ces comportements sont réglables via la configuration et restent rares pour éviter le spam.

## 🎉 Commandes fun

Pour égayer le serveur, quelques commandes simples :

- `/grookflip` : lance une pièce (Grook peut tricher).  
- `/grookrate <truc>` : note quelque chose de 0 à 10 de façon sarcastique.  
- `/grookfortune` : prédit l’avenir d’un membre (ou du serveur) façon cookie chinois.  
- `/grookquote <lien_ou_id>` : cite un message de façon stylée.  
- `/grookstats` : affiche les statistiques des mini‑jeux (victoires par membre).  
  

## 🛠️ Commandes utilitaires

 Ces commandes fournissent des informations sur le bot ou permettent d’interagir avec lui de manière pratique ou administrative.

 - `/help` : liste toutes les commandes disponibles en fonction de vos permissions et les regroupe par catégorie. Ajoutez un nom de commande (ex. `/help commande:ban`) pour obtenir une aide détaillée (description, options, permissions requises et commandes associées).
 - `/ping` : mesure la latence aller‑retour (API) et le ping WebSocket, et affiche les résultats dans un embed lisible.
 - `/status` : affiche un résumé de l’état actuel du bot : uptime, latences, nombre de serveurs et d’utilisateurs, mémoire utilisée et version.
 - `/version` : renvoie la version actuelle du bot (lue dans `package.json`).
 - `/config` : permet aux administrateurs de consulter et de modifier les paramètres du serveur (prefixe, easter eggs, messages de bienvenue…). Utilisez `/config list` pour voir tous les paramètres, `/config get clé:<clé>` pour récupérer une valeur et `/config set clé:<clé> valeur:<valeur>` pour la définir.
 - `/say <message>` : envoie un message via le bot dans le salon courant. **Réservé aux administrateurs**.

## 🎮 Jeux interactifs

### GrookRoulette
Commandez `/grookroulette` pour lancer une roulette russe virtuelle. Les joueurs cliquent sur « Participer » pour rejoindre. Grook élimine un participant à chaque tour jusqu’à la victoire finale.

### GrookTyper
Avec `/grooktyper`, Grook envoie une phrase aléatoire et le premier joueur à la retaper correctement l’emporte.

### GrookGuess
La commande `/grookguess` lance un jeu de devinettes : Grook pense à un nombre entre 1 et 100 et répond « Plus haut ! » ou « Plus bas ! » jusqu’à trouver le bon nombre. Grook peut parfois mentir pour pimenter le jeu.

### GrookSpy
Jeu d’Undercover. En lançant `/grookspy`, les joueurs rejoignent via un bouton. Grook donne un mot identique à tous sauf à l’Undercover, qui reçoit un mot approchant. Chacun donne ensuite un indice ; les joueurs votent pour démasquer l’espion. Si l’Undercover survit, il gagne.

### Liar
Avec `/liar`, l’hôte saisit trois affirmations (deux vraies, une fausse). Les autres votent pour deviner laquelle est le mensonge. Grook révèle la réponse et roast les perdants.

> **Remarque :** certaines implémentations de jeux complexes nécessitent des interactions avancées (boutons, modals). Ce dépôt fournit un squelette de base ; vous pouvez enrichir les jeux selon vos besoins.

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

## 🗂️ Versionning

Le numéro de version du bot est stocké dans le fichier `package.json` (champ `version`).  
Pour toute modification majeure ou mineure du code, pensez à incrémenter cette valeur.  

Le projet propose deux outils pour gérer les versions :

1. **Commande slash `/version`** — elle répond avec la version courante du bot afin que les utilisateurs puissent vérifier rapidement s’ils disposent de la dernière version déployée.

2. **Script `npm run release`** — ce script utilise la commande `npm version patch` pour incrémenter automatiquement le numéro de version (ex. 1.0.0 → 1.0.1) et ajoute un message de commit standard.  
   Lancez simplement : `npm run release` pour préparer une nouvelle release.  
   *Remarque :* pour que le commit et le tag soient créés correctement, votre dépôt doit être initialisé avec Git et la branche doit être propre.
