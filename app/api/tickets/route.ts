export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = new Set(["OUVERT", "EN_COURS", "RESOLU", "FERME"]);
const VALID_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");
  const productId = searchParams.get("productId");
  const productRef = searchParams.get("productRef");
  const search = searchParams.get("search");

  const status = statusParam && VALID_STATUSES.has(statusParam) ? statusParam : null;
  const priority = priorityParam && VALID_PRIORITIES.has(priorityParam) ? priorityParam : null;

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status && { status: status as never }),
      ...(priority && { priority: priority as never }),
      ...(productId && { productId }),
      ...(productRef && { productRef: { contains: productRef, mode: "insensitive" } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, priority, productRef, productId, userId: bodyUserId } = body;

  if (!title || !description) {
    return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
  }

  // Try to get authenticated user, fall back to a system user if none
  const session = await getServerSession(authOptions);
  let userId = bodyUserId ?? (session?.user as { id?: string } | undefined)?.id ?? null;

  // If no userId found, use the first available user as fallback
  if (!userId) {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      return NextResponse.json({ error: "Aucun utilisateur disponible" }, { status: 400 });
    }
    userId = firstUser.id;
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      title,
      description,
      priority: (priority && VALID_PRIORITIES.has(priority) ? priority : "MEDIUM") as never,
      productRef: productRef ?? null,
      productId: productId ?? null,
      status: "OUVERT",
      attachments: [],
    },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
      messages: true,
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
