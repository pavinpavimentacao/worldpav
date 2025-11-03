import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DatePicker } from '../ui/date-picker'

// Tipos e funções para hora extra
interface CreateHoraExtraData {
  colaborador_id: string;
  data: string;
  tipo_dia: 'normal' | 'sabado' | 'domingo' | 'feriado';
  horas_extras: number;
  valor_hora_extra: number;
  observacoes?: string;
}

const TIPOS_DIA_HORA_EXTRA = [
  { value: 'normal', label: 'Dia Normal' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
  { value: 'feriado', label: 'Feriado' }
];

const calcularValorHoraExtra = (salarioFixo: number, tipoDia: string, horasExtras: number): number => {
  const valorHoraNormal = salarioFixo / 220; // 220 horas por mês
  
  let multiplicador = 1;
  switch (tipoDia) {
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
}

export default function HoraExtraForm({ colaboradorId, salarioFixo, onSave, onCancel }: HoraExtraFormProps) {
  const [formData, setFormData] = useState<CreateHoraExtraData>({
    colaborador_id: colaboradorId,
    data: '',
    horas_extras: 0,
    tipo_dia: 'normal',
    valor_hora_extra: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreateHoraExtraData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calcularValor = () => {
    const horas = parseFloat(formData.horas_extras.toString()) || 0
    return calcularValorHoraExtra(salarioFixo, formData.tipo_dia, horas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const valorCalculado = calcularValor()
      const horasNumericas = parseFloat(formData.horas_extras.toString()) || 0
      
      const { error } = await supabase
        .from('colaboradores_horas_extras')
        .insert({
          colaborador_id: formData.colaborador_id,
          data: formData.data,
          tipo_dia: formData.tipo_dia,
          horas: horasNumericas,
          valor_calculado: valorCalculado
        })

      if (error) throw error
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar hora extra')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.data) return 'Data é obrigatória'
    if (formData.horas_extras <= 0) return 'Horas devem ser maior que zero'
    return null
  }

  const validationError = validateForm()

  const valorCalculado = calcularValor()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Hora Extra</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Data */}
          <DatePicker
            value={formData.data}
            onChange={(value) => handleInputChange('data', value)}
            label="Data"
            required
          />

          {/* Horas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade de Horas *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={formData.horas_extras}
              onChange={(e) => handleInputChange('horas_extras', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Tipo de Dia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Dia *
            </label>
            <select
              value={formData.tipo_dia}
              onChange={(e) => handleInputChange('tipo_dia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {TIPOS_DIA_HORA_EXTRA.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cálculo do Valor */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span>🧮</span>
              Cálculo do Valor
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Salário Fixo:</span>
                <span className="font-medium">R$ {salarioFixo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Base/Hora:</span>
                <span className="font-medium">R$ {(salarioFixo / 220).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Multiplicador:</span>
                <span className="font-medium">
                  {formData.tipo_dia === 'normal' || formData.tipo_dia === 'sabado' ? '1.5x' : '2.0x'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horas:</span>
                <span className="font-medium">{formData.horas_extras}h</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900 font-medium">Total:</span>
                <span className="text-blue-600 font-bold text-lg">
                  R$ {valorCalculado.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!validationError}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>💾</span>
              )}
              Salvar
            </button>
          </div>

          {/* Validação */}
          {validationError && (
            <div className="text-red-600 text-sm">
              {validationError}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
