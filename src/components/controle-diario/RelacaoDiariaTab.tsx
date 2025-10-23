/**
 * Tab: Relação Diária
 * Controle de presença, faltas e mudanças de equipe
 */

import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from "../shared/Button";
import { useNavigate } from 'react-router-dom';
import { RelacoesDiariasList } from './RelacoesDiariasList';

export const RelacaoDiariaTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Relação Diária de Colaboradores</h2>
          <p className="text-gray-600 mt-1">
            Controle de presença, faltas e mudanças de equipe
          </p>
        </div>
        <Button 
          onClick={() => navigate('/controle-diario/nova-relacao')} 
          className="flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Relação</span>
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Como funciona?</h3>
            <p className="text-sm text-blue-800 mt-1">
              Clique em <strong>"+ Nova Relação"</strong> para criar uma nova relação diária. 
              Você poderá selecionar a equipe, marcar presença e registrar ausências (falta, atestado ou mudança de equipe).
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Relações Diárias Recentes */}
      <RelacoesDiariasList />
    </div>
  );
};

