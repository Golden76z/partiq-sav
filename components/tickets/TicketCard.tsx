import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, Clock, CheckCircle, XCircle, LucideIcon } from 'lucide-react'

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  product?: { name: string; reference: string } | null
  createdAt: string | Date
}

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  OUVERT:   { label: 'Ouvert',   color: 'bg-blue-100 text-blue-700',   icon: Clock },
  EN_COURS: { label: 'En cours', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  RESOLU:   { label: 'Résolu',   color: 'bg-green-100 text-green-700', icon: CheckCircle },
  FERME:    { label: 'Fermé',    color: 'bg-gray-100 text-gray-700',   icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW:    { label: 'Faible',  color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Moyenne', color: 'bg-blue-100 text-blue-600' },
  HIGH:   { label: 'Haute',   color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const status = statusConfig[ticket.status] || statusConfig.OUVERT
  const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM
  const StatusIcon = status.icon

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-delabie-text text-sm line-clamp-2 flex-1">{ticket.title}</h3>
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
        <p className="text-delabie-gray-dark text-xs line-clamp-2 mb-3">{ticket.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.color}`}>
              {priority.label}
            </span>
            {ticket.product && (
              <span className="text-xs text-delabie-gray-dark bg-delabie-gray px-2 py-0.5 rounded-full">
                {ticket.product.name}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {format(new Date(ticket.createdAt), 'd MMM yyyy', { locale: fr })}
          </span>
        </div>
      </div>
    </Link>
  )
}
