export function normalizeUrl(raw) {
  let url = raw.trim();

  if (!url) throw new Error("URL vide");

  // Ajoute le schéma si absent — "stripe.com" → "https://stripe.com"
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // new URL() lève une exception si l'URL est invalide — on la laisse remonter
  const parsed = new URL(url);

  // "stripe" → hostname sans point → on suppose .com
  if (!parsed.hostname.includes(".")) {
    parsed.hostname = parsed.hostname + ".com";
  }

  return parsed.href;
}
