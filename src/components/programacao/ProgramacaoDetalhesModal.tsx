import React from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface ProgramacaoDetalhesModalProps {
  programacao: any; // Tipagem específica pode ser adicionada conforme necessário
  onClose: () => void;
}

export const ProgramacaoDetalhesModal: React.FC<ProgramacaoDetalhesModalProps> = ({
  programacao,
  onClose
}) => {
  if (!programacao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes da Programação</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{programacao.obra}</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">Cliente: {programacao.cliente_nome || 'Cliente não informado'}</p>
              <p className="text-sm text-gray-500 mt-1">📍 {programacao.rua}</p>
            </div>
            <Badge 
              variant={programacao.status === 'confirmada' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {programacao.status === 'confirmada' ? 'CONFIRMADA' : 'PROGRAMADA'}
            </Badge>
          </div>
          
          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm block">Data</span>
              <span className="font-medium">{format(new Date(programacao.data), 'dd/MM/yyyy')}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm block">Horário</span>
              <span className="font-medium">{programacao.horario_inicio || 'Não definido'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm block">Equipe</span>
              <span className="font-medium">{programacao.prefixo_equipe || 'Não definida'}</span>
            </div>
          </div>
          
          {/* Detalhes técnicos */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Detalhes Técnicos</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-500 text-sm block">Metragem Prevista</span>
                <span className="font-medium">{programacao.metragem_prevista} m²</span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block">Toneladas</span>
                <span className="font-medium">{programacao.quantidade_toneladas} ton</span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block">Faixa a Realizar</span>
                <span className="font-medium">{programacao.faixa_realizar || 'Não especificada'}</span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block">Espessura Média Solicitada</span>
                <span className="font-medium">{programacao.espessura_media_solicitada || 'Não especificada'}</span>
              </div>
            </div>
          </div>
          
          {/* Equipamentos */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Equipamentos</h4>
            {(programacao.maquinarios_nomes && programacao.maquinarios_nomes.length > 0) ? (
              <div className="flex flex-wrap gap-2">
                {programacao.maquinarios_nomes.map((maq: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {maq}
                  </Badge>
                ))}
              </div>
            ) : (programacao.maquinarios && programacao.maquinarios.length > 0) ? (
              <div className="flex flex-wrap gap-2">
                {programacao.maquinarios.map((maq: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {maq}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum equipamento associado</p>
            )}
          </div>
          
          {/* Observações */}
          {programacao.observacoes && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">
                {programacao.observacoes}
              </p>
            </div>
          )}
          
          {/* Informações do sistema */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-between text-xs text-gray-500">
              <div>Criado em: {format(new Date(programacao.created_at), 'dd/MM/yyyy HH:mm')}</div>
              <div>Atualizado em: {format(new Date(programacao.updated_at), 'dd/MM/yyyy HH:mm')}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {programacao.status !== 'confirmada' && (
            <Button variant="default">
              Confirmar Programação
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
