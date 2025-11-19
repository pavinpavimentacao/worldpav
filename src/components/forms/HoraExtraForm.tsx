import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DatePicker } from '../ui/date-picker'
import { toZonedTime } from 'date-fns-tz'
import { SYSTEM_TIMEZONE } from '../../config/timezone'

// Tipos e funções para hora extra
interface CreateHoraExtraData {
  colaborador_id: string;
  data: string;
  tipo_dia: 'diurno' | 'noturno' | 'normal' | 'sabado' | 'domingo' | 'feriado';
  horario_entrada: string;
  horario_saida: string;
  horas_extras: number;
  valor_hora_extra: number;
  observacoes?: string;
}

const TIPOS_DIA_HORA_EXTRA = [
  { value: 'diurno', label: 'Diurno' },
  { value: 'noturno', label: 'Noturno' }
];

const calcularValorHoraExtra = (salarioFixo: number, tipoDia: string, horasExtras: number): number => {
  const valorHoraNormal = salarioFixo / 220; // 220 horas por mês
  
  let multiplicador = 1;
  switch (tipoDia) {
    case 'diurno':
      multiplicador = 1.5;
      break;
    case 'noturno':
      multiplicador = 1.5;
      break;
    case 'normal':
      multiplicador = 1.5;
      break;
    case 'sabado':
      multiplicador = 1.5;
      break;
    case 'domingo':
      multiplicador = 2;
      break;
    case 'feriado':
      multiplicador = 2;
      break;
    default:
      multiplicador = 1.5;
  }
  
  return valorHoraNormal * multiplicador * horasExtras;
};

interface HoraExtraFormProps {
  colaboradorId: string
  salarioFixo: number
  onSave: () => void
  onCancel: () => void
  horaExtraId?: string // ID da hora extra para edição
  initialData?: {
    data: string
    horario_entrada: string
    horario_saida: string
    tipo_dia: 'diurno' | 'noturno' | 'normal' | 'sabado' | 'domingo' | 'feriado'
  }
}

// Função para obter o horário de término da jornada normal baseado no dia da semana
const getHorarioFimJornadaNormal = (data: string): number => {
  if (!data) return 17; // Default 17h (segunda a quinta)
  
  try {
    // Parse da data no formato YYYY-MM-DD
    const [ano, mes, dia] = data.split('-').map(Number);
    
    // Criar data no timezone local (meio-dia para evitar problemas de DST)
    const dataLocal = new Date(ano, mes - 1, dia, 12, 0, 0);
    
    // Converter para timezone de Brasília (America/Sao_Paulo = UTC-3)
    const dataBrasilia = toZonedTime(dataLocal, SYSTEM_TIMEZONE);
    const diaSemana = dataBrasilia.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Segunda (1) a Quinta (4): jornada normal até 17h
    // Sexta (5): jornada normal até 16h
    // Sábado (6) e Domingo (0): sem jornada normal (tudo é extra)
    
    if (diaSemana >= 1 && diaSemana <= 4) {
      return 17; // Segunda a Quinta: até 17h
    } else if (diaSemana === 5) {
      return 16; // Sexta: até 16h
    }
    
    return 0; // Sábado e Domingo: sem jornada normal
  } catch (error) {
    console.error('Erro ao calcular horário fim jornada:', error);
    return 17; // Default em caso de erro
  }
};

