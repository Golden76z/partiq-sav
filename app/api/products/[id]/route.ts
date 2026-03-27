export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  let id: string;
  if (context.params instanceof Promise) {
    const resolved = await context.params;
    id = resolved.id;
  } else {
    id = context.params.id;
  }
  const product = await prisma.product.findUnique({
    where: { id },
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

  if (!product)
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  return NextResponse.json(product);
}
