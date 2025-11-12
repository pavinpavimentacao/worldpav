import React, { useState, useEffect } from 'react'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2,
  FileText
} from 'lucide-react'
import { Obra } from '../../lib/obrasApi'
import { getServicosObra, calcularValorExecutadoPorMetragem } from '../../lib/obrasServicosApi'

interface ObraVisaoGeralTabProps {
  obraId: string
  obra: Obra
}

export function ObraVisaoGeralTab({ obraId, obra }: ObraVisaoGeralTabProps) {
  const [faturamentoPrevisto, setFaturamentoPrevisto] = useState<number>(0)
  const [valorExecutado, setValorExecutado] = useState<number>(0)
  
  useEffect(() => {
    async function carregarDadosFinanceiros() {
      try {
        // Buscar serviços da obra
        const servicos = await getServicosObra(obraId)
        
        // Faturamento Previsto = volume_planejamento da obra × Preço dos serviços
        const volumePlanejamento = obra.volume_planejamento || 0
        const precoTotalServicos = servicos.reduce((total, servico) => 
          total + servico.preco_unitario, 0
        )
        const previstoCalculado = volumePlanejamento * precoTotalServicos
        setFaturamentoPrevisto(previstoCalculado)
        console.log('📋 Faturamento Previsto:', { volumePlanejamento, precoTotalServicos, total: previstoCalculado })
        
        // Valor Executado = Metragem executada real das ruas × Preço por m²
        if (obra.status === 'concluida' && obra.executed_value) {
          setValorExecutado(obra.executed_value)
          console.log('🏁 Obra concluída - Valor congelado:', obra.executed_value)
        } else {
          // Calcular valor executado baseado na metragem REAL executada das ruas
          const valorExecutadoReal = await calcularValorExecutadoPorMetragem(obraId)
          setValorExecutado(valorExecutadoReal)
          console.log('🔄 Valor Executado (metragem real executada):', valorExecutadoReal)
        }
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error)
      }
    }
    
    carregarDadosFinanceiros()
  }, [obraId, obra.status, obra.executed_value, obra.volume_planejamento])
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Informações da Obra */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {obra.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="text-sm text-gray-900">{obra.client?.name || 'Não informado'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Localização</p>
              <p className="text-sm text-gray-900">
                {obra.location || obra.city}/{obra.state}
              </p>
            </div>
          </div>

          {obra.start_date && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Início</p>
                <p className="text-sm text-gray-900">{formatDate(obra.start_date)}</p>
              </div>
            </div>
          )}

          {obra.expected_end_date && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Previsão de Conclusão</p>
                <p className="text-sm text-gray-900">{formatDate(obra.expected_end_date)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Faturamento Previsto</h3>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(faturamentoPrevisto || 0)}
          </div>
          <div className="text-sm text-gray-500">
            Valor total previsto
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Valor Executado</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(valorExecutado)}
          </div>
          <div className="text-sm text-gray-500">
            {obra.status === 'concluida' 
              ? 'Valor final executado (congelado)' 
              : 'Metragem executada × preço dos serviços'
            }
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Saldo a Executar</h3>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {formatCurrency(faturamentoPrevisto - valorExecutado)}
          </div>
          <div className="text-sm text-gray-500">
            Restante do faturamento
          </div>
        </div>
      </div>

      {/* Detalhes Completos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detalhes da Obra
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Nome da Obra</p>
              <p className="text-sm text-gray-900">{obra.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cliente</p>
              <p className="text-sm text-gray-900">{obra.client?.name || 'Não informado'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Região/Bairro</p>
              <p className="text-sm text-gray-900">{obra.location || obra.city || 'Não informado'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cidade/Estado</p>
              <p className="text-sm text-gray-900">{obra.city}/{obra.state}</p>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            {obra.start_date && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Data de Início</p>
                <p className="text-sm text-gray-900">{formatDate(obra.start_date)}</p>
              </div>
            )}

            {obra.expected_end_date && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Previsão de Conclusão</p>
                <p className="text-sm text-gray-900">{formatDate(obra.expected_end_date)}</p>
              </div>
            )}

            {obra.end_date && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Data de Conclusão</p>
                <p className="text-sm text-gray-900">{formatDate(obra.end_date)}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">ID da Obra</p>
              <p className="text-xs text-gray-600 font-mono">{obra.id}</p>
            </div>
          </div>
        </div>

        {/* Descrição e Observações */}
        {(obra.description || obra.observations) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {obra.description && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição
                </p>
                <p className="text-sm text-gray-900">{obra.description}</p>
              </div>
            )}

            {obra.observations && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </p>
                <p className="text-sm text-gray-900">{obra.observations}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aviso sobre Ruas */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">📍 Adicione as Ruas da Obra</p>
            <p className="mt-1">
              Para acompanhar o progresso real da obra (metragem, toneladas, etc.), 
              adicione as ruas na aba <strong>"Ruas"</strong>. 
              Os dados de execução serão calculados automaticamente com base nas ruas cadastradas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
