import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/shared/Button";
import { Input } from '../../components/ui/input';
import { DatePicker } from '../../components/ui/date-picker';
import { SelecionarClienteObraRua } from '../../components/relatorios-diarios/SelecionarClienteObraRua';
import { EquipeSelector } from '../../components/relatorios-diarios/EquipeSelector';
import { MaquinariosSelector } from '../../components/relatorios-diarios/MaquinariosSelector';
import { ServicosObra } from '../../components/programacao/ServicosObra';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { FaixaAsfalto, faixaAsfaltoLabels, faixaAsfaltoDescricoes } from '../../types/parceiros';
import { Select } from "../../components/shared/Select";
import { TIPOS_SERVICO_OPTIONS } from '../../types/programacao-pavimentacao';

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

      // Criar programação (mock por enquanto)
      const programacao = {
        ...formData,
        maquinarios: maquinariosSelecionados,
        equipe_is_terceira: equipeIsTerceira,
        company_id: 'company-1', // TODO: pegar da sessão
      };

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

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/programacao')}
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
              <SelecionarClienteObraRua
                clienteId={watch('cliente_id') || ''}
                obraId={watch('obra_id') || ''}
                ruaId={watch('rua_id') || ''}
                onClienteChange={(value) => setValue('cliente_id', value)}
                onObraChange={(value) => setValue('obra_id', value)}
                onRuaChange={(value) => setValue('rua_id', value)}
              />
              {(errors.cliente_id || errors.obra_id || errors.rua_id) && (
                <p className="text-sm text-red-600">
                  {errors.cliente_id?.message || errors.obra_id?.message || errors.rua_id?.message}
                </p>
              )}

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
              <EquipeSelector
                equipeId={watch('equipe_id') || ''}
                onChange={(equipeId, isTerceira) => {
                  setValue('equipe_id', equipeId);
                  setEquipeIsTerceira(isTerceira);
                }}
              />
              {errors.equipe_id && (
                <p className="text-sm text-red-600">{errors.equipe_id.message}</p>
              )}
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
            <MaquinariosSelector
              maquinariosSelecionados={maquinariosSelecionados}
              onChange={setMaquinariosSelecionados}
            />
          </div>

          {/* Seção 4: Informações Adicionais */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Adicionais (Opcional)
            </h2>

            {/* Serviços da Obra */}
            <ServicosObra obraId={watch('obra_id') || ''} />

            <div className="mt-4">
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

          {/* Preview da Programação */}
          {(watch('cliente_id') || watch('data') || watch('metragem_prevista') || watch('quantidade_toneladas')) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Preview da Programação
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watch('data') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-500 font-medium">Data</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {new Date(watch('data') + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {watch('equipe_id') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-500 font-medium">Equipe</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{watch('equipe_id')}</p>
                  </div>
                )}

                {watch('metragem_prevista') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-500 font-medium">Metragem Prevista</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {watch('metragem_prevista')?.toLocaleString('pt-BR')} m²
                    </p>
                  </div>
                )}

                {watch('quantidade_toneladas') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-500 font-medium">Quantidade de Toneladas</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {watch('quantidade_toneladas')?.toLocaleString('pt-BR')} ton
                    </p>
                  </div>
                )}

                {watch('faixa_realizar') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-500 font-medium">Faixa a Ser Realizada</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {watch('faixa_realizar')}
                    </p>
                  </div>
                )}

                {watch('espessura_media_solicitada') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-500 font-medium">Espessura Média Solicitada</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {watch('espessura_media_solicitada')} cm
                    </p>
                  </div>
                )}

                {maquinariosSelecionados.length > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200 md:col-span-2">
                    <p className="text-xs text-gray-500 font-medium mb-2">Maquinários</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {maquinariosSelecionados.length} maquinário(s) selecionado(s)
                    </p>
                  </div>
                )}

                {watch('observacoes') && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200 md:col-span-2">
                    <p className="text-xs text-gray-500 font-medium mb-2">Observações</p>
                    <p className="text-sm text-gray-900 italic">{watch('observacoes')}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-blue-600 mt-4 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Revise as informações antes de salvar
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-gray-200 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/programacao')}
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

