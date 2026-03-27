'use client'

import { useState, useEffect } from 'react'
import FilterBar, { FilterValues } from '@/components/ui/FilterBar'
import DocumentCard from '@/components/documents/DocumentCard'
import { BookOpen, Loader2 } from 'lucide-react'

const DOC_TYPE_OPTIONS = [
  { value: 'FICHE_TECHNIQUE', label: 'Fiche technique' },
  { value: 'CATALOGUE',       label: 'Catalogue' },
  { value: 'MANUEL',          label: 'Manuel' },
  { value: 'BON_COMMANDE',    label: 'Bon de commande' },
  { value: 'AUTRE',           label: 'Autre' },
]

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async (f?: FilterValues) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (f?.search)  params.set('search', f.search)
    if (f?.brandId) params.set('brandId', f.brandId)
    if (f?.productId) params.set('productId', f.productId)
    if (f?.type)    params.set('type', f.type)

    try {
      const res = await fetch(`/api/documents?${params}`)
      const data = await res.json()
      setDocuments(Array.isArray(data) ? data : [])
    } catch {
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocuments() }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-delabie-text flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-delabie-blue" />
          Base de connaissances
        </h1>
        <p className="text-delabie-gray-dark text-sm mt-1">Parcourir et rechercher tous les documents</p>
      </div>

      <div className="mb-6">
        <FilterBar
          onFilterChange={fetchDocuments}
          showTypeFilter
          typeOptions={DOC_TYPE_OPTIONS}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-delabie-blue animate-spin" />
        </div>
      ) : documents.length > 0 ? (
        <>
          <p className="text-sm text-delabie-gray-dark mb-4">
            {documents.length} document{documents.length !== 1 ? 's' : ''} trouvé{documents.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-delabie-gray-dark">Aucun document trouvé. Ajustez les filtres ou importez de nouveaux documents.</p>
        </div>
      )}
    </div>
  )
}
