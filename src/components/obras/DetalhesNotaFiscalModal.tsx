import React from 'react'
import { X, FileText, Calendar, DollarSign, TrendingDown, Eye, Download } from 'lucide-react'
import { Button } from "../shared/Button"
import { formatarStatusNota, diasParaVencimento } from '../../utils/notas-fiscais-utils'
import { formatDateToBR } from '../../utils/date-utils'
import type { ObraNotaFiscal } from '../../types/obras-financeiro'

interface DetalhesNotaFiscalModalProps {
  isOpen: boolean
  onClose: () => void
  nota: ObraNotaFiscal | null
}

export function DetalhesNotaFiscalModal({
  isOpen,
  onClose,
  nota
}: DetalhesNotaFiscalModalProps) {
  if (!isOpen || !nota) return null

  const statusInfo = formatarStatusNota(nota.status)
  const diasVencimento = diasParaVencimento(nota.vencimento)
  const totalDescontos = nota.desconto_inss + nota.desconto_iss + nota.outro_desconto

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Nota Fiscal {nota.numero_nota}
              </h2>
              <span className={`inline-flex mt-1 px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.cor}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Valores Principais */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valores
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Bruto da Nota:</span>
                <span className="text-lg font-bold text-gray-900">
                  R$ {nota.valor_nota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="border-t border-gray-300 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Desconto INSS:</span>
                  <span className="text-sm font-medium text-red-600">
                    - R$ {nota.desconto_inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Desconto ISS:</span>
                  <span className="text-sm font-medium text-red-600">
                    - R$ {nota.desconto_iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {nota.outro_desconto > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Outro Desconto:</span>
                    <span className="text-sm font-medium text-red-600">
                      - R$ {nota.outro_desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-gray-700">Total Descontos:</span>
                  <span className="text-sm font-bold text-red-600">
                    - R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-gray-400 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Valor Líquido:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {nota.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-700">Vencimento</h4>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatDateToBR(nota.vencimento)}
              </p>
              {nota.status === 'pendente' && diasVencimento >= 0 && diasVencimento <= 7 && (
                <p className="text-xs text-orange-600 mt-1">
                  Vence em {diasVencimento} {diasVencimento === 1 ? 'dia' : 'dias'}
                </p>
              )}
              {nota.status === 'vencido' && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  Vencida há {Math.abs(diasVencimento)} {Math.abs(diasVencimento) === 1 ? 'dia' : 'dias'}
                </p>
              )}
            </div>

            {nota.data_pagamento && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-green-700">Data de Pagamento</h4>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {formatDateToBR(nota.data_pagamento)}
                </p>
              </div>
            )}
          </div>

          {/* Observações */}
          {nota.observacoes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Observações</h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {nota.observacoes}
              </p>
            </div>
          )}

          {/* Arquivo da Nota */}
          {nota.arquivo_nota_url && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Arquivo da Nota Fiscal</h4>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">nota-fiscal-{nota.numero_nota}.pdf</p>
                  <p className="text-xs text-gray-500">Documento PDF</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={nota.arquivo_nota_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </a>
                  <a
                    href={nota.arquivo_nota_url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Criado em:</span>
              <p>{formatDateToBR(nota.created_at.split('T')[0])} às {new Date(nota.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>
              <p>{formatDateToBR(nota.updated_at.split('T')[0])} às {new Date(nota.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}






