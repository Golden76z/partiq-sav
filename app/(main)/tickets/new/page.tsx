'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react'

export default function NewTicketPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    productId: '',
  })

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: form.priority,
          productId: form.productId || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Erreur serveur (${res.status})`)
      }
      const ticket = await res.json()
      router.push(`/tickets/${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer le ticket.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/tickets" className="flex items-center gap-2 text-sm text-delabie-gray-dark hover:text-delabie-text mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour aux tickets
        </Link>
        <h1 className="text-3xl font-bold text-delabie-text flex items-center gap-2">
          <Plus className="w-7 h-7 text-delabie-blue" />
          Nouveau ticket SAV
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-delabie-text mb-1">Titre *</label>
          <input
            required
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Description courte du problème"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue/30 text-delabie-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-delabie-text mb-1">Description *</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description détaillée du problème..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue/30 text-delabie-text resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-delabie-text mb-1">Priorité</label>
            <select
              value={form.priority}
              onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue/30 text-delabie-text"
            >
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-delabie-text mb-1">Produit (optionnel)</label>
            <select
              value={form.productId}
              onChange={e => setForm(prev => ({ ...prev, productId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue/30 text-delabie-text"
            >
              <option value="">Aucun produit</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/tickets"
            className="flex-1 text-center py-2.5 border border-gray-200 rounded-lg text-sm text-delabie-gray-dark hover:bg-delabie-gray transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-delabie-blue text-white rounded-lg text-sm font-medium hover:bg-delabie-blue-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer le ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
