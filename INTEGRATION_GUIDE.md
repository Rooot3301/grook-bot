# Intégration rapide
1) Copier les fichiers de ce patch à la racine de votre repo (mêmes chemins).
2) Installer dépendances suggérées: `npm i pino sqlite sqlite3 envalid --save` (envalid si vous l'ajoutez).
3) Ajouter `"engines": { "node": ">=20" }` et éventuellement des scripts `lint/format`.
4) Vérifier `.github/workflows/ci.yml`, puis activer sur GitHub.
5) Déployer / tester: `npm run deploy`, `npm start`.
