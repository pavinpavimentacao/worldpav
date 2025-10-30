import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '../shared/Button'
import { DocumentacaoAPI, type DocumentacaoFormData, type DocumentacaoWithDetails } from '../../lib/documentacao-api'
import { supabase } from '../../lib/supabase'

interface EditarDocumentacaoModalProps {
  isOpen: boolean
  onClose: () => void
  documentacao: DocumentacaoWithDetails
  onSuccess?: () => void
}

export function EditarDocumentacaoModal({ isOpen, onClose, documentacao, onSuccess }: EditarDocumentacaoModalProps) {
  const [loading, setLoading] = useState(false)
  const [obras, setObras] = useState<Array<{ id: string; name: string }>>([])
  const [ruas, setRuas] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState<Partial<DocumentacaoFormData>>({
    client_id: documentacao.client_id,
    obra_id: documentacao.obra_id || undefined,
    name: documentacao.name,
    type: documentacao.type,
    category: documentacao.category || '',
    status: documentacao.status,
    valid_from: documentacao.valid_from || undefined,
    valid_until: documentacao.valid_until || undefined,
    observations: documentacao.observations || ''
  })

  useEffect(() => {
    if (isOpen && documentacao) {
      fetchObras()
      setFormData({
        client_id: documentacao.client_id,
        obra_id: documentacao.obra_id || undefined,
        name: documentacao.name,
        type: documentacao.type,
        category: documentacao.category || '',
        status: documentacao.status,
        valid_from: documentacao.valid_from || undefined,
        valid_until: documentacao.valid_until || undefined,
        observations: documentacao.observations || ''
      })
      
      // Buscar ruas se tiver obra
      if (documentacao.obra_id) {
        fetchRuas(documentacao.obra_id)
      }
    }
  }, [isOpen, documentacao])

  const fetchObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('id, name')
        .eq('client_id', documentacao.client_id)
        .order('name')

      if (error) throw error
      setObras(data || [])
    } catch (error) {
      console.error('Erro ao buscar obras:', error)
    }
  }

  const fetchRuas = async (obraId: string) => {
    try {
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('id, name')
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      setRuas(data || [])
    } catch (error) {
      console.error('Erro ao buscar ruas:', error)
      setRuas([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data: Partial<DocumentacaoFormData> = {
        obra_id: formData.obra_id,
        name: formData.name!,
        type: formData.type!,
        category: formData.category,
        status: formData.status!,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        observations: formData.observations
      }

      await DocumentacaoAPI.update(documentacao.id, data)
      
      alert('Documentação atualizada com sucesso!')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao atualizar documentação:', error)
      alert(error.message || 'Erro ao atualizar documentação.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Editar Documentação</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Documentação *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="nrs">NRS</option>
                <option value="licenca">Licença</option>
                <option value="certificado">Certificado</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ativo">Ativo</option>
                <option value="vencido">Vencido</option>
                <option value="proximo_vencimento">Próximo Vencimento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria (Opcional)</label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obra (Opcional)</label>
            <select
              value={formData.obra_id || ''}
              onChange={(e) => {
                const obraId = e.target.value
                setFormData({ ...formData, obra_id: obraId || undefined })
                // Buscar ruas quando uma obra for selecionada
                if (obraId) {
                  fetchRuas(obraId)
                } else {
                  setRuas([])
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma obra</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>{obra.name}</option>
              ))}
            </select>
          </div>

          {/* Rua */}
          {formData.obra_id && ruas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rua Específica (Opcional)
              </label>
              <select
                onChange={(e) => {
                  const ruaSelecionada = e.target.value
                  const ruaNome = ruas.find(r => r.id === ruaSelecionada)?.name
                  if (ruaNome) {
                    const obsAtual = formData.observations || ''
                    const obsNova = obsAtual ? `${obsAtual}\nRua: ${ruaNome}` : `Rua: ${ruaNome}`
                    setFormData({ ...formData, observations: obsNova })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma rua</option>
                {ruas.map((rua) => (
                  <option key={rua.id} value={rua.id}>{rua.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                A rua selecionada será adicionada automaticamente nas observações
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válido De (Opcional)</label>
              <input
                type="date"
                value={formData.valid_from || ''}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válido Até (Opcional)</label>
              <input
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (Opcional)</label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
