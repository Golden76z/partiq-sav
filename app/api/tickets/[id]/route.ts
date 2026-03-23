export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
    },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status, description } = body;

  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(description && { description }),
    },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
    },
  });

  return NextResponse.json(ticket);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.ticket.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
