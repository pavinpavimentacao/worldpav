import React, { useState, useEffect } from 'react'
import { Truck, Building, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "../shared/Button"
import { MaquinarioSelecionavel } from '../../types/relatorios-diarios'
import { getMaquinariosParceiros } from '../../lib/parceirosApi'
import { supabase } from '../../lib/supabase'

interface MaquinariosSelectorProps {
  maquinariosSelecionados: string[]
  onChange: (maquinariosIds: string[]) => void
}

export function MaquinariosSelector({ maquinariosSelecionados, onChange }: MaquinariosSelectorProps) {
  const [maquinariosProprios, setMaquinariosProprios] = useState<MaquinarioSelecionavel[]>([])
  const [maquinariosTerceiros, setMaquinariosTerceiros] = useState<MaquinarioSelecionavel[]>([])
  const [mostrarTerceiros, setMostrarTerceiros] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingProprios, setLoadingProprios] = useState(true)

  // Carregar maquinários próprios do banco
  useEffect(() => {
    loadMaquinariosProprios()
  }, [])

  // Carregar maquinários terceiros quando necessário
  useEffect(() => {
    if (mostrarTerceiros && maquinariosTerceiros.length === 0) {
      loadMaquinariosTerceiros()
    }
  }, [mostrarTerceiros])

  async function loadMaquinariosProprios() {
    try {
      setLoadingProprios(true)
      console.log('🔍 [MaquinariosSelector] Carregando maquinários próprios...')
      
      // Tentar buscar de maquinarios
      const { data: maquinariosData, error: maquinariosError } = await supabase
        .from('maquinarios')
        .select('id, name, plate, model, type')
        .eq('status', 'ativo')
        .is('deleted_at', null)
        .order('name')
      
      if (maquinariosError) {
        console.error('❌ Erro ao buscar maquinários:', maquinariosError)
        
        // Fallback: buscar de pumps
        const { data: pumpsData, error: pumpsError } = await supabase
          .from('pumps')
          .select('id, prefix, model, brand')
          .eq('status', 'ativo')
          .order('prefix')
        
        if (pumpsError) {
          console.error('❌ Erro ao buscar pumps:', pumpsError)
          setMaquinariosProprios([])
        } else {
          console.log('✅ Pumps carregados:', pumpsData?.length || 0)
          setMaquinariosProprios(
            pumpsData?.map(p => ({
              id: p.id,
              nome: p.prefix || 'Sem nome',
              tipo: p.brand || 'Bomba',
              placa: p.prefix,
              is_terceiro: false
            })) || []
          )
        }
      } else {
        console.log('✅ Maquinários carregados:', maquinariosData?.length || 0)
        setMaquinariosProprios(
          maquinariosData?.map(m => ({
            id: m.id,
            nome: m.name || 'Sem nome',
            tipo: m.type || m.model || 'Maquinário',
            placa: m.plate,
            is_terceiro: false
          })) || []
        )
      }
    } catch (error) {
      console.error('❌ Erro ao carregar maquinários próprios:', error)
    } finally {
      setLoadingProprios(false)
    }
  }

  async function loadMaquinariosTerceiros() {
    try {
      setLoading(true)
      console.log('🔍 [MaquinariosSelector] Carregando maquinários terceiros...')
      
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
      
      console.log('✅ Maquinários terceiros carregados:', maquinarios.length)
      setMaquinariosTerceiros(maquinarios)
    } catch (error) {
      console.error('❌ Erro ao carregar maquinários terceiros:', error)
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

  const todosPropiosSelecionados = maquinariosProprios.every(m => 
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
              onChange={(e) => handleToggleAll(maquinariosProprios, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Selecionar todos
          </label>
        </div>

        {loadingProprios ? (
          <div className="text-center py-4 text-blue-600">
            🔄 Carregando maquinários...
          </div>
        ) : maquinariosProprios.length === 0 ? (
          <div className="text-center py-4 text-orange-600">
            Nenhum maquinário próprio disponível
          </div>
        ) : (
          <div className="space-y-2">
            {maquinariosProprios.map(maq => (
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
          )}
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


