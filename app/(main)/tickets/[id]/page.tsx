'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const STATUS_OPTIONS = [
  { value: 'OUVERT',   label: 'Ouvert' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'RESOLU',   label: 'Résolu' },
  { value: 'FERME',    label: 'Fermé' },
]

const statusColors: Record<string, string> = {
  OUVERT:   'bg-blue-100 text-blue-700',
  EN_COURS: 'bg-yellow-100 text-yellow-700',
  RESOLU:   'bg-green-100 text-green-700',
  FERME:    'bg-gray-100 text-gray-700',
}

const priorityColors: Record<string, string> = {
  LOW:    'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH:   'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-700',
}

const priorityLabels: Record<string, string> = {
  LOW:    'Faible',
  MEDIUM: 'Moyenne',
  HIGH:   'Haute',
  URGENT: 'Urgente',
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (!res.ok) { router.push('/tickets'); return }
      setTicket(await res.json())
    } catch {
      router.push('/tickets')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchTicket() }, [fetchTicket])

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true)
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchTicket()
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSendingMessage(true)
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, messageRole: 'AGENT' }),
      })
      setNewMessage('')
      await fetchTicket()
    } finally {
      setSendingMessage(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce ticket ?')) return
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' })
    router.push('/tickets')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-delabie-blue animate-spin" />
    </div>
  )
  if (!ticket) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/tickets" className="flex items-center gap-2 text-sm text-delabie-gray-dark hover:text-delabie-text mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour aux tickets
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-delabie-text">{ticket.title}</h1>
            <p className="text-delabie-gray-dark text-sm mt-1">
              Créé le {format(new Date(ticket.createdAt), 'd MMMM yyyy', { locale: fr })}
              {ticket.product && ` • ${ticket.product.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${priorityColors[ticket.priority] || priorityColors.MEDIUM}`}>
              {priorityLabels[ticket.priority] || ticket.priority}
            </span>
            <select
              value={ticket.status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className={`text-sm font-medium px-3 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[ticket.status] || statusColors.OUVERT}`}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-delabie-text mb-2">Description</h2>
            <p className="text-delabie-gray-dark text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-delabie-text mb-4">
              Messages ({ticket.messages?.length || 0})
            </h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {ticket.messages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === 'USER' ? 'bg-delabie-gray ml-8' : 'bg-delabie-blue-pale mr-8'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-delabie-gray-dark">
                      {msg.role === 'USER' ? 'Client' : msg.role === 'AGENT' ? 'Agent' : msg.role}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(msg.createdAt), 'd MMM, HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-delabie-text">{msg.content}</p>
                </div>
              ))}
              {(!ticket.messages || ticket.messages.length === 0) && (
                <p className="text-delabie-gray-dark text-sm text-center py-4">Aucun message</p>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Ajouter un message..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue/30 text-delabie-text"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="px-4 py-2 bg-delabie-blue text-white rounded-lg text-sm hover:bg-delabie-blue-dark disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-delabie-text mb-3">Détails</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-delabie-gray-dark">Statut :</span>{' '}
                <span className="font-medium text-delabie-text">
                  {STATUS_OPTIONS.find(s => s.value === ticket.status)?.label || ticket.status}
                </span>
              </div>
              <div>
                <span className="text-delabie-gray-dark">Priorité :</span>{' '}
                <span className="font-medium text-delabie-text">{priorityLabels[ticket.priority] || ticket.priority}</span>
              </div>
              {ticket.product && (
                <div>
                  <span className="text-delabie-gray-dark">Produit :</span>{' '}
                  <span className="font-medium text-delabie-text">{ticket.product.name}</span>
                </div>
              )}
              {ticket.user && (
                <div>
                  <span className="text-delabie-gray-dark">Agent :</span>{' '}
                  <span className="font-medium text-delabie-text">{ticket.user.name}</span>
                </div>
              )}
              <div>
                <span className="text-delabie-gray-dark">Modifié :</span>{' '}
                <span className="font-medium text-delabie-text">
                  {format(new Date(ticket.updatedAt), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
          >
            Supprimer le ticket
          </button>
        </div>
      </div>
    </div>
  )
}
