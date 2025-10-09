import React, { useState, useEffect } from 'react'
import { Users, Building } from 'lucide-react'
import { Select } from '../Select'
import { EquipeSelecionavel } from '../../types/relatorios-diarios'
import { getEquipesParceiros } from '../../lib/parceirosApi'

interface EquipeSelectorProps {
  equipeId: string
  onChange: (equipeId: string, isTerceira: boolean) => void
}

// ========== MOCKUPS ==========
const mockEquipesProprias: EquipeSelecionavel[] = [
  {
    id: 'eq-1',
    nome: 'Equipe Alpha',
    is_terceira: false,
    quantidade_pessoas: 10,
    especialidade: 'Pavimentação'
  },
  {
    id: 'eq-2',
    nome: 'Equipe Beta',
    is_terceira: false,
    quantidade_pessoas: 8,
    especialidade: 'Pavimentação'
  },
  {
    id: 'eq-3',
    nome: 'Equipe Sinalização',
    is_terceira: false,
    quantidade_pessoas: 4,
    especialidade: 'Sinalização'
  }
]

export function EquipeSelector({ equipeId, onChange }: EquipeSelectorProps) {
  const [equipes, setEquipes] = useState<EquipeSelecionavel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEquipes()
  }, [])

  async function loadEquipes() {
    try {
      setLoading(true)
      
      // Buscar equipes de parceiros
      const equipesParc = await getEquipesParceiros()
      
      // Mapear para formato selecionável
      const equipesTerceiras: EquipeSelecionavel[] = equipesParc.map(eq => ({
        id: eq.id,
        nome: eq.nome,
        is_terceira: true,
        parceiro_id: eq.parceiro_id,
        quantidade_pessoas: eq.quantidade_pessoas,
        especialidade: eq.especialidade,
        valor_diaria: eq.valor_diaria
      }))
      
      // Combinar equipes próprias + terceiras
      const todasEquipes = [...mockEquipesProprias, ...equipesTerceiras]
      setEquipes(todasEquipes)
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
      // Em caso de erro, usar apenas equipes próprias
      setEquipes(mockEquipesProprias)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (value: string) => {
    const equipeSelecionada = equipes.find(e => e.id === value)
    onChange(value, equipeSelecionada?.is_terceira || false)
  }

  const equipesOptions = equipes.map(eq => ({
    value: eq.id,
    label: eq.is_terceira 
      ? `${eq.nome} (Terceira - R$ ${eq.valor_diaria?.toFixed(2)}/dia)` 
      : eq.nome
  }))

  // Equipe selecionada
  const equipeSelecionada = equipes.find(e => e.id === equipeId)

  return (
    <div className="space-y-3">
      <Select
        value={equipeId}
        onChange={handleChange}
        options={[
          { value: '', label: 'Selecione a equipe' },
          ...equipesOptions
        ]}
        label="Equipe"
        placeholder="Selecione a equipe"
        required
        disabled={loading}
      />

      {/* Informações da equipe selecionada */}
      {equipeSelecionada && (
        <div className={`p-4 rounded-lg border ${
          equipeSelecionada.is_terceira 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {equipeSelecionada.is_terceira ? (
              <Building className="h-4 w-4 text-orange-600" />
            ) : (
              <Users className="h-4 w-4 text-blue-600" />
            )}
            <span className={`text-sm font-medium ${
              equipeSelecionada.is_terceira ? 'text-orange-900' : 'text-blue-900'
            }`}>
              {equipeSelecionada.is_terceira ? 'Equipe Terceira' : 'Equipe Própria'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {equipeSelecionada.quantidade_pessoas && (
              <div className={equipeSelecionada.is_terceira ? 'text-orange-700' : 'text-blue-700'}>
                <strong>Pessoas:</strong> {equipeSelecionada.quantidade_pessoas}
              </div>
            )}
            {equipeSelecionada.especialidade && (
              <div className={equipeSelecionada.is_terceira ? 'text-orange-700' : 'text-blue-700'}>
                <strong>Especialidade:</strong> {equipeSelecionada.especialidade}
              </div>
            )}
            {equipeSelecionada.is_terceira && equipeSelecionada.valor_diaria && (
              <div className="text-orange-700 col-span-2">
                <strong>Valor Diária:</strong> R$ {equipeSelecionada.valor_diaria.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


