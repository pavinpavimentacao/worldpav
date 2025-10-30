import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Shield, Award, AlertTriangle, FileText, Save, Calendar, DollarSign } from 'lucide-react';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { InformacoesPessoaisTab } from '../../components/colaboradores/InformacoesPessoaisTab';
import { DocumentacaoPessoalTab } from '../../components/colaboradores/DocumentacaoPessoalTab';
import { CertificadosCompletosTab } from '../../components/colaboradores/CertificadosCompletosTab';
import { MultasTab } from '../../components/colaboradores/MultasTab';
import { ArquivosTab } from '../../components/colaboradores/ArquivosTab';
import { ControleDiarioTab } from '../../components/colaboradores/ControleDiarioTab';
import { DiariasTab } from '../../components/colaboradores/DiariasTab';
import { ColaboradorExpandido } from '../../types/colaboradores';
import { toast } from '../../lib/toast-hooks';
import { getColaboradorById, updateColaborador, toColaboradorLegacy, type ColaboradorSimples } from '../../lib/colaboradoresApi';

type TabType = 'informacoes' | 'documentacao' | 'certificados' | 'multas' | 'arquivos' | 'controle-diario' | 'diarias';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'informacoes', label: 'Informações Pessoais', icon: <User className="h-4 w-4" /> },
  { id: 'documentacao', label: 'Documentação', icon: <Shield className="h-4 w-4" /> },
  { id: 'certificados', label: 'Certificados & NR', icon: <Award className="h-4 w-4" /> },
  { id: 'multas', label: 'Multas', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'arquivos', label: 'Arquivos', icon: <FileText className="h-4 w-4" /> },
  { id: 'controle-diario', label: 'Controle Diário', icon: <Calendar className="h-4 w-4" /> },
  { id: 'diarias', label: 'Diárias', icon: <DollarSign className="h-4 w-4" /> },
];

