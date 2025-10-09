import React, { useState } from 'react'
import { Button } from './Button'
import { Select } from './Select'
import { Input } from './Input'
import { Textarea } from './ui/textarea'
import { CurrencyInput } from './ui/currency-input'
import { 
  getServicosAtivos, 
  formatPrecoServico, 
  getUnidadeServicoLabel,
  calcularValorServico,
  Servico,
  ServicoObra,
  UnidadeServico
} from '../types/servicos'
import { UnidadeCobranca } from '../types/obras'
import { 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign,
  Calculator,
  Info
} from 'lucide-react'

// Tipo para serviços no formulário (sem obra_id obrigatório)
type ServicoFormulario = Omit<ServicoObra, 'obra_id' | 'created_at'> & {
  obra_id?: string
  created_at?: string
}

interface ServicoSelectorProps {
  servicosObra: ServicoFormulario[]
  unidadeCobrancaObra: UnidadeCobranca
  onServicosChange: (servicos: ServicoFormulario[]) => void
  errors?: any
}

export const ServicoSelector: React.FC<ServicoSelectorProps> = ({
  servicosObra,
  unidadeCobrancaObra,
  onServicosChange,
  errors
}) => {
  const [showAdicionar, setShowAdicionar] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)
  const [unidadeMedida, setUnidadeMedida] = useState<'m2' | 'm3'>('m2')
  const [valorServico, setValorServico] = useState<number>(0)
  const [observacoes, setObservacoes] = useState('')
  const [tipoMobilizacao, setTipoMobilizacao] = useState<'viagem' | 'obra_inteira'>('obra_inteira')

  const servicosDisponiveis = getServicosAtivos()

  const adicionarServico = (e?: React.MouseEvent) => {
    // Prevenir comportamento padrão do formulário
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!servicoSelecionado) return
    
    // Para mobilização/imobilização/serviço, não precisa validar valorServico pois usa valor fixo
    const isServicoEspecial = servicoSelecionado.tipo === 'mobilizacao' || 
                             servicoSelecionado.tipo === 'imobilizacao' || 
                             servicoSelecionado.tipo === 'servico'
    if (!isServicoEspecial && valorServico <= 0) return

    // Para serviços especiais (mobilização, imobilização, serviço), usar valor definido pelo usuário
    let valorFinal = valorServico
    let unidadeFinal = unidadeMedida
    
    if (servicoSelecionado.tipo === 'mobilizacao' || servicoSelecionado.tipo === 'imobilizacao') {
      valorFinal = valorServico // Valor definido pelo usuário
      unidadeFinal = tipoMobilizacao === 'viagem' ? 'viagem' : 'servico' // Por viagem ou obra inteira
    } else if (servicoSelecionado.tipo === 'servico') {
      valorFinal = valorServico // Valor definido pelo usuário
      unidadeFinal = 'servico' // Sempre por serviço
    }

    const novoServico: ServicoFormulario = {
      id: `temp_${Date.now()}`,
      obra_id: '', // Será preenchido quando a obra for criada
      servico_id: servicoSelecionado.id,
      servico_nome: servicoSelecionado.nome,
      quantidade: 1,
      preco_unitario: valorFinal,
      valor_total: valorFinal,
      unidade: unidadeFinal,
      observacoes,
      created_at: new Date().toISOString()
    }

    onServicosChange([...servicosObra, novoServico])
    
    // Reset form
    setServicoSelecionado(null)
    setUnidadeMedida('m2')
    setValorServico(0)
    setObservacoes('')
    setTipoMobilizacao('obra_inteira')
    setShowAdicionar(false)
  }

  const removerServico = (servicoId: string) => {
    onServicosChange(servicosObra.filter(s => s.id !== servicoId))
  }

  const editarServico = (servico: ServicoFormulario) => {
    setServicoSelecionado(servicosDisponiveis.find(s => s.id === servico.servico_id) || null)
    setUnidadeMedida(servico.unidade as 'm2' | 'm3')
    setValorServico(servico.preco_unitario)
    setObservacoes(servico.observacoes || '')
    setTipoMobilizacao(servico.unidade === 'viagem' ? 'viagem' : 'obra_inteira')
    setShowAdicionar(true)
    removerServico(servico.id)
  }

  const getUnidadeLabel = (unidade: UnidadeServico) => {
    return getUnidadeServicoLabel(unidade)
  }

  const totalServicos = servicosObra.reduce((total, servico) => total + servico.valor_total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-blue-600" />
          Serviços da Obra
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowAdicionar(!showAdicionar)
            setTipoMobilizacao('obra_inteira')
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      {/* Lista de Serviços Adicionados */}
      {servicosObra.length > 0 && (
        <div className="space-y-3">
          {servicosObra.map((servico) => (
            <div key={servico.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{servico.servico_nome}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>
                      <strong>Unidade:</strong> {getUnidadeLabel(servico.unidade)}
                    </span>
                    <span>
                      <strong>Valor:</strong> R$ {servico.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {servico.observacoes && (
                    <p className="text-xs text-gray-500 mt-1">{servico.observacoes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editarServico(servico)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removerServico(servico.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Informação sobre Cálculo */}
          <div className="card p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ</span>
              </div>
              <div className="text-sm text-blue-800">
                 <p className="font-medium">📋 Cálculo de Previsão da Obra:</p>
                <p className="mt-1">
                  <strong>Previsão Total =</strong> (Valor por M²/M³ × Volume Previsto) + Mobilização + Imobilização
                </p>
                 <p className="mt-1 text-xs">
                   📋 <strong>DADOS DE PLANEJAMENTO:</strong> Estes são valores estimados baseados no projeto inicial. 
                   Durante a execução, os relatórios diários fornecerão o volume real executado, 
                   permitindo calcular o faturamento efetivo baseado no trabalho realizado.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário para Adicionar Serviço */}
      {showAdicionar && (
        <div 
          className="card p-6 border-2 border-dashed border-blue-300"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-4 w-4 mr-2 text-blue-600" />
            Adicionar Novo Serviço
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção do Serviço */}
            <div>
              <Select
                label="Serviço *"
                value={servicoSelecionado?.id || ''}
                onChange={(servicoId) => {
                  const servico = servicosDisponiveis.find(s => s.id === servicoId)
                  setServicoSelecionado(servico || null)
                }}
                options={[
                  { value: '', label: 'Selecione um serviço' },
                  ...servicosDisponiveis.map(servico => ({
                    value: servico.id,
                    label: servico.nome
                  }))
                ]}
                placeholder="Selecione o serviço"
              />
            </div>

            {/* Unidade de Medida - Apenas para serviços que não sejam mobilização/imobilização/serviço */}
            {servicoSelecionado && servicoSelecionado.tipo !== 'mobilizacao' && servicoSelecionado.tipo !== 'imobilizacao' && servicoSelecionado.tipo !== 'servico' && (
              <div>
                <Select
                  label="Unidade de Medida *"
                  value={unidadeMedida}
                  onChange={setUnidadeMedida}
                  options={[
                    { value: 'm2', label: 'M² (Metro Quadrado)' },
                    { value: 'm3', label: 'M³ (Metro Cúbico)' }
                  ]}
                  placeholder="Selecione a unidade"
                />
              </div>
            )}

            {/* Tipo de Mobilização/Imobilização/Serviço */}
            {servicoSelecionado && (servicoSelecionado.tipo === 'mobilizacao' || servicoSelecionado.tipo === 'imobilizacao' || servicoSelecionado.tipo === 'servico') && (
              <div>
                <Select
                  label="Tipo de Cobrança *"
                  value={tipoMobilizacao}
                  onChange={setTipoMobilizacao}
                  options={servicoSelecionado.tipo === 'servico' ? [
                    { value: 'obra_inteira', label: 'Por Serviço' }
                  ] : [
                    { value: 'obra_inteira', label: 'Obra Inteira' },
                    { value: 'viagem', label: 'Por Viagem' }
                  ]}
                  placeholder="Selecione o tipo"
                />
              </div>
            )}

            {/* Valor do Serviço */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Serviço *
              </label>
              <CurrencyInput
                value={valorServico}
                onChange={setValorServico}
                placeholder="R$ 0,00"
              />
              {servicoSelecionado && (servicoSelecionado.tipo === 'mobilizacao' || servicoSelecionado.tipo === 'imobilizacao') && (
                <p className="mt-1 text-xs text-gray-500">
                  Valor a ser cobrado para {tipoMobilizacao === 'viagem' ? 'cada viagem' : 'toda a obra'}
                </p>
              )}
              {servicoSelecionado && servicoSelecionado.tipo === 'servico' && (
                <p className="mt-1 text-xs text-gray-500">
                  Valor a ser cobrado por serviço
                </p>
              )}
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <Textarea
                label="Observações"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre este serviço..."
                rows={2}
              />
            </div>
          </div>

          {/* Preview do Serviço */}
          {servicoSelecionado && (valorServico > 0 || (servicoSelecionado.tipo === 'mobilizacao' || servicoSelecionado.tipo === 'imobilizacao' || servicoSelecionado.tipo === 'servico')) && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Resumo do Serviço:</p>
                  <div className="mt-1 space-y-1">
                    <p>• <strong>Serviço:</strong> {servicoSelecionado.nome}</p>
                    {servicoSelecionado.tipo === 'mobilizacao' || servicoSelecionado.tipo === 'imobilizacao' ? (
                      <>
                        <p>• <strong>Tipo de Cobrança:</strong> {tipoMobilizacao === 'viagem' ? 'Por Viagem' : 'Obra Inteira'}</p>
                        <p>• <strong>Valor:</strong> R$ {valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </>
                    ) : servicoSelecionado.tipo === 'servico' ? (
                      <>
                        <p>• <strong>Tipo de Cobrança:</strong> Por Serviço</p>
                        <p>• <strong>Valor:</strong> R$ {valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </>
                    ) : (
                      <>
                        <p>• <strong>Unidade:</strong> {unidadeMedida.toUpperCase()}</p>
                        <p>• <strong>Valor:</strong> R$ {valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
                setShowAdicionar(false)
                setServicoSelecionado(null)
                setUnidadeMedida('m2')
                setValorServico(0)
                setObservacoes('')
                setTipoMobilizacao('obra_inteira')
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
                adicionarServico(e)
              }}
              disabled={
                !servicoSelecionado || 
                (servicoSelecionado && servicoSelecionado.tipo !== 'mobilizacao' && servicoSelecionado.tipo !== 'imobilizacao' && servicoSelecionado.tipo !== 'servico' && valorServico <= 0)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Serviço
            </Button>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {servicosObra.length === 0 && !showAdicionar && (
        <div className="card text-center py-8 border-2 border-dashed border-gray-300">
          <Calculator className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço adicionado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Adicione os serviços que serão realizados nesta obra.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAdicionar(true)
                setTipoMobilizacao('obra_inteira')
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Serviço
            </Button>
          </div>
        </div>
      )}

      {/* Erro de validação */}
      {errors && (
        <p className="text-sm text-red-600">{errors.message}</p>
      )}
    </div>
  )
}