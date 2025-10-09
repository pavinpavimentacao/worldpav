import React, { useState, useRef } from 'react'
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react'

interface PhotoUploadProps {
  value?: string | null
  onChange: (file: File | null, preview: string | null) => void
  className?: string
  disabled?: boolean
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        onChange(file, preview)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemovePhoto = () => {
    onChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Foto do Maquinário
      </label>
      
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${value ? 'border-solid border-primary-300 bg-primary-25' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {value ? (
          // Photo Preview
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview do maquinário"
                className="w-32 h-32 object-cover rounded-lg shadow-sm border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemovePhoto()
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Clique para alterar a foto
            </div>
          </div>
        ) : (
          // Upload Placeholder
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                <span>Clique para upload ou arraste uma imagem</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG até 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Adicione uma foto para facilitar a identificação visual do maquinário.
      </p>
    </div>
  )
}