export default function ColaboradorDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [colaborador, setColaborador] = useState<ColaboradorExpandido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('informacoes');

  useEffect(() => {
    if (id) {
      carregarColaborador();
    }
  }, [id]);

  const carregarColaborador = async () => {
    try {
      setIsLoading(true);

      const data = await getColaboradorById(id!);

      if (!data) {
        toast.error('Colaborador não encontrado');
        navigate('/colaboradores');
        return;
      }

      // Converter para formato expandido (legacy)
      const colaboradorLegacy = toColaboradorLegacy(data);
      setColaborador(colaboradorLegacy as ColaboradorExpandido);
    } catch (error: any) {
      console.error('Erro ao carregar colaborador:', error);
      toast.error('Erro ao carregar colaborador');
      navigate('/colaboradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = useCallback(async (data: Partial<ColaboradorExpandido>) => {
    if (!id) return;

    try {
      setIsSaving(true);

      // Função para mapear tipo_equipe do frontend para o banco
      const mapearTipoEquipe = (tipoEquipe: string): string => {
        const mapeamento: { [key: string]: string } = {
          'equipe_a': 'pavimentacao',
          'equipe_b': 'maquinas',
          'escritorio': 'apoio',
          // Mapeamentos antigos (compatibilidade)
          'massa': 'pavimentacao',
          'administrativa': 'apoio',
          // Já está no formato do banco
          'pavimentacao': 'pavimentacao',
          'maquinas': 'maquinas',
          'apoio': 'apoio'
        };
        return mapeamento[tipoEquipe] || 'pavimentacao';
      };

      // Mapear campos do frontend para o banco de dados
      const dataParaBanco: any = {};
      
      // Mapeamento de nomes
      if (data.nome !== undefined) dataParaBanco.name = data.nome;
      if (data.funcao !== undefined) dataParaBanco.position = data.funcao;
      if (data.telefone !== undefined) dataParaBanco.phone = data.telefone;
      if (data.cpf !== undefined) dataParaBanco.cpf = data.cpf;
      if (data.email !== undefined) dataParaBanco.email = data.email;
      
      // Mapear tipo_equipe para valores do banco
      if (data.tipo_equipe !== undefined) {
        dataParaBanco.tipo_equipe = mapearTipoEquipe(data.tipo_equipe);
        console.log('🔄 Mapeamento tipo_equipe:', {
          frontend: data.tipo_equipe,
          banco: dataParaBanco.tipo_equipe
        });
      }
      
      // ✅ Enviar equipe_id se existir
      if (data.equipe_id !== undefined) {
        dataParaBanco.equipe_id = data.equipe_id;
        console.log('✅ Enviando equipe_id:', data.equipe_id);
      }
      
      if (data.tipo_contrato !== undefined) dataParaBanco.tipo_contrato = data.tipo_contrato;
      if (data.salario_fixo !== undefined) dataParaBanco.salario_fixo = data.salario_fixo;
      if (data.registrado !== undefined) dataParaBanco.registrado = data.registrado;
      if (data.vale_transporte !== undefined) dataParaBanco.vale_transporte = data.vale_transporte;
      
      // Se vale_transporte for false, qtd_passagens_por_dia deve ser null
      if (data.qtd_passagens_por_dia !== undefined) {
        if (data.vale_transporte === false || (!data.vale_transporte && dataParaBanco.vale_transporte === false)) {
          dataParaBanco.qtd_passagens_por_dia = null;
        } else {
          dataParaBanco.qtd_passagens_por_dia = data.qtd_passagens_por_dia || null;
        }
      }
      if (data.valor_pagamento_1 !== undefined) dataParaBanco.valor_pagamento_1 = data.valor_pagamento_1;
      if (data.valor_pagamento_2 !== undefined) dataParaBanco.valor_pagamento_2 = data.valor_pagamento_2;
      if (data.data_pagamento_1 !== undefined) dataParaBanco.data_pagamento_1 = data.data_pagamento_1;
      if (data.data_pagamento_2 !== undefined) dataParaBanco.data_pagamento_2 = data.data_pagamento_2;

      console.log('📤 Dados a enviar para o banco:', dataParaBanco);

      const updated = await updateColaborador(id, dataParaBanco);

      // Atualizar estado local
      setColaborador((prev) => (prev ? { ...prev, ...updated } : null));
      
      // Não mostrar toast para não ser intrusivo (auto-save silencioso)
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do colaborador...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!colaborador) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Colaborador não encontrado</p>
            <Button onClick={() => navigate('/colaboradores')}>
              Voltar para Lista
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header com Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/colaboradores">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>

            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link to="/colaboradores" className="hover:text-gray-700">
                  Colaboradores
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  {colaborador.nome}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {colaborador.nome}
              </h1>
            </div>
          </div>

          {/* Indicador de Salvamento */}
          {isSaving && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Salvando...
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`mr-2 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'informacoes' && (
              <InformacoesPessoaisTab
                colaborador={colaborador}
                onUpdate={handleUpdate}
                isLoading={isSaving}
              />
            )}

            {activeTab === 'documentacao' && (
              <DocumentacaoPessoalTab
                colaborador={colaborador}
                onUpdate={handleUpdate}
                isLoading={isSaving}
              />
            )}

            {activeTab === 'certificados' && (
              <CertificadosCompletosTab 
                colaboradorId={colaborador.id} 
                colaboradorNome={colaborador.nome}
                colaboradorFuncao={colaborador.funcao}
              />
            )}

            {activeTab === 'multas' && (
              <MultasTab colaboradorId={colaborador.id} colaboradorNome={colaborador.nome} />
            )}

            {activeTab === 'arquivos' && (
              <ArquivosTab colaboradorId={colaborador.id} />
            )}

            {activeTab === 'controle-diario' && (
              <ControleDiarioTab 
                colaboradorId={colaborador.id} 
                colaboradorNome={colaborador.nome}
              />
            )}

            {activeTab === 'diarias' && (
              <DiariasTab 
                colaboradorId={colaborador.id} 
                colaboradorNome={colaborador.nome}
              />
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Última atualização:{' '}
            {new Date(colaborador.updated_at).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </Layout>
  );
}

