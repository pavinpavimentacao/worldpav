/**
 * Tab: Diárias de Guarda do Maquinário
 * Exibe histórico de diárias de guarda deste equipamento
 */

import React, { useState, useEffect } from 'react';
import { Calendar, User, DollarSign, MapPin, Clock, Truck, FileText, Eye } from 'lucide-react';
import { Button } from '../shared/Button';
import { toast } from '../../lib/toast-hooks';
import { listarDiariasPorMaquinario } from '../../lib/guardasApi';
import {
  getLabelTurno,
  getCorTurno,
  getIconeTurno,
  type DiariaGuardaCompleta,
} from '../../types/guardas';
import { formatDateBR } from '../../utils/date-format';

interface GuardasMaquinarioTabProps {
  maquinarioId: string;
  maquinarioNome: string;
}

export const GuardasMaquinarioTab: React.FC<GuardasMaquinarioTabProps> = ({
  maquinarioId,
  maquinarioNome,
}) => {
  const [diarias, setDiarias] = useState<DiariaGuardaCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [diariaSelecionada, setDiariaSelecionada] = useState<DiariaGuardaCompleta | null>(null);

  useEffect(() => {
    carregarDiarias();
  }, [maquinarioId]);

  const carregarDiarias = async () => {
    setIsLoading(true);
    try {
      const data = await listarDiariasPorMaquinario(maquinarioId);
      setDiarias(data);
    } catch (error: any) {
      console.error('Erro ao carregar diárias:', error);
      toast.error(error.message || 'Erro ao carregar diárias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerDetalhes = (diaria: DiariaGuardaCompleta) => {
    setDiariaSelecionada(diaria);
    setShowDetalhesModal(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-3">Carregando diárias...</p>
      </div>
    );
  }

  if (diarias.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma diária de guarda registrada
        </h3>
        <p className="text-gray-600 mb-4">
          Este maquinário ainda não foi utilizado em diárias de guarda.
        </p>
        <p className="text-sm text-gray-500">
          As diárias são criadas na página Guardas → Diárias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Histórico de Diárias de Guarda
          </h3>
          <p className="text-sm text-gray-600">
            {diarias.length} {diarias.length === 1 ? 'diária registrada' : 'diárias registradas'} para {maquinarioNome}
          </p>
        </div>
      </div>

      {/* Lista de Diárias */}
      <div className="space-y-3">
        {diarias.map((diaria) => (
          <div
            key={diaria.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {diaria.guarda_nome}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {diaria.empresa_nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleVerDetalhes(diaria)}
                className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Ver detalhes"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Informações */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {formatDateBR(diaria.data_diaria)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCorTurno(diaria.turno)}`}>
                  {getIconeTurno(diaria.turno)} {getLabelTurno(diaria.turno)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  R$ {(diaria.valor_diaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {diaria.maquinarios.length} maq.
                </span>
              </div>
            </div>

            {/* Obra e Rua */}
            {diaria.obra_nome && (
              <div className="text-sm bg-blue-50 rounded-lg p-2 mb-2">
                <span className="text-blue-900 font-medium">Obra:</span>{' '}
                <span className="text-blue-700">{diaria.obra_nome}</span>
              </div>
            )}

            {/* Rua e Solicitante */}
            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{diaria.rua_nome || 'Sem rua especificada'}</span>
              </div>
              <span className="text-gray-500">por {diaria.solicitante}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {showDetalhesModal && diariaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalhes da Diária
              </h3>
              <button onClick={() => setShowDetalhesModal(false)}>
                <Eye className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Guarda e Empresa */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-900 font-semibold mb-1">
                  Guarda
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {diariaSelecionada.guarda_nome}
                </div>
                <div className="text-sm text-gray-600">
                  {diariaSelecionada.empresa_nome}
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Data</div>
                  <div className="font-semibold text-gray-900">
                    {formatDateBR(diariaSelecionada.data_diaria)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Turno</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCorTurno(diariaSelecionada.turno)}`}>
                    {getIconeTurno(diariaSelecionada.turno)} {getLabelTurno(diariaSelecionada.turno)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Valor</div>
                  <div className="font-semibold text-gray-900">
                    R$ {(diariaSelecionada.valor_diaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Solicitante</div>
                  <div className="font-semibold text-gray-900">
                    {diariaSelecionada.solicitante}
                  </div>
                </div>
              </div>

              {/* Obra */}
              {diariaSelecionada.obra_nome && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Obra</div>
                  <div className="font-semibold text-blue-900 bg-blue-50 rounded-lg p-2">
                    {diariaSelecionada.obra_nome}
                  </div>
                </div>
              )}

              {/* Rua */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Rua</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {diariaSelecionada.rua_nome || 'Sem rua especificada'}
                  </span>
                </div>
              </div>

              {/* Maquinários */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Maquinários Utilizados</div>
                <div className="space-y-2">
                  {diariaSelecionada.maquinarios.map((maq) => (
                    <div
                      key={maq.id}
                      className={`flex items-start space-x-2 rounded-lg p-3 ${
                        maq.maquinario_id === maquinarioId
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <Truck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        maq.maquinario_id === maquinarioId ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {maq.maquinario_nome}
                          {maq.maquinario_id === maquinarioId && (
                            <span className="ml-2 text-xs text-blue-600 font-bold">(Este maquinário)</span>
                          )}
                        </div>
                        {maq.maquinario_tipo && (
                          <div className="text-xs text-gray-600">
                            {maq.maquinario_tipo}
                            {maq.maquinario_placa && ` • Placa: ${maq.maquinario_placa}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foto */}
              {diariaSelecionada.foto_maquinario_url && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Foto do Maquinário</div>
                  <img
                    src={diariaSelecionada.foto_maquinario_url}
                    alt="Foto do maquinário"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              {/* Observações */}
              {diariaSelecionada.observacoes && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Observações</div>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {diariaSelecionada.observacoes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



