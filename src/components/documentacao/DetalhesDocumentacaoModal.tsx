import React from 'react'
import { X } from 'lucide-react'
import { Button } from '../shared/Button'
import { Badge } from '../shared/Badge'
import { DocumentacaoAPI, type DocumentacaoWithDetails } from '../../lib/documentacao-api'
import { format } from 'date-fns'

interface DetalhesDocumentacaoModalProps {
  documentacao: DocumentacaoWithDetails
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'ativo':
      return 'success'
    case 'vencido':
      return 'danger'
    case 'proximo_vencimento':
      return 'warning'
    default:
      return 'default'
  }
}

export function DetalhesDocumentacaoModal({ documentacao, onClose, onEdit, onDelete }: DetalhesDocumentacaoModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Badge variant={getStatusVariant(documentacao.status)}>
              {documentacao.status.toUpperCase().replace('_', ' ')}
            </Badge>
            <h3 className="text-lg font-semibold text-gray-900">{documentacao.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
              <p className="text-gray-900 capitalize">{documentacao.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Categoria</label>
              <p className="text-gray-900">{documentacao.category || 'Não especificada'}</p>
            </div>
          </div>

          {/* Datas de Validade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Válido De</label>
              <p className="text-gray-900">{documentacao.valid_from ? format(new Date(documentacao.valid_from), 'dd/MM/yyyy') : 'Não especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Válido Até</label>
              <p className="text-gray-900">{documentacao.valid_until ? format(new Date(documentacao.valid_until), 'dd/MM/yyyy') : 'Indefinido'}</p>
            </div>
          </div>

          {/* Relacionamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
              <p className="text-gray-900">{documentacao.cliente_nome || 'Cliente não informado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Obra</label>
              <p className="text-gray-900">{documentacao.obra_nome || 'Não vinculada a obra específica'}</p>
            </div>
          </div>

          {/* Observações */}
          {documentacao.observations && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Observações</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{documentacao.observations}</p>
              </div>
            </div>
          )}

          {/* Documento */}
          {documentacao.file_path && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Documento</label>
              <div className="flex items-center gap-3">
                <span className="text-gray-700">📄 {documentacao.file_name || 'Documento anexado'}</span>
                <Button variant="outline" size="sm">
                  Visualizar
                </Button>
              </div>
            </div>
          )}

          {/* Informações de Auditoria */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Criado em</label>
                <p className="text-gray-600">{format(new Date(documentacao.created_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Última atualização</label>
                <p className="text-gray-600">{format(new Date(documentacao.updated_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {onDelete && (
            <Button
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
