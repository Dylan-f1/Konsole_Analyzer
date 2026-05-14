const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function analyzeWithLLM({ title, description, ogSiteName, techStack, url }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY manquante");

  const prompt = `Tu es un analyste B2B SaaS. À partir des données suivantes extraites du site ${url}, retourne un JSON strict (sans markdown, sans texte autour).

Données :
- Titre : ${title ?? "inconnu"}
- Description : ${description ?? "inconnue"}
- Nom du site : ${ogSiteName ?? "inconnu"}
- Technologies détectées : ${techStack.length ? techStack.join(", ") : "aucune"}

Retourne exactement ce JSON :
{
  "companyName": "Nom de l'entreprise",
  "description": "Description courte en 1-2 phrases",
  "sector": "Secteur d'activité (ex: SaaS B2B, E-commerce, Fintech, Marketplace...)",
  "companySize": "Taille estimée parmi : Micro (1-10), Petite (11-50), Moyenne (51-200), Grande (201-1000), Très grande (1000+)"
}

Pour estimer la taille : utilise les indices disponibles (technologies enterprise, complexité du produit, mentions d'équipes, etc.). Si vraiment impossible à estimer, retourne null.`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";

  try {
    return JSON.parse(raw);
  } catch {
    // Le LLM a parfois ajouté du texte autour du JSON — on extrait le bloc
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Réponse LLM non parseable");
  }
}
