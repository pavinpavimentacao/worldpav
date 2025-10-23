import React from 'react';
import { X, Download, FileText, Calendar, AlertTriangle, MapPin, DollarSign, Hash, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "../shared/Button";
import { ColaboradorMulta } from '../../types/colaboradores';
import { formatCurrency } from '../../types/financial';
import { STATUS_MULTA_OPTIONS } from '../../types/colaboradores';

interface MultaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  multa: ColaboradorMulta;
  colaboradorNome: string;
}

export const MultaViewerModal: React.FC<MultaViewerModalProps> = ({
  isOpen,
  onClose,
  multa,
  colaboradorNome,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_recurso':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    if (multa.comprovante_url) {
      window.open(multa.comprovante_url, '_blank');
    }
  };

  const isVencida = multa.data_vencimento && new Date(multa.data_vencimento) < new Date();
  const diasParaVencimento = multa.data_vencimento 
    ? Math.ceil((new Date(multa.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Detalhes da Multa
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <User className="h-3 w-3 mr-1" />
                Colaborador: {colaboradorNome}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body - Content and Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
          {/* Document Viewer */}
          <div className="md:col-span-2 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {multa.comprovante_url ? (
              multa.comprovante_url.endsWith('.pdf') ? (
                <iframe
                  src={multa.comprovante_url}
                  className="w-full h-full"
                  title="Comprovante da Multa"
                ></iframe>
              ) : (
                <img
                  src={multa.comprovante_url}
                  alt="Comprovante da Multa"
                  className="max-w-full max-h-full object-contain"
                />
              )
            ) : (
              <div className="text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Nenhum comprovante disponível</p>
                <p className="text-sm">Esta multa não possui arquivo anexado</p>
              </div>
            )}
          </div>

          {/* Multa Details */}
          <div className="md:col-span-1 space-y-4 overflow-y-auto">
            {/* Status e Alerta */}
            <div className="card p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                Status da Multa
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadge(multa.status)}`}>
                    {STATUS_MULTA_OPTIONS.find(o => o.value === multa.status)?.label}
                  </span>
                </div>
                
                {/* Alerta de Vencimento */}
                {multa.data_vencimento && (
                  <div className={`p-3 rounded-md text-sm ${
                    isVencida 
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : diasParaVencimento && diasParaVencimento <= 7
                      ? 'bg-orange-50 border border-orange-200 text-orange-800'
                      : 'bg-green-50 border border-green-200 text-green-800'
                  }`}>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        {isVencida 
                          ? `Multa vencida há ${Math.abs(diasParaVencimento!)} dias`
                          : diasParaVencimento && diasParaVencimento <= 7
                          ? `Vence em ${diasParaVencimento} dias`
                          : diasParaVencimento && diasParaVencimento <= 30
                          ? `Vence em ${diasParaVencimento} dias`
                          : 'Multa em dia'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informações da Infração */}
            <div className="card p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Informações da Infração
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-start">
                  <span className="font-medium text-gray-600 min-w-[80px]">Tipo:</span>
                  <span className="text-gray-900">{multa.tipo_infracao}</span>
                </p>
                {multa.descricao && (
                  <p className="flex items-start">
                    <span className="font-medium text-gray-600 min-w-[80px]">Descrição:</span>
                    <span className="text-gray-900">{multa.descricao}</span>
                  </p>
                )}
                {multa.local_infracao && (
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                    <span className="font-medium text-gray-600 min-w-[60px]">Local:</span>
                    <span className="text-gray-900">{multa.local_infracao}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Valores e Pontos */}
            <div className="card p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                Valores e Pontuação
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Valor da Multa:</span>
                  <span className="text-lg font-bold text-red-600">
                    {multa.valor ? formatCurrency(multa.valor) : 'Não informado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Hash className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-600">Pontos na CNH:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {multa.pontos_carteira || 0} pontos
                  </span>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="card p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                Datas Importantes
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-600 min-w-[100px]">Data da Infração:</span>
                  <span className="text-gray-900">
                    {format(new Date(multa.data_infracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </p>
                {multa.data_vencimento && (
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-600 min-w-[100px]">Data de Vencimento:</span>
                    <span className="text-gray-900">
                      {format(new Date(multa.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Informações do Sistema */}
            <div className="card p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Informações do Sistema</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <span className="font-medium text-gray-600 min-w-[80px]">ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{multa.id}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium text-gray-600 min-w-[80px]">Registrado:</span>
                  <span className="text-gray-900">
                    {format(new Date(multa.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </p>
                {multa.updated_at && multa.updated_at !== multa.created_at && (
                  <p className="flex items-center">
                    <span className="font-medium text-gray-600 min-w-[80px]">Atualizado:</span>
                    <span className="text-gray-900">
                      {format(new Date(multa.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <div className="text-sm text-gray-500">
            <p>Última atualização: {format(new Date(), 'dd/MM/yyyy, HH:mm:ss', { locale: ptBR })}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {multa.comprovante_url && (
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Comprovante
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


