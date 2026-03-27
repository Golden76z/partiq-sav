'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface Brand {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  reference: string
}

interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void
  showTypeFilter?: boolean
  typeOptions?: { value: string; label: string }[]
  showStatusFilter?: boolean
  statusOptions?: { value: string; label: string }[]
  showPriorityFilter?: boolean
}

export interface FilterValues {
  search: string
  brandId: string
  productId: string
  type: string
  status: string
  priority: string
}

export default function FilterBar({
  onFilterChange,
  showTypeFilter = true,
  typeOptions = [],
  showStatusFilter = false,
  statusOptions = [],
  showPriorityFilter = false,
}: FilterBarProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    brandId: '',
    productId: '',
    type: '',
    status: '',
    priority: '',
  })

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {})
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {})
  }, [])

  const handleChange = (key: keyof FilterValues, value: string) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-delabie-gray-dark flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            className="flex-1 text-sm outline-none text-delabie-text placeholder-delabie-gray-dark"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.brandId}
            onChange={e => handleChange('brandId', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-delabie-text outline-none focus:ring-2 focus:ring-delabie-blue/30"
          >
            <option value="">Toutes les marques</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filters.productId}
            onChange={e => handleChange('productId', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-delabie-text outline-none focus:ring-2 focus:ring-delabie-blue/30"
          >
            <option value="">Tous les produits</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>
            ))}
          </select>
          {showTypeFilter && typeOptions.length > 0 && (
            <select
              value={filters.type}
              onChange={e => handleChange('type', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-delabie-text outline-none focus:ring-2 focus:ring-delabie-blue/30"
            >
              <option value="">Tous les types</option>
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {showStatusFilter && statusOptions.length > 0 && (
            <select
              value={filters.status}
              onChange={e => handleChange('status', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-delabie-text outline-none focus:ring-2 focus:ring-delabie-blue/30"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {showPriorityFilter && (
            <select
              value={filters.priority}
              onChange={e => handleChange('priority', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-delabie-text outline-none focus:ring-2 focus:ring-delabie-blue/30"
            >
              <option value="">Toutes les priorités</option>
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
              <option value="URGENT">Urgente</option>
            </select>
          )}
        </div>
      </div>
    </div>
  )
}
