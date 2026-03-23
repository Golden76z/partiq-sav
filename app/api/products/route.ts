export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const products = await prisma.product.findMany({
    where: {
      ...(brandId && { brandId }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      brand: true,
      spareParts: true,
      _count: { select: { tickets: true, documents: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}
