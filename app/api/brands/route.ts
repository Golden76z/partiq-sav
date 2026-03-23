export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true, documents: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands);
}
