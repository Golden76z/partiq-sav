import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const priorityLabels: Record<string, string> = {
  LOW: "Faible", MEDIUM: "Moyenne", HIGH: "Haute", URGENT: "Urgente",
};
const statusLabels: Record<string, string> = {
  OUVERT: "Ouvert", EN_COURS: "En cours", RESOLU: "Résolu", FERME: "Fermé",
};

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { product: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["ID", "Titre", "Statut", "Priorité", "Produit", "Agent", "Créé le", "Modifié le"];
    const rows = tickets.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      statusLabels[t.status] || t.status,
      priorityLabels[t.priority] || t.priority,
      t.product ? `"${t.product.name}"` : "",
      t.user ? `"${t.user.name}"` : "",
      t.createdAt.toISOString(),
      t.updatedAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tickets.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Export échoué" }, { status: 500 });
  }
}
