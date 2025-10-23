import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import {
  ArrowLeft,
  FileText,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Ruler,
  Weight,
  Users,
  Truck,
  Building,
  FileDown,
  MessageSquare
} from 'lucide-react'
import { getRelatorioDiarioById } from '../../lib/relatoriosDiariosApi'
import { RelatorioDiarioCompleto } from '../../types/relatorios-diarios'
import { formatarHorario } from '../../utils/relatorios-diarios-utils'
import { faixaAsfaltoLabels, faixaAsfaltoDescricoes } from '../../types/parceiros'

export function RelatorioDiarioDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [relatorio, setRelatorio] = useState<RelatorioDiarioCompleto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadRelatorio(id)
    }
  }, [id])

  async function loadRelatorio(relatorioId: string) {
    try {
      setLoading(true)
      const data = await getRelatorioDiarioById(relatorioId)
      setRelatorio(data)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-500">Carregando relatório...</p>
        </div>
      </Layout>
    )
  }

  if (!relatorio) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-500">Relatório não encontrado</p>
          <Button
            onClick={() => navigate('/relatorios-diarios')}
            className="mt-4"
          >
            Voltar para Listagem
          </Button>
        </div>
      </Layout>
    )
  }

  const maquinariosProprios = relatorio.maquinarios.filter(m => !m.is_terceiro)
  const maquinariosTerceiros = relatorio.maquinarios.filter(m => m.is_terceiro)

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/relatorios-diarios')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{relatorio.numero}</h1>
              <p className="text-gray-600 mt-1">Relatório Diário</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente e Obra */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Obra</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium text-gray-900">{relatorio.cliente_nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Obra</p>
                  <p className="font-medium text-gray-900">{relatorio.obra_nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Rua</p>
                  <p className="font-medium text-gray-900">{relatorio.rua_nome}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data, Horário e Equipe */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Trabalho</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium text-gray-900">
                    {new Date(relatorio.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {relatorio.data_fim && relatorio.data_fim !== relatorio.data_inicio && (
                      <> até {new Date(relatorio.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Horário de Início</p>
                  <p className="font-medium text-gray-900">{formatarHorario(relatorio.horario_inicio)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {relatorio.equipe_is_terceira ? (
                  <Building className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Users className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Equipe</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {relatorio.equipe_nome || 'Não informada'}
                    </p>
                    {relatorio.equipe_is_terceira && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                        Terceira
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas da Execução</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Ruler className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{relatorio.metragem_feita.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Metragem (m²)</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Weight className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{relatorio.toneladas_aplicadas.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Toneladas Aplicadas</p>
            </div>

            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center text-amber-600 font-bold text-lg">
                cm
              </div>
              <p className="text-3xl font-bold text-gray-900">{relatorio.espessura_calculada.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Espessura Calculada (cm)</p>
            </div>

            {relatorio.faixa_utilizada && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {faixaAsfaltoLabels[relatorio.faixa_utilizada]}
                </p>
                <p className="text-xs text-gray-600 mt-1">Faixa de Asfalto</p>
              </div>
            )}
          </div>

          {/* Descrição da faixa */}
          {relatorio.faixa_utilizada && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Sobre a {faixaAsfaltoLabels[relatorio.faixa_utilizada]}:</strong> {faixaAsfaltoDescricoes[relatorio.faixa_utilizada]}
              </p>
            </div>
          )}
        </div>

        {/* Maquinários */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maquinários Utilizados</h3>
          
          {/* Próprios */}
          {maquinariosProprios.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Maquinários Próprios</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {maquinariosProprios.map(maq => (
                  <div key={maq.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-gray-900">{maq.maquinario_nome}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terceiros */}
          {maquinariosTerceiros.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">Maquinários de Terceiros</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {maquinariosTerceiros.map(maq => (
                  <div key={maq.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-900">{maq.maquinario_nome}</p>
                    {maq.parceiro_nome && (
                      <p className="text-sm text-orange-700 mt-1">{maq.parceiro_nome}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatorio.maquinarios.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhum maquinário registrado</p>
          )}
        </div>

        {/* Observações */}
        {relatorio.observacoes && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Observações</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{relatorio.observacoes}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default RelatorioDiarioDetails

