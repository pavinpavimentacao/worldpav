import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { DatePicker } from '../../components/ui/date-picker';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { FaixaAsfalto, faixaAsfaltoLabels, faixaAsfaltoDescricoes } from '../../types/parceiros';
import { Select } from "../../components/shared/Select";
import { ProgramacaoPavimentacaoAPI } from '../../lib/programacao-pavimentacao-api';
import { getClientes } from '../../lib/clientesApi';
import { getOrCreateDefaultCompany } from '../../lib/company-utils';

// Schema de validação
const programacaoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  obra_id: z.string().min(1, 'Obra é obrigatória'),
  rua_id: z.string().min(1, 'Rua é obrigatória'),
  equipe_id: z.string().min(1, 'Equipe é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  horario_inicio: z.string().optional(),
  metragem_prevista: z.number().min(1, 'Metragem deve ser maior que 0'),
  quantidade_toneladas: z.number().min(1, 'Toneladas devem ser maior que 0'),
  faixa_realizar: z.string().min(1, 'Faixa é obrigatória'),
  espessura_media_solicitada: z.string().optional(),
  tipo_servico: z.string().optional(),
  espessura: z.string().optional(),
  observacoes: z.string().optional(),
});

type ProgramacaoFormData = z.infer<typeof programacaoSchema>;

const ProgramacaoPavimentacaoForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [equipeIsTerceira, setEquipeIsTerceira] = useState(false);
  const [maquinariosSelecionados, setMaquinariosSelecionados] = useState<string[]>([]);
  const [sucessoMensagem, setSucessoMensagem] = useState('');
  const [erroMensagem, setErroMensagem] = useState('');

  // Estados para dados reais
  const [clientes, setClientes] = useState<Array<{ id: string; name: string; company_name: string | null }>>([]);
  const [obras, setObras] = useState<Array<{ id: string; name: string; cliente_id: string }>>([]);
  const [ruas, setRuas] = useState<Array<{ id: string; name: string; obra_id: string; metragem?: number; espessura?: string; faixa?: string }>>([]);
  const [equipes, setEquipes] = useState<Array<{ id: string; name: string; prefixo: string; tipo_equipe?: string }>>([]);
  const [maquinarios, setMaquinarios] = useState<Array<{ id: string; nome: string; tipo: string; prefixo?: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [companyId, setCompanyId] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProgramacaoFormData>({
    resolver: zodResolver(programacaoSchema),
  });

  // Watch dos valores
  const data = watch('data');
  const clienteId = watch('cliente_id');
  const obraId = watch('obra_id');

  // Carregar company ID primeiro
  React.useEffect(() => {
    const carregarCompanyId = async () => {
      try {
        const id = await getOrCreateDefaultCompany();
        setCompanyId(id);
      } catch (err) {
        console.error('Erro ao carregar company ID:', err);
        setErroMensagem('Erro ao carregar empresa');
      }
    };

    carregarCompanyId();
  }, []);

  // Carregar dados iniciais quando company ID estiver disponível
  React.useEffect(() => {
    if (!companyId) return;

    const carregarDados = async () => {
      try {
        setLoadingData(true);
        const [clientesData, equipesData, maquinariosData] = await Promise.all([
          getClientes(companyId), // Usar API de clientes com filtro de company_id
          ProgramacaoPavimentacaoAPI.getEquipes(),
          ProgramacaoPavimentacaoAPI.getMaquinarios()
        ]);

        // Mapear dados da API de clientes para o formato esperado
        const clientesMapeados = clientesData.map(cliente => ({
          id: cliente.id,
          name: cliente.name,
          company_name: cliente.empresa
        }));

        setClientes(clientesMapeados);
        setEquipes(equipesData);
        setMaquinarios(maquinariosData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErroMensagem(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoadingData(false);
      }
    };

    carregarDados();
  }, [companyId]);

  // Carregar obras quando cliente muda
  React.useEffect(() => {
    if (clienteId) {
      const carregarObras = async () => {
        try {
          const obrasData = await ProgramacaoPavimentacaoAPI.getObras(clienteId);
          setObras(obrasData);
          setRuas([]); // Limpar ruas
          setValue('obra_id', '');
          setValue('rua_id', '');
        } catch (err) {
          console.error('Erro ao carregar obras:', err);
        }
      };
      carregarObras();
    }
  }, [clienteId, setValue]);

  // Carregar ruas quando obra muda
  React.useEffect(() => {
    if (obraId) {
      const carregarRuas = async () => {
        try {
          const ruasData = await ProgramacaoPavimentacaoAPI.getRuas(obraId);
          setRuas(ruasData);
          setValue('rua_id', '');
        } catch (err) {
          console.error('Erro ao carregar ruas:', err);
        }
      };
      carregarRuas();
    }
  }, [obraId, setValue]);

  async function onSubmit(formData: ProgramacaoFormData) {
    try {
      setLoading(true);
      setErroMensagem('');
      setSucessoMensagem('');

      // Validar se pelo menos 1 maquinário foi selecionado
      if (maquinariosSelecionados.length === 0) {
        setErroMensagem('Selecione pelo menos 1 maquinário');
        return;
      }

      // Criar programação via API
      const programacaoData = {
        data: formData.data,
        cliente_id: formData.cliente_id,
        obra: obras.find(o => o.id === formData.obra_id)?.name || '',
        rua: ruas.find(r => r.id === formData.rua_id)?.name || '',
        obra_id: formData.obra_id, // ID da obra no banco de dados
        rua_id: formData.rua_id, // ID da rua no banco de dados
        prefixo_equipe: equipes.find(e => e.id === formData.equipe_id)?.prefixo || '',
        maquinarios: maquinariosSelecionados,
        metragem_prevista: formData.metragem_prevista,
        quantidade_toneladas: formData.quantidade_toneladas,
        faixa_realizar: formData.faixa_realizar,
        horario_inicio: formData.horario_inicio,
        observacoes: formData.observacoes,
        tipo_servico: formData.tipo_servico,
        espessura: formData.espessura,
        espessura_media_solicitada: formData.espessura_media_solicitada, // Campo correto para espessura
        company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345' // ID da empresa Worldpav
      };

      const programacao = await ProgramacaoPavimentacaoAPI.create(programacaoData);
      console.log('Programação criada:', programacao);

      setSucessoMensagem('Programação criada com sucesso!');

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/programacao-pavimentacao');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao criar programação:', error);
      setErroMensagem(error.message || 'Erro ao criar programação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/programacao-pavimentacao')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Programação de Pavimentação</h1>
            <p className="text-gray-600 mt-1">Preencha os dados da programação para sua equipe</p>
          </div>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {sucessoMensagem && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Sucesso!</p>
              <p className="text-sm text-green-700 mt-1">{sucessoMensagem}</p>
            </div>
          </div>
        )}

        {erroMensagem && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Erro</p>
              <p className="text-sm text-red-700 mt-1">{erroMensagem}</p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção 1: Informações da Obra */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Obra</h2>

            <div className="space-y-4">
              {/* Cliente, Obra, Rua */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={clienteId || ''}
                    onChange={(value) => setValue('cliente_id', value)}
                    options={[
                      { value: '', label: 'Selecione o cliente' },
                      ...clientes.map(cliente => ({
                        value: cliente.id,
                        label: cliente.name
                      }))
                    ]}
                    placeholder="Selecione o cliente"
                    required
                  />
                  {errors.cliente_id && (
                    <p className="text-sm text-red-600">{errors.cliente_id.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Obra <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={obraId || ''}
                    onChange={(value) => setValue('obra_id', value)}
                    options={[
                      { value: '', label: clienteId ? 'Selecione a obra' : 'Selecione um cliente primeiro' },
                      ...obras.map(obra => ({
                        value: obra.id,
                        label: obra.name
                      }))
                    ]}
                    placeholder="Selecione a obra"
                    disabled={!clienteId}
                    required
                  />
                  {errors.obra_id && (
                    <p className="text-sm text-red-600">{errors.obra_id.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Rua <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={watch('rua_id') || ''}
                    onChange={(value) => setValue('rua_id', value)}
                    options={[
                      { value: '', label: obraId ? 'Selecione a rua' : 'Selecione uma obra primeiro' },
                      ...ruas.map(rua => ({
                        value: rua.id,
                        label: rua.name
                      }))
                    ]}
                    placeholder="Selecione a rua"
                    disabled={!obraId}
                    required
                  />
                  {errors.rua_id && (
                    <p className="text-sm text-red-600">{errors.rua_id.message}</p>
                  )}
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  value={data || ''}
                  onChange={(value) => setValue('data', value)}
                  label="Data da Programação"
                  placeholder="Selecione a data"
                  required
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Horário de Início (Opcional)
                  </label>
                  <Input type="time" {...register('horario_inicio')} />
                </div>
              </div>

              {/* Equipe */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Equipe <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch('equipe_id') || ''}
                  onChange={(value) => setValue('equipe_id', value)}
                  options={[
                    { value: '', label: 'Selecione a equipe' },
                    ...equipes.map(equipe => ({
                      value: equipe.id,
                      label: equipe.name
                    }))
                  ]}
                  placeholder="Selecione a equipe"
                  required
                />
                {errors.equipe_id && (
                  <p className="text-sm text-red-600">{errors.equipe_id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Metragem, Toneladas e Faixa */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Metragem, Toneladas e Faixa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Metragem Prevista (m²) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('metragem_prevista', { valueAsNumber: true })}
                  className={errors.metragem_prevista ? 'border-red-500' : ''}
                  placeholder="Ex: 2500.00"
                />
                {errors.metragem_prevista && (
                  <p className="text-sm text-red-600">{errors.metragem_prevista.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade de Toneladas <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('quantidade_toneladas', { valueAsNumber: true })}
                  className={errors.quantidade_toneladas ? 'border-red-500' : ''}
                  placeholder="Ex: 150.00"
                />
                {errors.quantidade_toneladas && (
                  <p className="text-sm text-red-600">{errors.quantidade_toneladas.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={watch('faixa_realizar') || ''}
                  onChange={(value) => setValue('faixa_realizar', value)}
                  options={[
                    { value: '', label: 'Selecione a faixa' },
                    ...Object.entries(faixaAsfaltoLabels).map(([key, label]) => ({
                      value: key,
                      label: label,
                    })),
                  ]}
                  label="Faixa a Ser Realizada"
                  placeholder="Selecione a faixa de asfalto"
                  required
                />
                {watch('faixa_realizar') && (
                  <p className="text-xs text-gray-500 mt-1">
                    {faixaAsfaltoDescricoes[watch('faixa_realizar') as FaixaAsfalto]}
                  </p>
                )}
                {errors.faixa_realizar && (
                  <p className="text-sm text-red-600">{errors.faixa_realizar.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Espessura Média Solicitada (cm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  {...register('espessura_media_solicitada')}
                  placeholder="Ex: 5"
                />
                {watch('espessura_media_solicitada') && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      Preview: {watch('espessura_media_solicitada')} cm de espessura
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 3: Maquinários */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Maquinários Utilizados</h2>
            
            {maquinarios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {maquinarios.map((maquinario) => {
                  const isSelected = maquinariosSelecionados.includes(maquinario.id);
                  
                  return (
                    <div
                      key={maquinario.id}
                      className={`cursor-pointer p-4 border rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setMaquinariosSelecionados(prev => prev.filter(id => id !== maquinario.id));
                        } else {
                          setMaquinariosSelecionados(prev => [...prev, maquinario.id]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <h4 className="font-semibold">{maquinario.nome}</h4>
                          <p className="text-sm text-gray-500">{maquinario.tipo}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum maquinário cadastrado ainda.</p>
                <p className="text-sm">Cadastre maquinários na seção Maquinários para utilizá-los aqui.</p>
              </div>
            )}
          </div>

          {/* Seção 4: Informações Adicionais */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Adicionais (Opcional)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  {...register('observacoes')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adicione observações sobre a programação (opcional)..."
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-gray-200 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/programacao-pavimentacao')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-2" disabled={loading}>
              <Save className="h-5 w-5" />
              {loading ? 'Salvando...' : 'Salvar Programação'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProgramacaoPavimentacaoForm;

