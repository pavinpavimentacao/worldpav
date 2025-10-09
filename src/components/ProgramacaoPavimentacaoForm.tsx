import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { parseDate, getLocalTimeZone, today } from '@internationalized/date';
import { toast } from 'sonner';

// Schema de validação com Zod
const programacaoSchema = z.object({
  equipe: z.string().min(1, 'Selecione uma equipe'),
  cliente: z.string().min(1, 'Selecione um cliente'),
  obra: z.string().min(1, 'Selecione uma obra'),
  localizacao: z.string().min(3, 'Informe a localização da obra'),
  maquinarios: z.array(z.string()).min(1, 'Selecione pelo menos um maquinário'),
  data_programacao: z.string().min(1, 'Selecione a data da programação'),
});

type ProgramacaoFormData = z.infer<typeof programacaoSchema>;

// Dados mockados para teste
const MOCK_DATA = {
  equipes: [
    { id: '1', nome: 'Equipe A' },
    { id: '2', nome: 'Equipe B' },
    { id: '3', nome: 'Equipe C' },
  ],
  clientes: [
    { id: '1', nome: 'Prefeitura Municipal' },
    { id: '2', nome: 'Construtora Alfa' },
    { id: '3', nome: 'Construtora Beta' },
  ],
  obras: {
    '1': [
      { id: '1', nome: 'Avenida Brasil' },
      { id: '2', nome: 'Rua das Flores' },
      { id: '3', nome: 'Via Expressa Norte' },
    ],
    '2': [
      { id: '4', nome: 'Condomínio Sol' },
      { id: '5', nome: 'Residencial Vila Nova' },
    ],
    '3': [
      { id: '6', nome: 'Distrito Industrial' },
      { id: '7', nome: 'Parque Empresarial' },
    ],
  },
  maquinarios: [
    { id: '1', nome: 'Vibroacabadora', descricao: 'Modelo VT-100' },
    { id: '2', nome: 'Rolo Pneumático', descricao: 'Modelo RP-50' },
    { id: '3', nome: 'Caminhão Pipa', descricao: '15.000 litros' },
    { id: '4', nome: 'Fresadora', descricao: 'Modelo FR-200' },
    { id: '5', nome: 'Rolo Compactador', descricao: 'Modelo RC-75' },
    { id: '6', nome: 'Escavadeira', descricao: 'Modelo EC-300' },
  ],
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
  const [obrasDisponiveis, setObrasDisponiveis] = useState<typeof MOCK_DATA.obras['1']>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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
      localizacao: '',
      maquinarios: [],
      data_programacao: '',
    }
  });

  const clienteSelecionado = watch('cliente');

  // Atualiza obras disponíveis quando cliente muda
  useEffect(() => {
    if (clienteSelecionado) {
      setObrasDisponiveis(MOCK_DATA.obras[clienteSelecionado as keyof typeof MOCK_DATA.obras] || []);
      setValue('obra', ''); // Reseta obra quando cliente muda
    } else {
      setObrasDisponiveis([]);
    }
  }, [clienteSelecionado, setValue]);

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

  const onSubmit = (data: ProgramacaoFormData) => {
    console.log('📋 Programação criada:', data);
    
    // Preview dos dados
    const preview = {
      equipe: MOCK_DATA.equipes.find(e => e.id === data.equipe)?.nome,
      cliente: MOCK_DATA.clientes.find(c => c.id === data.cliente)?.nome,
      obra: obrasDisponiveis.find(o => o.id === data.obra)?.nome,
      localizacao: data.localizacao,
      maquinarios: MOCK_DATA.maquinarios
        .filter(m => data.maquinarios.includes(m.id))
        .map(m => m.nome),
      data: data.data_programacao,
    };

    console.log('👁️ Preview da programação:', preview);
    
    toast.success('Programação criada com sucesso!', {
      description: `Obra: ${preview.obra} - ${preview.maquinarios.length} maquinários`,
    });

    if (onSubmitProp) {
      onSubmitProp(data);
    }
  };

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
                          {MOCK_DATA.equipes.map((equipe) => (
                            <SelectItem key={equipe.id} value={equipe.id}>
                              {equipe.nome}
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
                          {MOCK_DATA.clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
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
                          {obrasDisponiveis.map((obra) => (
                            <SelectItem key={obra.id} value={obra.id}>
                              {obra.nome}
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

                {/* Localização */}
                <div className="space-y-2">
                  <Label htmlFor="localizacao" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Localização <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('localizacao')}
                    placeholder="Ex: Avenida Principal, km 5"
                    className={`h-12 transition-all ${errors.localizacao ? 'border-red-500' : ''}`}
                  />
                  {errors.localizacao && (
                    <p className="text-sm text-red-500">{errors.localizacao.message}</p>
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
                {MOCK_DATA.maquinarios.map((maquinario) => {
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
                                {maquinario.descricao}
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

            {/* Seção 3: Data da Programação */}
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

