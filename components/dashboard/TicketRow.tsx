"use client";

import { Badge } from "@/components/ui/Badge";
import { formatDateTime, ticketStatusColor, ticketStatusLabel } from "@/lib/utils";
import { useState } from "react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  productRef?: string | null;
  createdAt: string;
  user: { name: string; email: string };
  product?: { name: string; brand: { name: string } } | null;
}

interface TicketRowProps {
  ticket: Ticket;
  onStatusChange?: (id: string, status: string) => void;
}

const statuses = ["OUVERT", "EN_COURS", "RESOLU", "FERME"];

export function TicketRow({ ticket, onStatusChange }: TicketRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-delabie-gray cursor-pointer transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-4 py-3 text-sm font-medium text-delabie-text">{ticket.title}</td>
        <td className="px-4 py-3 text-sm text-delabie-gray-dark">
          {ticket.product
            ? `${ticket.product.brand.name} — ${ticket.product.name}`
            : ticket.productRef ?? "—"}
        </td>
        <td className="px-4 py-3">
          <Badge className={ticketStatusColor(ticket.status)}>
            {ticketStatusLabel(ticket.status)}
          </Badge>
        </td>
        <td className="px-4 py-3 text-sm text-delabie-gray-dark">{ticket.user.name}</td>
        <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(ticket.createdAt)}</td>
      </tr>
      {open && (
        <tr className="bg-delabie-blue-pale/30">
          <td colSpan={5} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-delabie-text mb-1 font-medium">Description</p>
                <p className="text-sm text-delabie-gray-dark">{ticket.description}</p>
              </div>
              {onStatusChange && (
                <div className="flex flex-col gap-1 min-w-fit">
                  <p className="text-xs font-medium text-delabie-gray-dark">Changer le statut</p>
                  <div className="flex gap-2 flex-wrap">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(ticket.id, s);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          ticket.status === s
                            ? ticketStatusColor(s)
                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {ticketStatusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
