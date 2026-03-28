export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getOpenAIClient, SAV_SYSTEM_PROMPT, GROQ_MODEL } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getChatErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const message = err.message.trim();
    if (!message) return "Erreur du chatbot";

    if (/GROQ_API_KEY/i.test(message)) {
      return "Le chatbot n'est pas configure. Verifiez GROQ_API_KEY dans le conteneur app.";
    }

    if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network/i.test(message)) {
      return "Le conteneur app n'arrive pas a joindre Groq. Verifiez reseau, DNS et acces sortant HTTPS.";
    }

    if (/401|403|authentication|invalid api key|incorrect api key/i.test(message)) {
      return "La cle GROQ_API_KEY est absente, invalide ou refusee par Groq.";
    }

    return message;
  }

  return "Erreur du chatbot";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, sessionId } = body as {
      messages: { role: string; content: string }[];
      sessionId?: string;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages requis" }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    // ── 1. Full catalog — always injected so the AI knows every product ──────
    const allProducts = await prisma.product.findMany({
      include: { brand: true, _count: { select: { spareParts: true } } },
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
    });

    let ragContext = "\n\n--- CATALOGUE COMPLET ---\n";
    const byBrand: Record<string, typeof allProducts> = {};
    for (const p of allProducts) {
      (byBrand[p.brand.name] ??= []).push(p);
    }
    for (const [brand, products] of Object.entries(byBrand)) {
      ragContext += `\n${brand}:\n`;
      for (const p of products) {
        ragContext += `- ${p.name} | Réf: ${p.reference} | ${p.category} | ${p._count.spareParts} pièce(s) détachée(s)\n`;
      }
    }

    // ── 2. Detailed match — triggered by the user's query ────────────────────
    if (lastUserMessage) {
      // Split query into words, ignore short words
      const words = lastUserMessage.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (words.length > 0) {
        const matchedProducts = await prisma.product.findMany({
          where: {
            OR: words.flatMap((w) => [
              { name:        { contains: w, mode: "insensitive" as const } },
              { reference:   { contains: w, mode: "insensitive" as const } },
              { description: { contains: w, mode: "insensitive" as const } },
              { category:    { contains: w, mode: "insensitive" as const } },
            ]),
          },
          include: {
            brand: true,
            spareParts: true,
            documents: { where: { confirmed: true }, take: 5 },
          },
          take: 4,
        });

        const matchedParts = await prisma.sparePart.findMany({
          where: {
            OR: words.flatMap((w) => [
              { name:        { contains: w, mode: "insensitive" as const } },
              { reference:   { contains: w, mode: "insensitive" as const } },
              { description: { contains: w, mode: "insensitive" as const } },
            ]),
          },
          include: { product: { include: { brand: true } } },
          take: 5,
        });

        if (matchedProducts.length > 0) {
          ragContext += "\n--- DÉTAIL PRODUITS CORRESPONDANTS ---\n";
          for (const p of matchedProducts) {
            ragContext += `\n${p.brand.name} — **${p.name}** (Réf: **${p.reference}**)\n`;
            ragContext += `Catégorie : ${p.category}\n`;
            if (p.description) ragContext += `Description : ${p.description}\n`;

            if (p.spareParts.length > 0) {
              ragContext += `Pièces détachées :\n`;
              for (const sp of p.spareParts) {
                ragContext += `  - ${sp.name} | Réf: **${sp.reference}** | Stock: ${sp.stock}\n`;
                if (sp.compatibility.length > 1)
                  ragContext += `    Compatible avec: ${sp.compatibility.filter((c) => c !== p.reference).join(", ")}\n`;
              }
            }

            if (p.documents.length > 0) {
              ragContext += `Documents disponibles :\n`;
              for (const doc of p.documents) {
                ragContext += `  - ${doc.name} : [Télécharger la fiche](${APP_URL}/api/documents/${doc.id}/download)\n`;
              }
            } else {
              ragContext += `Documents : aucune fiche confirmée en base pour ce produit.\n`;
            }
          }
        }

        if (matchedParts.length > 0) {
          ragContext += "\n--- PIÈCES DÉTACHÉES CORRESPONDANTES ---\n";
          for (const sp of matchedParts) {
            ragContext += `- **${sp.name}** | Réf: **${sp.reference}** | Stock: ${sp.stock}\n`;
            ragContext += `  Produit parent: ${sp.product.brand.name} ${sp.product.name} (${sp.product.reference})\n`;
            if (sp.compatibility.length > 0)
              ragContext += `  Compatible avec: ${sp.compatibility.join(", ")}\n`;
          }
        }

        // Direct document search for PDF requests
        const isPdfQuery = /pdf|fiche|document|télécharger|telecharger/i.test(
          lastUserMessage.content
        );
        if (isPdfQuery) {
          const docs = await prisma.document.findMany({
            where: {
              confirmed: true,
              OR: words.flatMap((w) => [
                { name:    { contains: w, mode: "insensitive" as const } },
                { product: { name:      { contains: w, mode: "insensitive" as const } } },
                { product: { reference: { contains: w, mode: "insensitive" as const } } },
                { brand:   { name:      { contains: w, mode: "insensitive" as const } } },
              ]),
            },
            include: { brand: true, product: true },
            take: 5,
          });
          if (docs.length > 0) {
            ragContext += "\n--- DOCUMENTS TÉLÉCHARGEABLES ---\n";
            for (const doc of docs) {
              const label = doc.product ? `${doc.product.name} — ${doc.name}` : doc.name;
              ragContext += `- ${label} : [Télécharger](${APP_URL}/api/documents/${doc.id}/download)\n`;
            }
          }
        }
      }
    }

    ragContext += "\n--- FIN DES DONNÉES ---\n";

    const systemPrompt = SAV_SYSTEM_PROMPT + ragContext;

    const stream = await getOpenAIClient().chat.completions.create({
      model: GROQ_MODEL,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullResponse += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
            );
          }
        }

        if (sessionId && fullResponse) {
          try {
            const lastMsg = messages[messages.length - 1];
            await prisma.message.createMany({
              data: [
                { sessionId, role: lastMsg.role, content: lastMsg.content },
                { sessionId, role: "assistant", content: fullResponse },
              ],
            });
          } catch {
            // Non-blocking
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: getChatErrorMessage(err) }, { status: 500 });
  }
}
