import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  Building2, 
  HardHat,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { parseDate, getLocalTimeZone, today } from '@internationalized/date';
import { toast } from 'sonner';
import { ProgramacaoPavimentacaoAPI } from '../../lib/programacao-pavimentacao-api';

// Schema de validação com Zod
const programacaoSchema = z.object({
  equipe: z.string().min(1, 'Selecione uma equipe'),
  cliente: z.string().min(1, 'Selecione um cliente'),
  obra: z.string().min(1, 'Selecione uma obra'),
  rua: z.string().min(1, 'Selecione uma rua'),
  maquinarios: z.array(z.string()).min(1, 'Selecione pelo menos um maquinário'),
  data_programacao: z.string().min(1, 'Selecione a data da programação'),
  metragem_prevista: z.number().min(0.01, 'Metragem deve ser maior que zero'),
  quantidade_toneladas: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  faixa_realizar: z.string().min(1, 'Informe a faixa a realizar'),
  horario_inicio: z.string().optional(),
  observacoes: z.string().optional(),
  tipo_servico: z.string().optional(),
  espessura: z.string().optional(),
});

type ProgramacaoFormData = z.infer<typeof programacaoSchema>;

// Dados reais do banco de dados
const useProgramacaoData = () => {
  const [clientes, setClientes] = useState<Array<{ id: string; name: string }>>([]);
  const [obras, setObras] = useState<Array<{ id: string; name: string; cliente_id: string }>>([]);
  const [ruas, setRuas] = useState<Array<{ id: string; name: string; obra_id: string; metragem?: number; espessura?: string; faixa?: string }>>([]);
  const [equipes, setEquipes] = useState<Array<{ id: string; name: string; prefixo: string; tipo_equipe?: string }>>([]);
  const [maquinarios, setMaquinarios] = useState<Array<{ id: string; nome: string; tipo: string; prefixo?: string }>>([]);
  const [ruaDetails, setRuaDetails] = useState<{ metragem?: number; espessura?: string; faixa?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [clientesData, equipesData, maquinariosData] = await Promise.all([
          ProgramacaoPavimentacaoAPI.getClientes(),
          ProgramacaoPavimentacaoAPI.getEquipes(),
          ProgramacaoPavimentacaoAPI.getMaquinarios()
        ]);

        setClientes(clientesData);
        setEquipes(equipesData);
        setMaquinarios(maquinariosData);

        console.log('✅ Dados carregados:', {
          clientes: clientesData.length,
          equipes: equipesData.length,
          maquinarios: maquinariosData.length
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const carregarObras = async (clienteId: string) => {
    try {
      const obrasData = await ProgramacaoPavimentacaoAPI.getObras(clienteId);
      setObras(obrasData);
      setRuas([]); // Limpar ruas quando mudar cliente
    } catch (err) {
      console.error('Erro ao carregar obras:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar obras');
    }
  };

  const carregarRuas = async (obraId: string) => {
    try {
      const ruasData = await ProgramacaoPavimentacaoAPI.getRuas(obraId);
      setRuas(ruasData);
    } catch (err) {
      console.error('Erro ao carregar ruas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar ruas');
    }
  };

  const carregarDetalhesRua = async (ruaId: string) => {
    try {
      const details = await ProgramacaoPavimentacaoAPI.getRuaDetails(ruaId);
      setRuaDetails(details);
    } catch (err) {
      console.error('Erro ao carregar detalhes da rua:', err);
      setRuaDetails(null);
    }
  };

  return { 
    clientes, 
    obras, 
    ruas, 
    equipes, 
    maquinarios, 
    ruaDetails,
    loading, 
    error,
    carregarObras,
    carregarRuas,
    carregarDetalhesRua
  };
};

interface ProgramacaoPavimentacaoFormProps {
  onSubmit?: (data: ProgramacaoFormData) => void;
  onCancel?: () => void;
}

export function ProgramacaoPavimentacaoForm({ 
  onSubmit: onSubmitProp,
  onCancel 
}: ProgramacaoPavimentacaoFormProps) {
  const [selectedMaquinarios, setSelectedMaquinarios] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const {
    clientes,
    obras,
    ruas,
    equipes,
    maquinarios,
    ruaDetails,
    loading,
    error,
    carregarObras,
    carregarRuas,
    carregarDetalhesRua
  } = useProgramacaoData();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProgramacaoFormData>({
    resolver: zodResolver(programacaoSchema),
    defaultValues: {
      equipe: '',
      cliente: '',
      obra: '',
      rua: '',
      maquinarios: [],
      data_programacao: '',
      metragem_prevista: 0,
      quantidade_toneladas: 0,
      faixa_realizar: '',
      horario_inicio: '',
      observacoes: '',
      tipo_servico: '',
      espessura: '',
    }
  });

  const clienteSelecionado = watch('cliente');
  const obraSelecionada = watch('obra');
  const ruaSelecionada = watch('rua');

  // Atualiza obras disponíveis quando cliente muda
  useEffect(() => {
    if (clienteSelecionado) {
      carregarObras(clienteSelecionado);
      setValue('obra', ''); // Reseta obra quando cliente muda
      setValue('rua', ''); // Reseta rua quando cliente muda
    }
  }, [clienteSelecionado, setValue, carregarObras]);

  // Atualiza ruas disponíveis quando obra muda
  useEffect(() => {
    if (obraSelecionada) {
      carregarRuas(obraSelecionada);
      setValue('rua', ''); // Reseta rua quando obra muda
    }
  }, [obraSelecionada, setValue, carregarRuas]);

  // Atualiza detalhes da rua quando rua muda
  useEffect(() => {
    if (ruaSelecionada) {
      carregarDetalhesRua(ruaSelecionada);
    }
  }, [ruaSelecionada]);

  // Preenche campos com dados da rua selecionada
  useEffect(() => {
    if (ruaDetails) {
      if (ruaDetails.metragem) {
        setValue('metragem_prevista', ruaDetails.metragem);
      }
      if (ruaDetails.espessura) {
        setValue('espessura', ruaDetails.espessura);
      }
      if (ruaDetails.faixa) {
        setValue('faixa_realizar', ruaDetails.faixa);
      }
    }
  }, [ruaDetails, setValue]);

  // Toggle de seleção de maquinário
  const toggleMaquinario = (id: string) => {
    const newSelection = selectedMaquinarios.includes(id)
      ? selectedMaquinarios.filter(m => m !== id)
      : [...selectedMaquinarios, id];
    
    setSelectedMaquinarios(newSelection);
    setValue('maquinarios', newSelection);
  };

  // Handler da data
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setValue('data_programacao', date.toISOString().split('T')[0]);
    }
  };

  const onSubmit = async (data: ProgramacaoFormData) => {
    try {
      
      // Buscar nomes para preview
      const equipeSelecionada = equipes.find(e => e.id === data.equipe);
      const clienteSelecionado = clientes.find(c => c.id === data.cliente);
      const obraSelecionada = obras.find(o => o.id === data.obra);
      const ruaSelecionadaParaPreview = ruas.find(r => r.id === data.rua);
      const maquinariosSelecionados = maquinarios.filter(m => data.maquinarios.includes(m.id));

      // Criar programação via API
      const programacaoData = {
        cliente_id: data.cliente,
        obra: obraSelecionada?.name || '',
        rua: ruaSelecionadaParaPreview?.name || '', // Nome da rua para exibição
        obra_id: data.obra, // ID da obra no banco de dados
        rua_id: data.rua, // ID da rua no banco de dados (campo 'rua' contém o ID)
        prefixo_equipe: equipeSelecionada?.prefixo || '',
        maquinarios: data.maquinarios,
        metragem_prevista: data.metragem_prevista,
        quantidade_toneladas: data.quantidade_toneladas,
        faixa_realizar: data.faixa_realizar,
        horario_inicio: data.horario_inicio,
        observacoes: data.observacoes,
        tipo_servico: data.tipo_servico,
        espessura_media_solicitada: data.espessura,
        data: data.data_programacao,
        company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345' // ID da empresa Worldpav
      };

          console.log('🔍 [Form] Dados enviados para API:', programacaoData);

      const programacaoCriada = await ProgramacaoPavimentacaoAPI.create(programacaoData);
      
      console.log('✅ Programação criada com sucesso:', programacaoCriada);
      
      toast.success('Programação criada com sucesso!', {
        description: `Obra: ${obraSelecionada?.name} - ${maquinariosSelecionados.length} maquinários`,
      });

      if (onSubmitProp) {
        onSubmitProp(data);
      }
    } catch (error) {
      console.error('❌ Erro ao criar programação:', error);
      toast.error('Erro ao criar programação', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  // Estados de loading e error
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-lg text-gray-600">Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <Card className="border-2 border-red-200 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-6xl">⚠️</div>
              <h3 className="text-xl font-semibold text-red-800">Erro ao carregar dados</h3>
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto space-y-6"
    >
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Criar Programação de Pavimentação
          </CardTitle>
          <CardDescription className="text-base">
            Preencha os dados da programação de forma simples e rápida
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Seção 1: Dados Básicos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Dados Básicos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipe */}
                <div className="space-y-2">
                  <Label htmlFor="equipe" className="text-sm font-medium">
                    Equipe <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="equipe"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger 
                          className={`h-12 transition-all ${errors.equipe ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Selecione a equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipes.map((equipe) => (
                            <SelectItem key={equipe.id} value={equipe.id}>
                              {equipe.name} ({equipe.prefixo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.equipe && (
                    <p className="text-sm text-red-500">{errors.equipe.message}</p>
                  )}
                </div>

                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="cliente" className="text-sm font-medium">
                    Cliente <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="cliente"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger 
                          className={`h-12 transition-all ${errors.cliente ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.cliente && (
                    <p className="text-sm text-red-500">{errors.cliente.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Obra */}
                <div className="space-y-2">
                  <Label htmlFor="obra" className="text-sm font-medium">
                    Obra <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="obra"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!clienteSelecionado}
                      >
                        <SelectTrigger 
                          className={`h-12 transition-all ${errors.obra ? 'border-red-500' : ''}`}
                        >
                          <SelectValue 
                            placeholder={
                              clienteSelecionado 
                                ? "Selecione a obra" 
                                : "Selecione um cliente primeiro"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {obras.map((obra) => (
                            <SelectItem key={obra.id} value={obra.id}>
                              {obra.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.obra && (
                    <p className="text-sm text-red-500">{errors.obra.message}</p>
                  )}
                </div>

                {/* Rua */}
                <div className="space-y-2">
                  <Label htmlFor="rua" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Rua <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="rua"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!obraSelecionada}
                      >
                        <SelectTrigger 
                          className={`h-12 transition-all ${errors.rua ? 'border-red-500' : ''}`}
                        >
                          <SelectValue 
                            placeholder={
                              obraSelecionada 
                                ? "Selecione a rua" 
                                : "Selecione uma obra primeiro"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ruas.map((rua) => (
                            <SelectItem key={rua.id} value={rua.id}>
                              {rua.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.rua && (
                    <p className="text-sm text-red-500">{errors.rua.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Seção 2: Maquinários */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 pt-6 border-t"
            >
              <div className="flex items-center gap-2 mb-4">
                <HardHat className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Maquinários Disponíveis</h3>
                {selectedMaquinarios.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedMaquinarios.length} selecionado{selectedMaquinarios.length > 1 ? 's' : ''})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {maquinarios.map((maquinario) => {
                  const isSelected = selectedMaquinarios.includes(maquinario.id);
                  
                  return (
                    <motion.div
                      key={maquinario.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-600 border-2 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                        onClick={() => toggleMaquinario(maquinario.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <motion.div
                                initial={false}
                                animate={{
                                  scale: isSelected ? 1.1 : 1,
                                  rotate: isSelected ? 360 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                {isSelected ? (
                                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                ) : (
                                  <Circle className="w-6 h-6 text-gray-400" />
                                )}
                              </motion.div>
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {maquinario.nome}
                              </h4>
                              <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                                {maquinario.tipo}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              {errors.maquinarios && (
                <p className="text-sm text-red-500">{errors.maquinarios.message}</p>
              )}
            </motion.div>

            {/* Seção 3: Informações Adicionais da Rua */}
            {ruaSelecionada && ruaDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="space-y-6 pt-6 border-t"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold">Informações da Rua</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Metragem Prevista */}
                  <div className="space-y-2">
                    <Label htmlFor="metragem_prevista" className="text-sm font-medium">
                      Metragem Prevista (m²) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('metragem_prevista', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 1500.50"
                      className={`h-12 transition-all ${errors.metragem_prevista ? 'border-red-500' : ''}`}
                    />
                    {errors.metragem_prevista && (
                      <p className="text-sm text-red-500">{errors.metragem_prevista.message}</p>
                    )}
                  </div>

                  {/* Quantidade de Toneladas */}
                  <div className="space-y-2">
                    <Label htmlFor="quantidade_toneladas" className="text-sm font-medium">
                      Quantidade (ton) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('quantidade_toneladas', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 25.5"
                      className={`h-12 transition-all ${errors.quantidade_toneladas ? 'border-red-500' : ''}`}
                    />
                    {errors.quantidade_toneladas && (
                      <p className="text-sm text-red-500">{errors.quantidade_toneladas.message}</p>
                    )}
                  </div>

                  {/* Faixa a Realizar */}
                  <div className="space-y-2">
                    <Label htmlFor="faixa_realizar" className="text-sm font-medium">
                      Faixa a Realizar <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register('faixa_realizar')}
                      placeholder="Ex: Faixa 1 e 2"
                      className={`h-12 transition-all ${errors.faixa_realizar ? 'border-red-500' : ''}`}
                    />
                    {errors.faixa_realizar && (
                      <p className="text-sm text-red-500">{errors.faixa_realizar.message}</p>
                    )}
                  </div>

                  {/* Horário de Início */}
                  <div className="space-y-2">
                    <Label htmlFor="horario_inicio" className="text-sm font-medium">
                      Horário de Início
                    </Label>
                    <Input
                      {...register('horario_inicio')}
                      type="time"
                      className="h-12 transition-all"
                    />
                  </div>

                  {/* Tipo de Serviço */}
                  <div className="space-y-2">
                    <Label htmlFor="tipo_servico" className="text-sm font-medium">
                      Tipo de Serviço
                    </Label>
                    <Input
                      {...register('tipo_servico')}
                      placeholder="Ex: CBUQ, Imprimação"
                      className="h-12 transition-all"
                    />
                  </div>

                  {/* Espessura */}
                  <div className="space-y-2">
                    <Label htmlFor="espessura" className="text-sm font-medium">
                      Espessura (cm)
                    </Label>
                    <Input
                      {...register('espessura')}
                      placeholder="Ex: 5cm"
                      className="h-12 transition-all"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-sm font-medium">
                    Observações
                  </Label>
                  <textarea
                    {...register('observacoes')}
                    placeholder="Observações adicionais sobre a programação..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Seção 4: Data da Programação */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 pt-6 border-t"
            >
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Data da Programação</h3>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <Controller
                    name="data_programacao"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Data da Programação"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            const date = new Date(value + 'T00:00:00');
                            setSelectedDate(date);
                          }
                        }}
                        error={errors.data_programacao?.message}
                        placeholder="Selecione a data"
                        minDate={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full"
                      />
                    )}
                  />
                  
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <p className="text-sm text-blue-900 text-center">
                        <span className="font-semibold">Data selecionada:</span>{' '}
                        {selectedDate.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Botões de Ação */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t"
            >
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="sm:w-auto w-full"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Criar Programação
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {/* Preview em JSON (para desenvolvimento) */}
      <Card className="border border-dashed bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Preview de Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
            {JSON.stringify({
              equipe: watch('equipe'),
              cliente: watch('cliente'),
              obra: watch('obra'),
              localizacao: watch('localizacao'),
              maquinarios: selectedMaquinarios,
              data_programacao: selectedDate ? selectedDate.toLocaleDateString('pt-BR') : null,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
}

