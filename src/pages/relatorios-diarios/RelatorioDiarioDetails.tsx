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
import { jsPDF } from 'jspdf'

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

  function handleExportPDF() {
    if (!relatorio) return

    try {
      console.log('🔍 Iniciando exportação PDF do relatório:', relatorio.numero)
      
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Cores
      const primaryColor = [37, 99, 235] // Blue
      const secondaryColor = [107, 114, 128] // Gray
      const accentColor = [249, 115, 22] // Orange

      // Cabeçalho
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.rect(0, 0, pageWidth, 30, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RELATÓRIO DIÁRIO', pageWidth / 2, 18, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.text(relatorio.numero || 'N/A', pageWidth / 2, 26, { align: 'center' })
      
      yPosition = 40
      
      // Informações Gerais
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Informações da Obra', 20, yPosition)
      yPosition += 10
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      
      // Cliente
      pdf.text(`Cliente: ${relatorio.cliente_nome}`, 20, yPosition)
      yPosition += 7
      
      // Obra
      pdf.text(`Obra: ${relatorio.obra_nome}`, 20, yPosition)
      yPosition += 7
      
      // Rua
      pdf.text(`Rua: ${relatorio.rua_nome}`, 20, yPosition)
      yPosition += 7
      
      // Equipe
      const equipeBadge = relatorio.equipe_is_terceira ? ' (Terceira)' : ''
      pdf.text(`Equipe: ${relatorio.equipe_nome || 'Não informada'}${equipeBadge}`, 20, yPosition)
      yPosition += 7
      
      // Data e Horário
      pdf.text(`Data: ${new Date(relatorio.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}`, 20, yPosition)
      yPosition += 7
      pdf.text(`Horário de Início: ${formatarHorario(relatorio.horario_inicio)}`, 20, yPosition)
      yPosition += 10

      // Métricas
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Métricas da Execução', 20, yPosition)
      yPosition += 10
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      
      // Metragem
      pdf.text(`Metragem Executada: ${relatorio.metragem_feita.toFixed(2)} m²`, 20, yPosition)
      yPosition += 7
      
      // Toneladas
      pdf.text(`Toneladas Aplicadas: ${relatorio.toneladas_aplicadas.toFixed(2)} ton`, 20, yPosition)
      yPosition += 7
      
      // Espessura
      pdf.text(`Espessura Calculada: ${relatorio.espessura_calculada.toFixed(2)} cm`, 20, yPosition)
      yPosition += 7
      
      // Faixa
      if (relatorio.faixa_utilizada) {
        pdf.text(`Faixa Utilizada: ${faixaAsfaltoLabels[relatorio.faixa_utilizada]}`, 20, yPosition)
        yPosition += 7
      }
      yPosition += 5

      // Maquinários
      if (relatorio.maquinarios && relatorio.maquinarios.length > 0) {
        const maquinariosProprios = relatorio.maquinarios.filter(m => !m.is_terceiro)
        const maquinariosTerceiros = relatorio.maquinarios.filter(m => m.is_terceiro)

        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Maquinários Utilizados', 20, yPosition)
        yPosition += 10

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')

        if (maquinariosProprios.length > 0) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Maquinários Próprios:', 20, yPosition)
          yPosition += 7
          pdf.setFont('helvetica', 'normal')
          maquinariosProprios.forEach(maq => {
            pdf.text(`• ${maq.maquinario_nome}`, 25, yPosition)
            yPosition += 6
            if (yPosition > pageHeight - 30) {
              pdf.addPage()
              yPosition = 20
            }
          })
        }

        if (maquinariosTerceiros.length > 0) {
          pdf.setFont('helvetica', 'bold')
          pdf.text('Maquinários de Terceiros:', 20, yPosition)
          yPosition += 7
          pdf.setFont('helvetica', 'normal')
          maquinariosTerceiros.forEach(maq => {
            pdf.text(`• ${maq.maquinario_nome}`, 25, yPosition)
            yPosition += 6
            if (maq.parceiro_nome) {
              pdf.text(`  Parceiro: ${maq.parceiro_nome}`, 25, yPosition)
              yPosition += 6
            }
            if (yPosition > pageHeight - 30) {
              pdf.addPage()
              yPosition = 20
            }
          })
        }
      }

      // Observações
      if (relatorio.observacoes) {
        yPosition += 5
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Observações', 20, yPosition)
        yPosition += 10

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        const observations = pdf.splitTextToSize(relatorio.observacoes, pageWidth - 40)
        observations.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 20, yPosition)
          yPosition += 6
        })
      }

      // Rodapé
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(9)
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        pdf.text(
          `WorldPav - Relatório Diário | Página ${i} de ${totalPages} | ${new Date().toLocaleDateString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // Nome do arquivo
      const fileName = `RelatorioDiario_${relatorio.numero}_${new Date().toISOString().split('T')[0]}.pdf`
      
      console.log('✅ PDF gerado com sucesso')
      pdf.save(fileName)
    } catch (error) {
      console.error('❌ Erro ao exportar PDF:', error)
      alert('Erro ao exportar PDF. Tente novamente.')
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
            onClick={handleExportPDF}
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

