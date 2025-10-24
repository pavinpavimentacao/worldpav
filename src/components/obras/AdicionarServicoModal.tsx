import React, { useState, useEffect } from 'react'
import { Dialog } from '../ui/dialog'
import { Button } from '../shared/Button'
import { Select } from '../shared/Select'
import { ServicoObra, Servico } from '../../types/servicos'
import { createServicoObra } from '../../lib/obrasServicosApi'
import { getServicosCatalogo } from '../../lib/servicosCatalogoApi'
import { useToast } from '../../lib/toast-hooks'
import { CurrencyInput } from '../ui/currency-input'
import { NumberInput } from '../ui/number-input-fixed'
import { X } from 'lucide-react'

interface AdicionarServicoModalProps {
  obraId: string
  onClose: () => void
  onSuccess: () => void
}

export function AdicionarServicoModal({ obraId, onClose, onSuccess }: AdicionarServicoModalProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [servicosCatalogo, setServicosCatalogo] = useState<Servico[]>([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true)
  
  const [servicoId, setServicoId] = useState<string>('')
  const [servicoNome, setServicoNome] = useState<string>('')
  const [unidade, setUnidade] = useState<string>('m2')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [precoUnitario, setPrecoUnitario] = useState<number>(0)
  const [observacoes, setObservacoes] = useState<string>('')

  // Carregar catálogo de serviços
  useEffect(() => {
    async function carregarCatalogo() {
      try {
        setCarregandoCatalogo(true)
        const servicos = await getServicosCatalogo()
        setServicosCatalogo(servicos)
      } catch (error) {
        console.error('Erro ao carregar catálogo de serviços:', error)
        addToast({ message: 'Erro ao carregar serviços disponíveis', type: 'error' })
      } finally {
        setCarregandoCatalogo(false)
      }
    }
    
    carregarCatalogo()
  }, [addToast])

  // Atualizar nome e unidade quando o serviço for selecionado
  useEffect(() => {
    if (servicoId) {
      const servicoSelecionado = servicosCatalogo.find(s => s.id === servicoId)
      if (servicoSelecionado) {
        setServicoNome(servicoSelecionado.nome)
        setUnidade(servicoSelecionado.unidade_padrao)
        if (servicoSelecionado.preco_base) {
          setPrecoUnitario(servicoSelecionado.preco_base)
        }
      }
    }
  }, [servicoId, servicosCatalogo])

  // Calcular valor total
  const valorTotal = quantidade * precoUnitario

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!servicoId || !servicoNome || quantidade <= 0 || precoUnitario <= 0) {
      addToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' })
      return
    }
    
    try {
      setLoading(true)
      
      await createServicoObra({
        obra_id: obraId,
        servico_id: servicoId,
        servico_nome: servicoNome,
        quantidade,
        preco_unitario: precoUnitario,
        valor_total: valorTotal,
        unidade,
        observacoes
      })
      
      addToast({ message: 'Serviço adicionado com sucesso!', type: 'success' })
      onSuccess()
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error)
      addToast({ message: 'Erro ao adicionar serviço', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Adicionar Serviço</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            {carregandoCatalogo ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando serviços disponíveis...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Serviço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serviço *
                  </label>
                  <Select
                    value={servicoId}
                    onChange={setServicoId}
                    options={[
                      { value: '', label: 'Selecione um serviço' },
                      ...servicosCatalogo.map(servico => ({
                        value: servico.id,
                        label: servico.nome
                      }))
                    ]}
                    placeholder="Selecione um serviço"
                  />
                </div>
                
                {/* Unidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    className="input bg-gray-50 cursor-not-allowed"
                    value={unidade.toUpperCase()}
                    readOnly
                    disabled
                  />
                </div>
                
                {/* Quantidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade *
                  </label>
                  <NumberInput
                    value={quantidade}
                    onChange={setQuantidade}
                    placeholder="0,00"
                    min={0.01}
                    decimals={2}
                    required
                  />
                </div>
                
                {/* Preço Unitário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Unitário *
                  </label>
                  <CurrencyInput
                    value={precoUnitario}
                    onChange={setPrecoUnitario}
                    placeholder="R$ 0,00"
                  />
                </div>
                
                {/* Valor Total (calculado) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Total
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input bg-gray-50 cursor-not-allowed"
                      value={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Calculado automaticamente: Quantidade × Preço Unitário
                  </p>
                </div>
                
                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    className="input min-h-[80px]"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações sobre este serviço..."
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || carregandoCatalogo}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || carregandoCatalogo || !servicoId}
              >
                {loading ? 'Adicionando...' : 'Adicionar Serviço'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}

