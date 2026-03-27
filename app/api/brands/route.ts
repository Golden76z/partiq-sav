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

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  const brand = await prisma.brand.create({ data: { name: name.trim() } });
  return NextResponse.json(brand, { status: 201 });
}
