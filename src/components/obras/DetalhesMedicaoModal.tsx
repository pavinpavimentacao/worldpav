import React from 'react'
import { X, FileSpreadsheet, FileText, Calendar, Download, Eye, Link as LinkIcon } from 'lucide-react'
import { Button } from "../shared/Button"
import { formatDateToBR } from '../../utils/date-utils'
import type { ObraMedicao, ObraNotaFiscal } from '../../types/obras-financeiro'

interface DetalhesMedicaoModalProps {
  isOpen: boolean
  onClose: () => void
  medicao: ObraMedicao | null
  notaFiscalVinculada?: ObraNotaFiscal | null
}

export function DetalhesMedicaoModal({
  isOpen,
  onClose,
  medicao,
  notaFiscalVinculada
}: DetalhesMedicaoModalProps) {
  if (!isOpen || !medicao) return null

  const getIconByFileType = (url: string) => {
    if (url.endsWith('.pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />
    }
    return <FileSpreadsheet className="h-10 w-10 text-green-500" />
  }

  const getFileExtension = (url: string): string => {
    const ext = url.split('.').pop()?.toUpperCase()
    if (ext === 'XLSX' || ext === 'XLS') return 'Excel'
    if (ext === 'PDF') return 'PDF'
    return 'Documento'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes da Medição
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {medicao.descricao}
              </p>
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
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descrição */}
            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Descrição</h4>
              <p className="text-sm text-blue-800">
                {medicao.descricao}
              </p>
            </div>

            {/* Data da Medição */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-700">Data da Medição</h4>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatDateToBR(medicao.data_medicao)}
              </p>
            </div>

            {/* Criado em */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-700">Cadastrado em</h4>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatDateToBR(medicao.created_at.split('T')[0])}
              </p>
            </div>
          </div>

          {/* Nota Fiscal Vinculada */}
          {notaFiscalVinculada && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">Nota Fiscal Vinculada</h4>
              </div>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Número da Nota:</span>
                  <span className="text-sm font-bold text-gray-900">{notaFiscalVinculada.numero_nota}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="text-sm font-semibold text-green-600">
                    R$ {notaFiscalVinculada.valor_nota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vencimento:</span>
                  <span className="text-sm text-gray-900">{formatDateToBR(notaFiscalVinculada.vencimento)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Arquivo da Medição */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Arquivo da Medição</h4>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getIconByFileType(medicao.arquivo_medicao_url)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  medicao-{medicao.data_medicao}.{medicao.arquivo_medicao_url.split('.').pop()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tipo: {getFileExtension(medicao.arquivo_medicao_url)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <a
                href={medicao.arquivo_medicao_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Visualizar Arquivo
              </a>
              <a
                href={medicao.arquivo_medicao_url}
                download
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium block mb-1">ID da Medição:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{medicao.id}</code>
              </div>
              <div>
                <span className="font-medium block mb-1">Última atualização:</span>
                <p>{formatDateToBR(medicao.updated_at.split('T')[0])} às {new Date(medicao.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
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






