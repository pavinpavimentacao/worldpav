import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../lib/toast-hooks'
import { Button } from '../shared/Button'

interface FileUploadProps {
  onFileUploaded: (filePath: string, fileName: string) => void
  accept?: string
  maxSize?: number // em MB
  folder?: string
  disabled?: boolean
}

export function FileUpload({ 
  onFileUploaded, 
  accept = "*", 
  maxSize = 10, 
  folder = "uploads",
  disabled = false 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      addToast({ 
        message: `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`, 
        type: 'error' 
      })
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${folder}/${fileName}`

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro no upload:', error)
        addToast({ 
          message: `Erro ao fazer upload: ${error.message}`, 
          type: 'error' 
        })
        return
      }

      // Simular progresso (Supabase não fornece progresso real)
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Chamar callback com os dados do arquivo
      onFileUploaded(data.path, file.name)
      
      addToast({ 
        message: 'Arquivo enviado com sucesso!', 
        type: 'success' 
      })

    } catch (error: any) {
      console.error('Erro no upload:', error)
      addToast({ 
        message: `Erro ao fazer upload: ${error.message}`, 
        type: 'error' 
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || uploading}
        className="w-full"
      >
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            <span>Enviando... {uploadProgress}%</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>📁</span>
            <span>Selecionar Arquivo</span>
          </div>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Tamanho máximo: {maxSize}MB
      </p>
    </div>
  )
}

// Hook para gerenciar arquivos
export function useFileUpload() {
  const [uploadedFile, setUploadedFile] = useState<{
    path: string
    name: string
  } | null>(null)

  const handleFileUploaded = (filePath: string, fileName: string) => {
    setUploadedFile({ path: filePath, name: fileName })
  }

  const clearFile = () => {
    setUploadedFile(null)
  }

  return {
    uploadedFile,
    handleFileUploaded,
    clearFile
  }
}
