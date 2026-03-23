export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      brand: true,
      spareParts: true,
      documents: { where: { confirmed: true } },
      tickets: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json(product);
}
