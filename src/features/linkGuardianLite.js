// src/features/linkGuardianLite.js
// Analyse heuristique des liens sans API VirusTotal.
// Ce module inspecte les URL dans les messages et attribue un score de risque
// en fonction de critères simples (TLD exotiques, punycode, IP littérale,
// raccourcisseurs d’URL, mots-clés de phishing). Si le score dépasse un
// seuil configurable, le bot répond avec un avertissement.

import { URL } from 'node:url';

// Paramètres depuis .env
const ENABLED   = String(process.env.LINK_GUARDIAN_ENABLED || 'true').toLowerCase() === 'true';
const HEAD_EN   = String(process.env.LINK_HEAD_CHECK || 'true').toLowerCase() === 'true';
const THRESHOLD = parseInt(process.env.LINK_RISK_THRESHOLD || '3', 10);
const MODE      = (process.env.LINK_REPLY_MODE || 'reply').toLowerCase(); // reply | dm | silent

// Certaines extensions de domaine couramment associées à des spams/phishing
const SUSPICIOUS_TLDS = new Set([
  'ru','cn','tk','cf','gq','ml','xyz','zip','mov','top','cam','quest'
]);
// URL courts/membrés souvent utilisés pour masquer la destination réelle
const SHORTENERS = new Set([
  'bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','rebrand.ly','cutt.ly','s.id'
]);
// Motifs courants dans les URLs de phishing
const PHISH_WORDS = /(nitro|steam|free|gift|airdrop|verify|login|password|giveaway|drop|check.*link)/i;

function scoreUrl(u) {
  let score = 0;
  const reasons = [];
  // punycode/homoglyph
  if (u.hostname.startsWith('xn--')) { score += 2; reasons.push('punycode'); }
  // IP littérale
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname)) { score += 2; reasons.push('ip-literal'); }
  // TLD exotique
  const tld = u.hostname.split('.').pop() || '';
  if (SUSPICIOUS_TLDS.has(tld)) { score += 1; reasons.push(`tld:${tld}`); }
  // Trop de sous-domaines
  if (u.hostname.split('.').length >= 5) { score += 1; reasons.push('subdomains>4'); }
  // Raccourcisseurs
  if (SHORTENERS.has(u.hostname)) { score += 1; reasons.push('shortener'); }
  // Mots-clés
  if (PHISH_WORDS.test(u.href)) { score += 1; reasons.push('keyword'); }
  return { score, reasons };
}

async function headCheck(u) {
  try {
    const res = await fetch(u.href, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(2000),
    });
    const ct = res.headers.get('content-type') || '';
    return { ok: res.ok, contentType: ct };
  } catch {
    return { ok: false, contentType: '' };
  }
}

/**
 * Analyse les URLs contenues dans un message et envoie un avertissement si nécessaire.
 * @param {import('discord.js').Message} message
 * @returns {Promise<boolean>} true si un avertissement a été envoyé
 */
export async function analyzeLinksInMessage(message) {
  if (!ENABLED) return false;
  if (!message.content) return false;
  // Extraire grossièrement les URLs
  const urls = Array.from(
    new Set(
      (message.content.match(/https?:\/\/[^\s<]+/gi) || [])
        .map((s) => s.replace(/[),.]+$/, ''))
    )
  );
  if (urls.length === 0) return false;
  let maxScore = 0;
  const report = [];
  for (const raw of urls) {
    try {
      const u = new URL(raw);
      const { score, reasons } = scoreUrl(u);
      let s = score;
      if (HEAD_EN) {
        const h = await headCheck(u);
        if (!h.ok) { s += 1; reasons.push('head-fail'); }
        if (/octet-stream|zip|exe/i.test(h.contentType)) { s += 1; reasons.push('binary'); }
        report.push(`• ${u.hostname} (type : ${h.contentType || 'n/a'}) — score : ${s} [${reasons.join(', ')}]`);
      } else {
        report.push(`• ${u.hostname} — score : ${s} [${reasons.join(', ')}]`);
      }
      if (s > maxScore) maxScore = s;
    } catch {
      // ignorer les URL invalides
    }
  }
  if (maxScore >= THRESHOLD && report.length) {
    const lines = [];
    lines.push('⚠️ **Lien potentiellement risqué détecté**');
    lines.push(...report.slice(0, 4));
    if (report.length > 4) lines.push(`… (+${report.length - 4} autres)`);
    const text = lines.join('\n');
    // Réponse en fonction du mode
    if (MODE === 'dm') {
      try { await message.author.send(text); } catch {}
    } else if (MODE === 'reply') {
      const warn = await message.reply(text).catch(() => null);
      // Supprimer après 20 secondes pour éviter le spam
      setTimeout(() => {
        if (warn && warn.deletable) warn.delete().catch(() => {});
      }, 20000);
    } else {
      console.warn('[linkGuardianLite]', text);
    }
    return true;
  }
  return false;
}