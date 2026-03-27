import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FileText, Download, File, BookOpen, Receipt, Wrench, Package } from 'lucide-react'

interface Document {
  id: string
  name: string
  originalName?: string
  type: string
  fileSize?: number
  brand?: { name: string } | null
  product?: { name: string } | null
  uploadedAt?: string | Date
  createdAt?: string | Date
  confirmed?: boolean
}

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  FICHE_TECHNIQUE: { label: 'Fiche technique', icon: FileText,  color: 'text-blue-600 bg-blue-100' },
  CATALOGUE:       { label: 'Catalogue',        icon: BookOpen,  color: 'text-indigo-600 bg-indigo-100' },
  MANUEL:          { label: 'Manuel',            icon: BookOpen,  color: 'text-purple-600 bg-purple-100' },
  BON_COMMANDE:    { label: 'Bon de commande',   icon: Receipt,   color: 'text-green-600 bg-green-100' },
  AUTRE:           { label: 'Autre',             icon: File,      color: 'text-gray-600 bg-gray-100' },
  MANUAL:          { label: 'Manuel',            icon: BookOpen,  color: 'text-purple-600 bg-purple-100' },
  INVOICE:         { label: 'Facture',           icon: Receipt,   color: 'text-green-600 bg-green-100' },
  SPECIFICATION:   { label: 'Spécification',     icon: FileText,  color: 'text-blue-600 bg-blue-100' },
  WARRANTY:        { label: 'Garantie',          icon: Wrench,    color: 'text-orange-600 bg-orange-100' },
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '—'
  const k = 1024
  const sizes = ['o', 'Ko', 'Mo', 'Go']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function DocumentCard({ document }: { document: Document }) {
  const typeInfo = typeConfig[document.type] || typeConfig.AUTRE
  const TypeIcon = typeInfo.icon
  const date = document.uploadedAt || document.createdAt

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
          <TypeIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-delabie-text text-sm line-clamp-2">{document.name || document.originalName}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
      </div>
      <div className="space-y-1 mb-4">
        {document.brand && (
          <p className="text-xs text-delabie-gray-dark">
            <span className="font-medium">Marque :</span> {document.brand.name}
          </p>
        )}
        {document.product && (
          <p className="text-xs text-delabie-gray-dark">
            <span className="font-medium">Produit :</span> {document.product.name}
          </p>
        )}
        <p className="text-xs text-gray-400">
          {document.fileSize ? formatFileSize(document.fileSize) + ' • ' : ''}
          {date ? format(new Date(date as string), 'd MMM yyyy', { locale: fr }) : ''}
        </p>
      </div>
      <a
        href={`/api/documents/${document.id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-delabie-blue border border-delabie-blue/30 rounded-lg py-2 hover:bg-delabie-blue-pale transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Télécharger
      </a>
    </div>
  )
}