// Função para calcular horas extras baseado em entrada e saída
// IMPORTANTE: 
// - Turno DIURNO: Segunda a quinta jornada normal até 17h, Sexta até 16h. Horas após são extras.
// - Turno NOTURNO: 20h às 05h é horário normal. Horas após 05h são extras.
// - Sábado e domingo: tudo é extra
const calcularHorasExtras = (
  entrada: string, 
  saida: string, 
  data: string,
  tipoDia: string = 'diurno'
): number => {
  if (!entrada || !saida || !data) return 0;

  // TURNO NOTURNO: 20h às 05h é horário normal, após 05h são extras
  if (tipoDia === 'noturno') {
    const [entradaHora, entradaMin] = entrada.split(':').map(Number);
    const [saidaHora, saidaMin] = saida.split(':').map(Number);
    const entradaMinutos = entradaHora * 60 + entradaMin;
    const saidaMinutos = saidaHora * 60 + saidaMin;
    
    // Fim da jornada normal do turno noturno: 05h (300 minutos)
    const fimJornadaNoturna = 5 * 60; // 05:00 em minutos
    
    // Se saiu antes ou no horário de fim da jornada (05h), não há horas extras
    // Considerando que pode passar da meia-noite
    if (saidaMinutos <= fimJornadaNoturna) {
      // Saída antes das 05h (ex: 20h às 04h) - não há horas extras
      return 0;
    }
    
    // Se saiu após 05h, calcular horas extras
    // Exemplo: 20h às 06h = 1 hora extra (05h às 06h)
    // Exemplo: 20h às 07h = 2 horas extras (05h às 07h)
    const horasExtrasMinutos = saidaMinutos - fimJornadaNoturna;
    const horasExtras = horasExtrasMinutos / 60;
    
    // Arredondar para 0.5 (meia hora)
    return Math.round(horasExtras * 2) / 2;
  }

  // TURNO DIURNO: usar lógica existente
  // Obter horário de término da jornada normal
  const horarioFimJornada = getHorarioFimJornadaNormal(data);
  
  // Se não há jornada normal (sábado/domingo), tudo é extra
  if (horarioFimJornada === 0) {
    const [entradaHora, entradaMin] = entrada.split(':').map(Number);
    const [saidaHora, saidaMin] = saida.split(':').map(Number);
    const entradaMinutos = entradaHora * 60 + entradaMin;
    const saidaMinutos = saidaHora * 60 + saidaMin;
    let diferencaMinutos = saidaMinutos - entradaMinutos;
    if (diferencaMinutos < 0) diferencaMinutos += 24 * 60;
    return Math.round((diferencaMinutos / 60) * 2) / 2;
  }

  // Converter horários para minutos
  const [entradaHora, entradaMin] = entrada.split(':').map(Number);
  const [saidaHora, saidaMin] = saida.split(':').map(Number);

  const entradaMinutos = entradaHora * 60 + entradaMin;
  const saidaMinutos = saidaHora * 60 + saidaMin;
  const fimJornadaMinutos = horarioFimJornada * 60;

  // Se saiu antes ou no horário de fim da jornada, não há horas extras
  if (saidaMinutos <= fimJornadaMinutos) {
    return 0;
  }

  // Calcular horas extras: tudo que excede o horário de fim da jornada
  const horasExtrasMinutos = saidaMinutos - fimJornadaMinutos;
  const horasExtras = horasExtrasMinutos / 60;

  // Arredondar para 0.5 (meia hora)
  return Math.round(horasExtras * 2) / 2;
};

