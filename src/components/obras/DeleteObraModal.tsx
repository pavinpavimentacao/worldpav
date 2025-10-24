import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '../shared/Button'

interface DeleteObraModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  obraNome: string
  loading: boolean
}

export function DeleteObraModal({
  isOpen,
  onClose,
  onConfirm,
  obraNome,
  loading
}: DeleteObraModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Excluir Obra
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Tem certeza que deseja excluir a obra <strong>{obraNome}</strong>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Atenção:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Esta ação não pode ser desfeita</li>
                  <li>A obra será marcada como excluída</li>
                  <li>Todos os dados relacionados permanecerão no sistema</li>
                  <li>Ruas, financeiro e notas fiscais serão mantidos</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            A obra não aparecerá mais na listagem, mas poderá ser restaurada por um administrador se necessário.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Excluindo...
              </>
            ) : (
              'Excluir Obra'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


