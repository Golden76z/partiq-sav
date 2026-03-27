'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FilterBar, { FilterValues } from '@/components/ui/FilterBar'
import TicketCard from '@/components/tickets/TicketCard'
import { Ticket, Plus, Loader2, Download } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'OUVERT',   label: 'Ouvert' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'RESOLU',   label: 'Résolu' },
  { value: 'FERME',    label: 'Fermé' },
]

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async (f?: FilterValues) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (f?.search)    params.set('search', f.search)
    if (f?.status)    params.set('status', f.status)
    if (f?.priority)  params.set('priority', f.priority)
    if (f?.productId) params.set('productId', f.productId)

    try {
      const res = await fetch(`/api/tickets?${params}`)
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-delabie-text flex items-center gap-2">
            <Ticket className="w-7 h-7 text-delabie-blue" />
            Tickets SAV
          </h1>
          <p className="text-delabie-gray-dark text-sm mt-1">Gérer et suivre toutes les demandes de support</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/tickets/export"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-delabie-gray-dark hover:bg-delabie-gray transition-colors"
          >
            <Download className="w-4 h-4" /> Exporter CSV
          </a>
          <Link
            href="/tickets/new"
            className="flex items-center gap-2 px-4 py-2 bg-delabie-blue text-white rounded-lg text-sm hover:bg-delabie-blue-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouveau ticket
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <FilterBar
          onFilterChange={fetchTickets}
          showTypeFilter={false}
          showStatusFilter
          statusOptions={STATUS_OPTIONS}
          showPriorityFilter
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-delabie-blue animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <>
          <p className="text-sm text-delabie-gray-dark mb-4">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} trouvé{tickets.length !== 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-delabie-gray-dark mb-3">Aucun ticket trouvé.</p>
          <Link href="/tickets/new" className="text-delabie-blue hover:underline text-sm">Créer un ticket</Link>
        </div>
      )}
    </div>
  )
}