export default function HoraExtraForm({ colaboradorId, salarioFixo, onSave, onCancel, horaExtraId, initialData }: HoraExtraFormProps) {
  const isEditing = !!horaExtraId;
  
  const [formData, setFormData] = useState<CreateHoraExtraData>({
    colaborador_id: colaboradorId,
    data: initialData?.data || '',
    horario_entrada: initialData?.horario_entrada || '',
    horario_saida: initialData?.horario_saida || '',
    horas_extras: 0,
    tipo_dia: initialData?.tipo_dia || 'diurno',
    valor_hora_extra: 0
  })
  
  // Recalcular horas extras quando houver dados iniciais
  useEffect(() => {
    if (initialData && initialData.horario_entrada && initialData.horario_saida && initialData.data) {
      const horasCalculadas = calcularHorasExtras(
        initialData.horario_entrada,
        initialData.horario_saida,
        initialData.data,
        initialData.tipo_dia
      );
      setFormData(prev => ({
        ...prev,
        horas_extras: horasCalculadas
      }));
    }
  }, [initialData]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreateHoraExtraData, value: any) => {
    const newData = { ...formData, [field]: value };
    
    // Se mudou entrada, saída, data ou tipo_dia, recalcular horas extras
    if (field === 'horario_entrada' || field === 'horario_saida' || field === 'data' || field === 'tipo_dia') {
      const entrada = field === 'horario_entrada' ? value : newData.horario_entrada;
      const saida = field === 'horario_saida' ? value : newData.horario_saida;
      const data = field === 'data' ? value : newData.data;
      const tipoDia = field === 'tipo_dia' ? value : newData.tipo_dia;
      
      // Calcular horas extras (considerando tipo de turno)
      if (entrada && saida && data) {
        const horasCalculadas = calcularHorasExtras(entrada, saida, data, tipoDia);
        newData.horas_extras = horasCalculadas;
      } else {
        newData.horas_extras = 0;
      }
    }
    
    setFormData(newData);
  }

  const calcularValor = () => {
    const horas = formData.horas_extras || 0;
    return calcularValorHoraExtra(salarioFixo, formData.tipo_dia, horas);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const valorCalculado = calcularValor()
      const horasNumericas = formData.horas_extras || 0
      
      // Validar se há horas extras antes de salvar
      if (horasNumericas <= 0) {
        setError('Não é possível salvar sem horas extras calculadas')
        setLoading(false)
        return
      }

      // Verificar se o colaborador existe (a RLS vai validar se o usuário tem acesso)
      console.log('🔍 Verificando colaborador...', formData.colaborador_id)
      
      const { data: colaborador, error: colaboradorError } = await supabase
        .from('colaboradores')
        .select('id, name, company_id')
        .eq('id', formData.colaborador_id)
        .is('deleted_at', null)
        .single()

      if (colaboradorError || !colaborador) {
        console.error('❌ Erro ao buscar colaborador:', colaboradorError)
        if (colaboradorError?.code === 'PGRST116') {
          throw new Error('Colaborador não encontrado. Verifique se o colaborador existe.')
        }
        throw new Error('Erro ao buscar colaborador. Verifique se você tem permissão para acessar este colaborador.')
      }

      console.log('✅ Colaborador encontrado:', colaborador.name, 'Company ID:', colaborador.company_id)

      // Garantir que a data está no formato YYYY-MM-DD (sem timezone)
      // Para turno noturno, a data deve ser a do início do turno (20h)
      let dataParaSalvar = formData.data;
      
      // Validar formato da data (deve ser YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataParaSalvar)) {
        console.error('❌ Formato de data inválido:', dataParaSalvar);
        throw new Error('Formato de data inválido. Use o formato YYYY-MM-DD');
      }
      
      // Log para debug de timezone
      console.log('📅 Data antes de salvar:', {
        dataOriginal: formData.data,
        dataParaSalvar: dataParaSalvar,
        tipoDia: formData.tipo_dia,
        horarioEntrada: formData.horario_entrada,
        horarioSaida: formData.horario_saida
      });

      // Preparar dados para inserção
      const dadosParaSalvar: any = {
        colaborador_id: formData.colaborador_id,
        data: dataParaSalvar, // Usar data validada
        tipo_dia: formData.tipo_dia,
        horas: horasNumericas,
        valor_calculado: valorCalculado
      }

      // Adicionar horários apenas se estiverem preenchidos
      if (formData.horario_entrada && formData.horario_entrada.trim()) {
        dadosParaSalvar.horario_entrada = formData.horario_entrada
      }
      if (formData.horario_saida && formData.horario_saida.trim()) {
        dadosParaSalvar.horario_saida = formData.horario_saida
      }

      console.log('📝 Dados para salvar:', dadosParaSalvar)
      
      // IMPORTANTE: Para turno noturno, a data deve ser a do início do turno (20h)
      // Exemplo: Se trabalha de 20h do dia 19/11 até 06h do dia 20/11, a data é 19/11
      // A data YYYY-MM-DD é enviada como string pura, sem timezone
      
      let result;
      
      if (isEditing && horaExtraId) {
        // Atualizar registro existente
        result = await supabase
          .from('colaboradores_horas_extras')
          .update(dadosParaSalvar)
          .eq('id', horaExtraId)
          .select()
          .single()
      } else {
        // Inserir novo registro
        result = await supabase
          .from('colaboradores_horas_extras')
          .insert(dadosParaSalvar)
          .select()
          .single()
      }

      // Se falhar e o erro for sobre coluna não encontrada, tentar sem os horários
      if (result.error && result.error.message?.includes('column') && result.error.message?.includes('does not exist')) {
        console.warn('⚠️ Campos de horário não encontrados, salvando sem eles...')
        const dadosSemHorarios = {
          colaborador_id: dadosParaSalvar.colaborador_id,
          data: dadosParaSalvar.data,
          tipo_dia: dadosParaSalvar.tipo_dia,
          horas: dadosParaSalvar.horas,
          valor_calculado: dadosParaSalvar.valor_calculado
        }
        if (isEditing && horaExtraId) {
          result = await supabase
            .from('colaboradores_horas_extras')
            .update(dadosSemHorarios)
            .eq('id', horaExtraId)
            .select()
            .single()
        } else {
          result = await supabase
            .from('colaboradores_horas_extras')
            .insert(dadosSemHorarios)
            .select()
            .single()
        }
      }

      if (result.error) {
        console.error('❌ Erro ao salvar hora extra:', result.error)
        console.error('❌ Código do erro:', result.error.code)
        console.error('❌ Detalhes:', result.error.details)
        console.error('❌ Hint:', result.error.hint)
        throw result.error
      }

      console.log('✅ Hora extra salva com sucesso:', result.data)
      console.log('📅 Data salva no banco:', {
        dataSalva: result.data?.data,
        dataEnviada: dataParaSalvar,
        tipoDia: result.data?.tipo_dia,
        horarioEntrada: result.data?.horario_entrada,
        horarioSaida: result.data?.horario_saida
      })
      
      onSave()
    } catch (err: any) {
      console.error('❌ Erro completo:', err)
      console.error('❌ Detalhes do erro:', JSON.stringify(err, null, 2))
      
      let errorMessage = 'Erro ao salvar hora extra'
      
      if (err?.message) {
        errorMessage = err.message
        
        // Mensagens mais amigáveis para erros comuns
        if (err.message.includes('row-level security policy')) {
          errorMessage = 'Erro de permissão: O colaborador não pertence à sua empresa ou há um problema com as políticas de segurança. Verifique se o colaborador está associado à sua empresa.'
        } else if (err.message.includes('column') && err.message.includes('does not exist')) {
          errorMessage = 'Os campos de horário ainda não foram criados no banco. Execute a migration 04d_colaboradores_horas_extras_horarios.sql no Supabase.'
        } else if (err.message.includes('violates check constraint')) {
          errorMessage = 'Erro de validação: Verifique se as horas extras são maiores que zero.'
        } else if (err.message.includes('violates foreign key constraint')) {
          errorMessage = 'Erro: Colaborador não encontrado. Verifique se o colaborador existe.'
        }
      } else if (err?.error_description) {
        errorMessage = err.error_description
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.data) return 'Data é obrigatória'
    if (!formData.horario_entrada) return 'Horário de entrada é obrigatório'
    if (!formData.horario_saida) return 'Horário de saída é obrigatório'
    
    // Validar se há horas extras calculadas
    if (formData.horario_entrada && formData.horario_saida && formData.data) {
      const horasCalculadas = calcularHorasExtras(
        formData.horario_entrada, 
        formData.horario_saida, 
        formData.data,
        formData.tipo_dia
      );
      if (horasCalculadas <= 0) {
        if (formData.tipo_dia === 'noturno') {
          return 'Não há horas extras. No turno noturno, o horário normal é de 20h às 05h. Horas após 05h são extras.';
        }
        const horarioFimJornada = getHorarioFimJornadaNormal(formData.data);
        if (horarioFimJornada === 0) {
          // Sábado e domingo: permitir salvar mesmo sem horas extras (tudo é extra)
          return null
        }
        return `Não há horas extras. O horário de saída deve ser após ${horarioFimJornada}h (fim da jornada normal).`
      }
    }
    
    // Para sábado e domingo, permitir salvar mesmo com 0 horas (será recalculado)
    const horarioFimJornada = getHorarioFimJornadaNormal(formData.data);
    if (horarioFimJornada === 0 && formData.horas_extras <= 0 && formData.tipo_dia !== 'noturno') {
      // Recalcular para sábado/domingo
      if (formData.horario_entrada && formData.horario_saida) {
        const horasCalculadas = calcularHorasExtras(
          formData.horario_entrada, 
          formData.horario_saida, 
          formData.data,
          formData.tipo_dia
        );
        if (horasCalculadas > 0) {
          return null // Permitir salvar
        }
      }
    }
    
    if (formData.horas_extras <= 0) return 'Não há horas extras calculadas. Verifique os horários de entrada e saída.'
    return null
  }

  const validationError = validateForm()

  const valorCalculado = calcularValor()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Hora Extra' : 'Nova Hora Extra'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Seção: Dados Básicos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Dados Básicos</h3>
              
              {/* Data */}
              <DatePicker
                value={formData.data}
                onChange={(value) => handleInputChange('data', value)}
                label="Data"
                required
              />

              {/* Horários de Entrada e Saída */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Horário de Entrada *
                  </label>
                  <input
                    type="time"
                    value={formData.horario_entrada}
                    onChange={(e) => handleInputChange('horario_entrada', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Horário de Saída *
                  </label>
                  <input
                    type="time"
                    value={formData.horario_saida}
                    onChange={(e) => handleInputChange('horario_saida', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Horas Extras Calculadas */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Horas Extras Calculadas
                </label>
                <input
                  type="text"
                  value={formData.horas_extras > 0 ? `${formData.horas_extras.toFixed(1)}h` : '0h'}
                  readOnly
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed font-medium"
                />
                <p className="text-xs text-gray-500 mt-0.5">
                  {formData.tipo_dia === 'noturno' ? (
                    'Turno noturno: 20h às 05h é horário normal. Horas após 05h são extras.'
                  ) : formData.data ? (
                    (() => {
                      const horarioFim = getHorarioFimJornadaNormal(formData.data);
                      if (horarioFim === 0) {
                        return 'Sábados e domingos: todas as horas são extras';
                      }
                      return `Jornada normal até ${horarioFim}h. Horas após ${horarioFim}h são extras`;
                    })()
                  ) : (
                    'Horas após o fim da jornada normal são extras'
                  )}
                </p>
              </div>

              {/* Tipo de Dia */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de Dia *
                </label>
                <select
                  value={formData.tipo_dia}
                  onChange={(e) => handleInputChange('tipo_dia', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {TIPOS_DIA_HORA_EXTRA.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seção: Cálculo do Valor */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Cálculo do Valor</h3>
              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salário Fixo:</span>
                    <span className="font-medium">R$ {salarioFixo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base/Hora:</span>
                    <span className="font-medium">R$ {(salarioFixo / 220).toFixed(2)}</span>
                  </div>
                </div>
                {formData.horario_entrada && formData.horario_saida && (
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-blue-200 text-gray-500">
                    <div className="text-center">
                      <div className="text-[10px]">Entrada</div>
                      <div className="font-medium">{formData.horario_entrada}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px]">Saída</div>
                      <div className="font-medium">{formData.horario_saida}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px]">Total</div>
                      <div className="font-medium">
                        {(() => {
                          const [entradaH, entradaM] = formData.horario_entrada.split(':').map(Number);
                          const [saidaH, saidaM] = formData.horario_saida.split(':').map(Number);
                          const entradaMin = entradaH * 60 + entradaM;
                          const saidaMin = saidaH * 60 + saidaM;
                          let diff = saidaMin - entradaMin;
                          if (diff < 0) diff += 24 * 60;
                          return (diff / 60).toFixed(1) + 'h';
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Multiplicador:</span>
                    <span className="font-medium">
                      {formData.tipo_dia === 'diurno' || formData.tipo_dia === 'noturno' || formData.tipo_dia === 'normal' || formData.tipo_dia === 'sabado' ? '1.5x' : '2.0x'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horas Extras:</span>
                    <span className="font-medium">{formData.horas_extras.toFixed(1)}h</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-blue-300">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="text-blue-600 font-bold text-base">
                    R$ {valorCalculado.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Validação */}
            {validationError && (
              <div className="text-red-600 text-xs bg-red-50 px-2 py-1.5 rounded">
                {validationError}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!validationError}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>💾</span>
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
