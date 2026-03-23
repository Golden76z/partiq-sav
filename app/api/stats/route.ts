export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalProducts, totalTickets, totalDocuments, openTickets, pendingDocs] =
    await Promise.all([
      prisma.product.count(),
      prisma.ticket.count(),
      prisma.document.count({ where: { confirmed: true } }),
      prisma.ticket.count({ where: { status: "OUVERT" } }),
      prisma.document.count({ where: { confirmed: false } }),
    ]);

  return NextResponse.json({
    totalProducts,
    totalTickets,
    totalDocuments,
    openTickets,
    pendingDocs,
  });
}
