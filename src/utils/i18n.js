export function localizeCommand(b, { fr, en }) {
  // Applique uniquement les locales supportées par Discord.js. Les locales
  // comme 'fr-FR' ou 'en-GB' ne sont pas acceptées et provoquent des erreurs.
  if (fr?.name) {
    b.setNameLocalizations({ fr: fr.name });
  }
  if (fr?.description) {
    b.setDescriptionLocalizations({ fr: fr.description });
  }
  if (en?.name) {
    // Concaténer avec d'éventuelles locales déjà définies
    const existing = b.name_localizations || {};
    b.setNameLocalizations({ ...existing, 'en-US': en.name });
  }
  if (en?.description) {
    const existing = b.description_localizations || {};
    b.setDescriptionLocalizations({ ...existing, 'en-US': en.description });
  }
  return b;
}