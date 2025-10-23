import React, { useState, useEffect } from 'react'
import { Truck, Building, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "../shared/Button"
import { MaquinarioSelecionavel } from '../../types/relatorios-diarios'
import { getMaquinariosParceiros } from '../../lib/parceirosApi'

interface MaquinariosSelectorProps {
  maquinariosSelecionados: string[]
  onChange: (maquinariosIds: string[]) => void
}

// ========== MOCKUPS ==========
const mockMaquinariosProprios: MaquinarioSelecionavel[] = [
  {
    id: 'maq-1',
    nome: 'Caminhão Munck MB 2726',
    tipo: 'Caminhão',
    placa: 'ABC-1234',
    is_terceiro: false
  },
  {
    id: 'maq-2',
    nome: 'Rolo Compactador Dynapac',
    tipo: 'Rolo Compactador',
    placa: 'DEF-5678',
    is_terceiro: false
  },
  {
    id: 'maq-3',
    nome: 'Pá Carregadeira CAT',
    tipo: 'Pá Carregadeira',
    placa: 'GHI-9012',
    is_terceiro: false
  },
  {
    id: 'maq-4',
    nome: 'Caminhão Basculante Volvo',
    tipo: 'Caminhão Basculante',
    placa: 'JKL-3456',
    is_terceiro: false
  }
]

export function MaquinariosSelector({ maquinariosSelecionados, onChange }: MaquinariosSelectorProps) {
  const [maquinariosTerceiros, setMaquinariosTerceiros] = useState<MaquinarioSelecionavel[]>([])
  const [mostrarTerceiros, setMostrarTerceiros] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mostrarTerceiros && maquinariosTerceiros.length === 0) {
      loadMaquinariosTerceiros()
    }
  }, [mostrarTerceiros])

  async function loadMaquinariosTerceiros() {
    try {
      setLoading(true)
      
      const maquinariosParc = await getMaquinariosParceiros()
      
      // Mapear para formato selecionável
      const maquinarios: MaquinarioSelecionavel[] = maquinariosParc.map(maq => ({
        id: maq.id,
        nome: maq.nome,
        tipo: maq.tipo,
        placa: maq.placa,
        is_terceiro: true,
        parceiro_id: maq.parceiro_id,
        valor_diaria: maq.valor_diaria
      }))
      
      setMaquinariosTerceiros(maquinarios)
    } catch (error) {
      console.error('Erro ao carregar maquinários terceiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (maquinarioId: string) => {
    if (maquinariosSelecionados.includes(maquinarioId)) {
      onChange(maquinariosSelecionados.filter(id => id !== maquinarioId))
    } else {
      onChange([...maquinariosSelecionados, maquinarioId])
    }
  }

  const handleToggleAll = (maquinarios: MaquinarioSelecionavel[], checked: boolean) => {
    const ids = maquinarios.map(m => m.id)
    if (checked) {
      // Adicionar todos que ainda não estão selecionados
      const novosIds = ids.filter(id => !maquinariosSelecionados.includes(id))
      onChange([...maquinariosSelecionados, ...novosIds])
    } else {
      // Remover todos deste grupo
      onChange(maquinariosSelecionados.filter(id => !ids.includes(id)))
    }
  }

  const todosPropiosSelecionados = mockMaquinariosProprios.every(m => 
    maquinariosSelecionados.includes(m.id)
  )

  const todosTerceirosSelecionados = maquinariosTerceiros.length > 0 && 
    maquinariosTerceiros.every(m => maquinariosSelecionados.includes(m.id))

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Maquinários Utilizados
      </label>

      {/* Maquinários Próprios */}
      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Maquinários Próprios</h4>
          </div>
          <label className="flex items-center gap-2 text-sm text-blue-700 cursor-pointer">
            <input
              type="checkbox"
              checked={todosPropiosSelecionados}
              onChange={(e) => handleToggleAll(mockMaquinariosProprios, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Selecionar todos
          </label>
        </div>

        <div className="space-y-2">
          {mockMaquinariosProprios.map(maq => (
            <label
              key={maq.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={maquinariosSelecionados.includes(maq.id)}
                onChange={() => handleToggle(maq.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{maq.nome}</p>
                <p className="text-sm text-gray-600">
                  {maq.tipo} {maq.placa && `• ${maq.placa}`}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Botão para incluir terceiros */}
      <div className="flex justify-center">
        <Button
          variant={mostrarTerceiros ? 'outline' : 'primary'}
          onClick={() => setMostrarTerceiros(!mostrarTerceiros)}
          className="gap-2"
        >
          <Building className="h-4 w-4" />
          {mostrarTerceiros ? 'Ocultar Maquinários de Terceiros' : 'Incluir Maquinários de Terceiros'}
          {mostrarTerceiros ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Maquinários Terceiros */}
      {mostrarTerceiros && (
        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-600" />
              <h4 className="font-medium text-orange-900">Maquinários de Terceiros</h4>
            </div>
            {maquinariosTerceiros.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-orange-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={todosTerceirosSelecionados}
                  onChange={(e) => handleToggleAll(maquinariosTerceiros, e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                Selecionar todos
              </label>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4 text-orange-600">
              Carregando maquinários...
            </div>
          ) : maquinariosTerceiros.length === 0 ? (
            <div className="text-center py-4 text-orange-600">
              Nenhum maquinário de parceiro disponível
            </div>
          ) : (
            <div className="space-y-2">
              {maquinariosTerceiros.map(maq => (
                <label
                  key={maq.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-400 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={maquinariosSelecionados.includes(maq.id)}
                    onChange={() => handleToggle(maq.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{maq.nome}</p>
                    <p className="text-sm text-gray-600">
                      {maq.tipo} {maq.placa && `• ${maq.placa}`}
                    </p>
                    {maq.valor_diaria && (
                      <p className="text-sm font-medium text-orange-700 mt-1">
                        R$ {maq.valor_diaria.toFixed(2)}/dia
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resumo */}
      {maquinariosSelecionados.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>{maquinariosSelecionados.length}</strong> maquinário(s) selecionado(s)
          </p>
        </div>
      )}
    </div>
  )
}


