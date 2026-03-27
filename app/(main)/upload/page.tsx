'use client'

import { useState } from 'react'
import DragDropUpload from '@/components/ui/DragDropUpload'
import DocumentCard from '@/components/documents/DocumentCard'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])

  const handleUploadComplete = (doc: any) => {
    setUploadedDocs(prev => [doc, ...prev])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-delabie-text flex items-center gap-2">
          <Upload className="w-7 h-7 text-delabie-blue" />
          Importer des documents
        </h1>
        <p className="text-delabie-gray-dark text-sm mt-1">
          Importez des PDF, Excel, CSV ou Word dans la base de connaissances. L&apos;IA classifie et extrait automatiquement les métadonnées.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <DragDropUpload onUploadComplete={handleUploadComplete} redirectOnUpload />
      </div>

      {uploadedDocs.length > 0 && (
        <div>
          <h2 className="font-semibold text-delabie-text mb-4">Vient d&apos;être importé</h2>
          <div className="grid grid-cols-2 gap-4">
            {uploadedDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
