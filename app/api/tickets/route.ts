export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const productRef = searchParams.get("productRef");

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status && { status: status as never }),
      ...(productRef && { productRef: { contains: productRef, mode: "insensitive" } }),
    },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { title, description, productRef, productId } = body;

  if (!title || !description) {
    return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      title,
      description,
      productRef: productRef ?? null,
      productId: productId ?? null,
      status: "OUVERT",
      attachments: [],
    },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
