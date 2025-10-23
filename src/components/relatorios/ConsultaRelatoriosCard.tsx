/**
 * Componente de exemplo: Card para consulta de relatórios salvos
 * Mostra os relatórios criados via confirmação de obra
 */

import React from 'react';
import { FileText, Calendar, MapPin, Truck, Users, TrendingUp } from 'lucide-react';
import { 
  listarRelatoriosDiarios, 
  getEstatisticasRelatorios 
} from '../../mocks/relatorios-diarios-mock';
import { formatDateBR } from '../../utils/date-format';

const ConsultaRelatoriosCard: React.FC = () => {
  const relatorios = listarRelatoriosDiarios();
  const stats = getEstatisticasRelatorios();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Relatórios Diários</h2>
            <p className="text-sm text-gray-500">Criados via confirmação de obra</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Estatísticas */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Metragem Total</div>
            <div className="text-lg font-bold text-gray-900">
              {stats.totalMetragem.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} m²
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Toneladas Total</div>
            <div className="text-lg font-bold text-gray-900">
              {stats.totalToneladas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Espessura Média</div>
            <div className="text-lg font-bold text-gray-900">
              {stats.espessuraMedia.toFixed(2)} cm
            </div>
          </div>
        </div>
      )}

      {/* Lista de Relatórios */}
      <div className="space-y-3">
        {relatorios.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Nenhum relatório criado ainda.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Relatórios são criados ao confirmar obras na programação.
            </p>
          </div>
        ) : (
          relatorios.slice(0, 5).map((relatorio) => (
            <div 
              key={relatorio.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Número e Data */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-gray-900">{relatorio.numero}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    Finalizado
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDateBR(relatorio.data_inicio)}
                </div>
              </div>

              {/* Cliente e Obra */}
              <div className="space-y-1 mb-3">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{relatorio.cliente_nome}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {relatorio.obra_nome}
                </div>
              </div>

              {/* Rua */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {relatorio.rua_nome}
                </span>
              </div>

              {/* Dados de Execução */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Metragem</div>
                  <div className="text-sm font-bold text-gray-900">
                    {relatorio.metragem_feita.toLocaleString('pt-BR')} m²
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Toneladas</div>
                  <div className="text-sm font-bold text-gray-900">
                    {relatorio.toneladas_aplicadas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Espessura</div>
                  <div className="text-sm font-bold text-gray-900">
                    {relatorio.espessura_calculada.toFixed(2)} cm
                  </div>
                </div>
              </div>

              {/* Equipe e Maquinários */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{relatorio.equipe_nome || 'Sem equipe'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  <span>{relatorio.maquinarios.length} maquinário(s)</span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Link para ver todos */}
        {relatorios.length > 5 && (
          <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver todos os {relatorios.length} relatórios →
          </button>
        )}
      </div>

      {/* Indicador de Crescimento */}
      {stats.total > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700">
            {stats.total} obra(s) finalizada(s) e documentada(s)
          </span>
        </div>
      )}
    </div>
  );
};

export default ConsultaRelatoriosCard;


