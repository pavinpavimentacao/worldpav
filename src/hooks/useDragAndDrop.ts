/**
 * Hook reutilizável para gerenciar drag and drop de arquivos
 * Resolve problemas comuns como:
 * - onDragLeave disparando ao passar sobre elementos filhos
 * - Estado de arrastar inconsistente
 * - Eventos não sendo prevenidos corretamente
 */

import { useState, useCallback, useRef } from 'react'

interface UseDragAndDropOptions {
  onDrop: (files: FileList | File[]) => void
  disabled?: boolean
  multiple?: boolean
}

export function useDragAndDrop({ onDrop, disabled = false, multiple = true }: UseDragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // NÃO fazer stopPropagation para não bloquear clicks
    
    if (disabled) return
    
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // NÃO fazer stopPropagation aqui para não bloquear outros eventos
    
    if (disabled) return
    
    // Necessário para permitir o drop
    e.dataTransfer.dropEffect = 'copy'
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // NÃO fazer stopPropagation
    
    if (disabled) return
    
    dragCounter.current--
    
    // Só remove o estado de arrastar quando sair completamente do componente
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [disabled])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) return
    
    setIsDragging(false)
    dragCounter.current = 0
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = multiple ? e.dataTransfer.files : [e.dataTransfer.files[0]]
      onDrop(files)
    }
  }, [disabled, multiple, onDrop])

  const reset = useCallback(() => {
    setIsDragging(false)
    dragCounter.current = 0
  }, [])

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    reset
  }
}

