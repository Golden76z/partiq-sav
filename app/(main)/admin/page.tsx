'use client'

import { useState, useEffect } from 'react'
import DragDropUpload from '@/components/ui/DragDropUpload'
import { StatsCard } from '@/components/ui/StatsCard'
import { Settings, Loader2, Trash2 } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState({ documents: 0, tickets: 0, brands: 0, products: 0 })
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newBrand, setNewBrand] = useState('')

  const fetchData = async () => {
    try {
      const [docsRes, ticketsRes, brandsRes, productsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/tickets'),
        fetch('/api/brands'),
        fetch('/api/products'),
      ])
      const [docs, tickets, brandsData, products] = await Promise.all([
        docsRes.json(), ticketsRes.json(), brandsRes.json(), productsRes.json(),
      ])
      setStats({
        documents: Array.isArray(docs) ? docs.length : 0,
        tickets: Array.isArray(tickets) ? tickets.length : 0,
        brands: Array.isArray(brandsData) ? brandsData.length : 0,
        products: Array.isArray(products) ? products.length : 0,
      })
      setBrands(Array.isArray(brandsData) ? brandsData : [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrand.trim()) return
    await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrand }),
    })
    setNewBrand('')
    fetchData()
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Supprimer cette marque ?')) return
    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    fetchData()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-delabie-blue animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-delabie-text flex items-center gap-2">
          <Settings className="w-7 h-7 text-delabie-blue" />
          Administration
        </h1>
        <p className="text-delabie-gray-dark text-sm mt-1">Gérer les données et paramètres du système</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Documents"
          value={stats.documents}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          color="bg-green-100 text-green-700"
        />
        <StatsCard
          label="Tickets"
          value={stats.tickets}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
          color="bg-yellow-100 text-yellow-700"
        />
        <StatsCard
          label="Marques"
          value={stats.brands}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
          color="bg-blue-100 text-blue-700"
        />
        <StatsCard
          label="Produits"
          value={stats.products}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-delabie-text mb-4">Importer des documents</h2>
            <DragDropUpload onUploadComplete={fetchData} redirectOnUpload />
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-delabie-text mb-4">Gérer les marques</h2>
            <form onSubmit={handleCreateBrand} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                placeholder="Nom de la nouvelle marque..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-delabie-blue/30 text-delabie-text"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-delabie-blue text-white rounded-lg text-sm hover:bg-delabie-blue-dark"
              >
                Ajouter
              </button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {brands.map(brand => (
                <div key={brand.id} className="flex items-center justify-between bg-delabie-gray rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-delabie-text">{brand.name}</span>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-delabie-gray-dark text-sm text-center py-4">Aucune marque</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
