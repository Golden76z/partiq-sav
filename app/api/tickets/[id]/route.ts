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
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket)
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PUT(
  req: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  let id: string;
  if (context.params instanceof Promise) {
    const resolved = await context.params;
    id = resolved.id;
  } else {
    id = context.params.id;
  }
  const body = await req.json();
  const { message, messageRole, ...ticketData } = body;

  if (message) {
    await prisma.message.create({
      data: {
        content: message,
        role: messageRole || "AGENT",
        ticketId: id,
      },
    });
  }

  const updateData: Record<string, unknown> = {};
  if (ticketData.status) updateData.status = ticketData.status;
  if (ticketData.priority) updateData.priority = ticketData.priority;
  if (ticketData.title) updateData.title = ticketData.title;
  if (ticketData.description) updateData.description = ticketData.description;

  const ticket = await prisma.ticket.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { name: true, email: true } },
      product: { include: { brand: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(ticket);
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  return PUT(req, context);
}

export async function DELETE(
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
  await prisma.message.deleteMany({ where: { ticketId: id } });
  await prisma.ticket.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
