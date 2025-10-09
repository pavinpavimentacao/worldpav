import React from 'react'
import { X, Download, ZoomIn } from 'lucide-react'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  title: string
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  title
}) => {
  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = photoUrl
    link.download = `${title.replace(/\s+/g, '_')}_foto.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ZoomIn className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Baixar foto"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Photo */}
          <div className="p-4">
            <div className="flex justify-center">
              <img
                src={photoUrl}
                alt={title}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
            <p className="text-sm text-gray-600 text-center">
              Clique fora da imagem ou pressione ESC para fechar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}






