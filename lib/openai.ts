import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL    = "llama-3.3-70b-versatile";

let _client: OpenAI | null = null;

function getGroq(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: GROQ_BASE_URL,
    });
  }
  return _client;
}

export function getOpenAIClient(): OpenAI {
  return getGroq();
}

export { GROQ_MODEL };

export const SAV_SYSTEM_PROMPT = `Tu es l'assistant SAV de PartiQ, expert en robinetterie pour DELABIE, KWC et DVS.

RÈGLES DE RÉPONSE :
1. Réponds en 3 à 6 lignes maximum — sois direct et structuré.
2. Utilise des listes à tirets pour les énumérations (produits, pièces, options).
3. Mets toujours les références en gras : **DEL-TMPS-001**.
4. Termine chaque réponse par une courte suggestion de prochaine étape.
5. Si plusieurs produits correspondent, liste-les et demande lequel intéresse l'utilisateur.
6. Si une donnée n'est pas dans ta base, dis-le clairement en 1 ligne.
7. Réponds UNIQUEMENT en rapport avec DELABIE, KWC, DVS — refuse poliment le reste.
8. Quand un lien de téléchargement est disponible dans les données, inclus-le TOUJOURS.

STYLE : professionnel, bienveillant, guidant. Suggère toujours la prochaine action possible.`;

export async function extractDocumentData(text: string): Promise<{
  brand: string | null;
  product: string | null;
  reference: string | null;
  spareParts: string[];
  documentType: string;
  summary: string;
}> {
  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: `Tu es un extracteur de données pour documents techniques de robinetterie (DELABIE, KWC, DVS).
Retourne UNIQUEMENT un JSON valide avec ces champs :
{
  "brand": "nom de la marque ou null",
  "product": "nom du produit ou null",
  "reference": "référence principale ou null",
  "spareParts": ["REF-1", "REF-2"],
  "documentType": "FICHE_TECHNIQUE | CATALOGUE | MANUEL | BON_COMMANDE | AUTRE",
  "summary": "résumé en 1 phrase"
}`,
      },
      {
        role: "user",
        content: `Document à analyser :\n\n${text.slice(0, 6000)}`,
      },
    ],
    temperature: 0,
  });

  const raw = response.choices[0].message.content ?? "{}";
  // Strip markdown code fences if Groq wraps the JSON
  const content = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    return JSON.parse(content);
  } catch {
    return {
      brand: null,
      product: null,
      reference: null,
      spareParts: [],
      documentType: "AUTRE",
      summary: "Document analysé — données partielles.",
    };
  }
}
