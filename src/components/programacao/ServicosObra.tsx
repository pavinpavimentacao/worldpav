import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { mockObras } from '../../types/obras';
import type { ServicoObra } from '../../types/servicos';
import { getUnidadeServicoLabel } from '../../types/servicos';

interface ServicosObraProps {
  obraId: string;
}

export function ServicosObra({ obraId }: ServicosObraProps) {
  const [servicos, setServicos] = useState<ServicoObra[]>([]);

  useEffect(() => {
    if (obraId) {
      // Buscar obra e seus serviços
      const obra = mockObras.find((o) => o.id === obraId);
      if (obra && obra.servicos) {
        setServicos(obra.servicos);
      } else {
        setServicos([]);
      }
    } else {
      setServicos([]);
    }
  }, [obraId]);

  if (!obraId) {
    return null;
  }

  if (servicos.length === 0) {
    return (
      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Serviços da Obra
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Nenhum serviço cadastrado para esta obra ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">
          Serviços Programados para esta Obra
        </h3>
      </div>

      <div className="space-y-2">
        {servicos.map((servico) => (
          <div
            key={servico.id}
            className="flex items-center justify-between p-3 bg-white rounded-md border border-blue-100"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{servico.servico_nome}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {servico.quantidade.toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{' '}
                {getUnidadeServicoLabel(servico.unidade)}
              </p>
            </div>

            <div className="ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {servico.unidade.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-blue-600 mt-3">
        ℹ️ Estes são os serviços cadastrados para esta obra
      </p>
    </div>
  );
}

