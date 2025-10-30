import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '../shared/Button'
import { ContratosAPI, type ContratoFormData } from '../../lib/contratos-api'
import { supabase } from '../../lib/supabase'

interface NovoContratoModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  onSuccess?: () => void
  obraId?: string | null
}

export function NovoContratoModal({ isOpen, onClose, clientId, onSuccess, obraId }: NovoContratoModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [obras, setObras] = useState<Array<{ id: string; name: string }>>([])
  const [ruas, setRuas] = useState<Array<{ id: string; name: string }>>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Partial<ContratoFormData>>({
    client_id: clientId,
    obra_id: obraId || undefined,
    name: '',
    type: 'contrato',
    status: 'ativo',
    value: undefined,
    start_date: new Date().toISOString().split('T')[0],
    end_date: undefined,
    observations: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchObras()
    }
  }, [isOpen, clientId])

  const fetchObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('id, name')
        .eq('client_id', clientId)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null

    setUploading(true)
    try {
      // Gerar nome único para o arquivo
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `contratos/${clientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from('contratos-documentacao')
        .upload(fileName, selectedFile)

      if (error) throw error

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('contratos-documentacao')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Fazer upload do arquivo se houver
      let fileUrl: string | undefined = undefined
      let fileName: string | undefined = undefined
      
      if (selectedFile) {
        const url = await uploadFile()
        if (url) {
          fileUrl = url
          fileName = selectedFile.name
        }
      }

      const data: ContratoFormData = {
        client_id: clientId,
        obra_id: formData.obra_id,
        name: formData.name!,
        type: formData.type!,
        status: formData.status!,
        value: formData.value,
        start_date: formData.start_date!,
        end_date: formData.end_date,
        observations: formData.observations,
        file_path: fileUrl,
        file_name: fileName
      }

      await ContratosAPI.create(data)
      
      alert('Contrato criado com sucesso!')
      onSuccess?.()
      onClose()
      
      // Reset form
      setFormData({
        client_id: clientId,
        obra_id: obraId || undefined,
        name: '',
        type: 'contrato',
        status: 'ativo',
        value: undefined,
        start_date: new Date().toISOString().split('T')[0],
        end_date: undefined,
        observations: ''
      })
    } catch (error: any) {
      console.error('Erro ao criar contrato:', error)
      alert(error.message || 'Erro ao criar contrato.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Novo Contrato</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Contrato *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Contrato de Pavimentação - Rua X"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="contrato">Contrato</option>
                <option value="proposta">Proposta</option>
                <option value="termo">Termo</option>
                <option value="aditivo">Aditivo</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ativo">Ativo</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Obra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obra (Opcional)
            </label>
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
            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Fim (Opcional)
              </label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informações adicionais sobre o contrato..."
            />
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexar Arquivo (Opcional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf,image/jpeg,image/png,image/jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {uploading && (
              <p className="text-sm text-blue-600 mt-1">Fazendo upload...</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
