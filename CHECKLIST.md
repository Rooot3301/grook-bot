# ✅ Grook Bot – Production Checklist (résumé)
- Node LTS 20+ (`.nvmrc`, `engines`)
- Logger structuré + erreurs globales
- IO non bloquantes (`jsonStore`) ou SQLite
- Validation `.env`, timeouts/retries réseau
- CI (lint/test/audit), PM2/systemd
- Cooldowns & caps (easter eggs), permissions, réponses éphémères
