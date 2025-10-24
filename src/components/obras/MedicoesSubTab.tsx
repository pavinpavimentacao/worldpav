import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, Download, Trash2, FileText, Calendar, Info } from 'lucide-react'
import { Button } from "../shared/Button"
import { useToast } from '../../lib/toast-hooks'
import { getMedicoesByObra, deleteMedicao } from '../../lib/obrasMedicoesApi'
import { getNotasFiscaisByObra } from '../../lib/obrasNotasFiscaisApi'
import { formatDateToBR } from '../../utils/date-utils'
import { AdicionarMedicaoModal } from './AdicionarMedicaoModal'
import { DetalhesMedicaoModal } from './DetalhesMedicaoModal'
import type { ObraMedicao, ObraNotaFiscal } from '../../types/obras-financeiro'

// Modo de produção - conectado ao banco de dados
const USE_MOCK = false

const mockMedicoes: ObraMedicao[] = [
  {
    id: '1',
    obra_id: '1',
    nota_fiscal_id: '2',
    descricao: 'Medição referente ao mês de Janeiro/2025 - Ruas A, B e C',
    arquivo_medicao_url: 'https://exemplo.com/medicoes/medicao-janeiro-2025.xlsx',
    data_medicao: '2025-01-31',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    descricao: 'Levantamento topográfico inicial - Todas as ruas',
    arquivo_medicao_url: 'https://exemplo.com/medicoes/levantamento-inicial.pdf',
    data_medicao: '2024-12-15',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    obra_id: '1',
    nota_fiscal_id: '1',
    descricao: 'Medição Fevereiro/2025 - Ruas D, E e F',
    arquivo_medicao_url: 'https://exemplo.com/medicoes/medicao-fevereiro-2025.xlsx',
    data_medicao: '2025-02-10',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockNotasFiscais: ObraNotaFiscal[] = [
  {
    id: '1',
    obra_id: '1',
    numero_nota: 'NF-2025-001',
    valor_nota: 45000.00,
    vencimento: '2025-02-15',
    desconto_inss: 1350.00,
    desconto_iss: 900.00,
    outro_desconto: 0,
    valor_liquido: 42750.00,
    status: 'pendente',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    numero_nota: 'NF-2025-002',
    valor_nota: 38500.00,
    vencimento: '2025-01-28',
    desconto_inss: 1155.00,
    desconto_iss: 770.00,
    outro_desconto: 200.00,
    valor_liquido: 36375.00,
    status: 'pago',
    data_pagamento: '2025-01-25',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

interface MedicoesSubTabProps {
  obraId: string
}

export function MedicoesSubTab({ obraId }: MedicoesSubTabProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [medicoes, setMedicoes] = useState<ObraMedicao[]>([])
  const [notasFiscais, setNotasFiscais] = useState<Map<string, ObraNotaFiscal>>(new Map())
  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [medicaoSelecionada, setMedicaoSelecionada] = useState<ObraMedicao | null>(null)

  useEffect(() => {
    loadData()
  }, [obraId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setMedicoes(mockMedicoes)
        
        // Criar mapa de notas fiscais para lookup rápido
        const notasMap = new Map<string, ObraNotaFiscal>()
        mockNotasFiscais.forEach(nota => notasMap.set(nota.id, nota))
        setNotasFiscais(notasMap)
      } else {
        // Carregar medições e notas fiscais em paralelo
        const [medicoesData, notasData] = await Promise.all([
          getMedicoesByObra(obraId),
          getNotasFiscaisByObra(obraId)
        ])
        
        setMedicoes(medicoesData)
        
        // Criar mapa de notas fiscais para lookup rápido
        const notasMap = new Map<string, ObraNotaFiscal>()
        notasData.forEach(nota => notasMap.set(nota.id, nota))
        setNotasFiscais(notasMap)
      }
    } catch (error) {
      console.error('Erro ao carregar medições:', error)
      addToast({
        type: 'error',
        message: 'Erro ao carregar medições'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (medicao: ObraMedicao) => {
    if (!confirm(`Tem certeza que deseja excluir esta medição?`)) {
      return
    }

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setMedicoes(medicoes.filter(m => m.id !== medicao.id))
        addToast({
          type: 'success',
          message: 'Medição excluída com sucesso'
        })
      } else {
        await deleteMedicao(medicao.id)
        addToast({
          type: 'success',
          message: 'Medição excluída com sucesso'
        })
        loadData()
      }
    } catch (error) {
      console.error('Erro ao excluir medição:', error)
      addToast({
        type: 'error',
        message: 'Erro ao excluir medição'
      })
    }
  }

  const handleVerDetalhes = (medicao: ObraMedicao) => {
    setMedicaoSelecionada(medicao)
    setModalDetalhes(true)
  }

  const getIconByFileType = (url: string) => {
    if (url.endsWith('.pdf')) {
      return <FileText className="h-12 w-12 text-red-500" />
    }
    return <FileSpreadsheet className="h-12 w-12 text-green-500" />
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Medições</h3>
            <p className="text-sm text-gray-500">
              {medicoes.length} {medicoes.length === 1 ? 'medição cadastrada' : 'medições cadastradas'}
            </p>
          </div>
          <Button onClick={() => setModalAdicionar(true)}>
            Nova Medição
          </Button>
        </div>

        {/* Lista de Medições */}
        {medicoes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Nenhuma medição cadastrada
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Comece adicionando a primeira medição desta obra
            </p>
            <Button onClick={() => setModalAdicionar(true)} variant="outline">
              Adicionar Medição
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicoes.map((medicao) => {
              const notaVinculada = medicao.nota_fiscal_id 
                ? notasFiscais.get(medicao.nota_fiscal_id)
                : null

              return (
                <div
                  key={medicao.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Ícone e Descrição */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {getIconByFileType(medicao.arquivo_medicao_url)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {medicao.descricao}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateToBR(medicao.data_medicao)}
                      </div>
                    </div>
                  </div>

                  {/* Nota Fiscal Vinculada */}
                  {notaVinculada && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <span className="text-blue-700 font-medium">
                        Vinculada à Nota {notaVinculada.numero_nota}
                      </span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleVerDetalhes(medicao)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
                      title="Ver detalhes"
                    >
                      <Info className="h-4 w-4" />
                      Detalhes
                    </button>
                    <a
                      href={medicao.arquivo_medicao_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-md hover:bg-green-100 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(medicao)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                      title="Excluir medição"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modais */}
      <AdicionarMedicaoModal
        isOpen={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        obraId={obraId}
        onSuccess={loadData}
      />

      <DetalhesMedicaoModal
        isOpen={modalDetalhes}
        onClose={() => {
          setModalDetalhes(false)
          setMedicaoSelecionada(null)
        }}
        medicao={medicaoSelecionada}
        notaFiscalVinculada={medicaoSelecionada?.nota_fiscal_id ? notasFiscais.get(medicaoSelecionada.nota_fiscal_id) : null}
      />
    </>
  )
}

