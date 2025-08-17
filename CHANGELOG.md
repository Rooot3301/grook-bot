# Changelog

## 1.5.0 – Améliorations d’aide et de configuration (2025‑08‑17)

### Nouveautés

- **Commande `/help` revisitée** : l’aide liste désormais les commandes disponibles en tenant compte des permissions de l’utilisateur, affiche un descriptif pour chacune et propose un mode d’aide détaillée via `/help commande:<nom>`. L’aide détaillée fournit l’usage complet (avec paramètres obligatoires ou facultatifs), les permissions requises et des suggestions de commandes connexes.
- **Commande `/config`** : les administrateurs peuvent consulter, définir ou lister des paramètres persistants du serveur sans modifier les fichiers. Les paramètres sont stockés par identifiant de guilde dans `src/data/config.json`.
- **Commande `/ping` améliorée** : affiche la latence API (aller‑retour) et la latence WebSocket dans un embed clair.
- **Tests unitaires** : un script `npm test` vérifie que toutes les commandes exportent correctement `data` et `execute` et que la configuration peut être chargée et enregistrée sans erreur.
- **Intégration continue** : ajout d’un workflow GitHub Actions (`.github/workflows/ci.yml`) qui installe les dépendances et exécute les tests sur chaque push ou pull request.
- **Versioning** : la version du projet est passée en `1.5.0`, reflétant les ajouts majeurs. Le numéro est chargé au démarrage et affiché dans les commandes `/help` et `/status` (le cas échéant).

### Corrections

- Harmonisation de la propriété `ephemeral` dans toutes les commandes (suppression de variantes mal orthographiées).
- Nettoyage et factorisation des logs de démarrage et des réponses aux commandes.

### Instructions de mise à jour

1. **Mise à jour du code** : récupérez la nouvelle version via `git pull` ou en remplaçant les fichiers existants par ceux de cette release.
2. **Installation des dépendances** : exécutez `npm install` pour mettre à jour les modules si nécessaire.
3. **Déploiement des commandes slash** : lancez `npm run deploy` pour enregistrer les nouvelles commandes et mettre à jour la liste existante. Ajoutez `GUILD_ID` dans votre `.env` pour un déploiement instantané sur un serveur de test.
4. **Tests** : lancez `npm test` localement pour vérifier que tout est en ordre. Le workflow GitHub Actions s’en chargera automatiquement lors des pushes.
5. **Redémarrage du bot** : démarrez (ou redémarrez) le bot avec `npm start`. Le numéro de version actualisé s’affichera dans `/version`, `/help` et `/status`.

---

Pour les versions antérieures, reportez‑vous à l’historique Git du projet.