'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UploadedFile {
  name: string
  status: 'uploading' | 'success' | 'error'
  document?: any
  error?: string
}

interface DragDropUploadProps {
  onUploadComplete?: (document: any) => void
  redirectOnUpload?: boolean
}

export default function DragDropUpload({ onUploadComplete, redirectOnUpload = true }: DragDropUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const router = useRouter()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const fileEntry: UploadedFile = { name: file.name, status: 'uploading' }
      setUploadedFiles(prev => [...prev, fileEntry])

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Échec du téléchargement')

        const document = await response.json()
        setUploadedFiles(prev =>
          prev.map(f => f.name === file.name ? { ...f, status: 'success', document } : f)
        )
        if (redirectOnUpload && document?.id) {
          router.push(`/preview/${document.id}`)
        } else {
          onUploadComplete?.(document)
        }
      } catch {
        setUploadedFiles(prev =>
          prev.map(f => f.name === file.name ? { ...f, status: 'error', error: 'Échec du téléchargement' } : f)
        )
      }
    }
  }, [onUploadComplete, redirectOnUpload, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    multiple: true,
  })

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name))
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-delabie-blue bg-delabie-blue-pale'
            : 'border-gray-200 hover:border-delabie-blue/40 hover:bg-delabie-gray'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragActive ? 'text-delabie-blue' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-delabie-text">
          {isDragActive ? 'Déposez les fichiers ici...' : 'Glissez-déposez des fichiers, ou cliquez pour parcourir'}
        </p>
        <p className="text-xs text-delabie-gray-dark mt-1">PDF, Excel, CSV, Word supportés</p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.name} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3">
              <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm text-delabie-text truncate">{file.name}</span>
              {file.status === 'uploading' && (
                <Loader2 className="w-4 h-4 text-delabie-blue animate-spin flex-shrink-0" />
              )}
              {file.status === 'success' && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              {file.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <button onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
