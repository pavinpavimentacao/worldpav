import React, { useState, useEffect } from 'react'
import { Building2, Briefcase, MapPin } from 'lucide-react'
import { Select } from "../shared/Select"
import { supabase } from '../../lib/supabase'

interface Cliente {
  id: string
  nome: string
}

interface Obra {
  id: string
  nome: string
  cliente_id: string
}

interface Rua {
  id: string
  nome: string
  obra_id: string
  status: 'planejada' | 'em_execucao' | 'concluida'
}

interface SelecionarClienteObraRuaProps {
  clienteId: string
  obraId: string
  ruaId: string
  onClienteChange: (clienteId: string) => void
  onObraChange: (obraId: string) => void
  onRuaChange: (ruaId: string) => void
}

export function SelecionarClienteObraRua({
  clienteId,
  obraId,
  ruaId,
  onClienteChange,
  onObraChange,
  onRuaChange
}: SelecionarClienteObraRuaProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [ruas, setRuas] = useState<Rua[]>([])
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [loadingObras, setLoadingObras] = useState(false)
  const [loadingRuas, setLoadingRuas] = useState(false)

  // Carregar clientes do banco
  useEffect(() => {
    loadClientes()
  }, [])

  // Carregar obras quando cliente mudar
  useEffect(() => {
    if (clienteId) {
      loadObras(clienteId)
      // Limpar seleções
      if (obraId) {
        onObraChange('')
        onRuaChange('')
      }
    } else {
      setObras([])
      setRuas([])
    }
  }, [clienteId])

  // Carregar ruas quando obra mudar
  useEffect(() => {
    if (obraId) {
      loadRuas(obraId)
      // Limpar seleção de rua
      if (ruaId) {
        onRuaChange('')
      }
    } else {
      setRuas([])
    }
  }, [obraId])

  async function loadClientes() {
    try {
      setLoadingClientes(true)
      console.log('🔍 [SelecionarClienteObraRua] Carregando clientes...')
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name')
      
      if (error) {
        console.error('❌ Erro ao buscar clientes:', error)
        setClientes([])
      } else {
        console.log('✅ Clientes carregados:', data?.length || 0)
        setClientes(
          data?.map(c => ({
            id: c.id,
            nome: c.name
          })) || []
        )
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error)
      setClientes([])
    } finally {
      setLoadingClientes(false)
    }
  }

  async function loadObras(clienteId: string) {
    try {
      setLoadingObras(true)
      console.log('🔍 [SelecionarClienteObraRua] Carregando obras do cliente:', clienteId)
      
      const { data, error } = await supabase
        .from('obras')
        .select('id, name, client_id')
        .eq('client_id', clienteId)
        .order('name')
      
      if (error) {
        console.error('❌ Erro ao buscar obras:', error)
        setObras([])
      } else {
        console.log('✅ Obras carregadas:', data?.length || 0)
        setObras(
          data?.map(o => ({
            id: o.id,
            nome: o.name, // Coluna se chama 'name'
            cliente_id: o.client_id // Coluna se chama 'client_id'
          })) || []
        )
      }
    } catch (error) {
      console.error('❌ Erro ao carregar obras:', error)
      setObras([])
    } finally {
      setLoadingObras(false)
    }
  }

  async function loadRuas(obraId: string) {
    try {
      setLoadingRuas(true)
      console.log('🔍 [SelecionarClienteObraRua] Carregando ruas da obra:', obraId)
      
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('id, name, obra_id, status')
        .eq('obra_id', obraId)
        .in('status', ['planejada', 'em_execucao'])
        .order('name')
      
      if (error) {
        console.error('❌ Erro ao buscar ruas:', error)
        setRuas([])
      } else {
        console.log('✅ Ruas carregadas:', data?.length || 0)
        setRuas(
          data?.map(r => ({
            id: r.id,
            nome: r.name,
            obra_id: r.obra_id,
            status: r.status as 'planejada' | 'em_execucao' | 'concluida'
          })) || []
        )
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ruas:', error)
      setRuas([])
    } finally {
      setLoadingRuas(false)
    }
  }

  const clientesOptions = clientes.map(c => ({
    value: c.id,
    label: c.nome
  }))

  const obrasOptions = obras.map(o => ({
    value: o.id,
    label: o.nome
  }))

  const ruasOptions = ruas.map(r => ({
    value: r.id,
    label: `${r.nome} ${r.status === 'em_execucao' ? '(Em Execução)' : ''}`
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cliente */}
      <div>
        <Select
          value={clienteId}
          onChange={onClienteChange}
          options={[
            { value: '', label: loadingClientes ? 'Carregando...' : 'Selecione o cliente' },
            ...clientesOptions
          ]}
          label="Cliente"
          placeholder={loadingClientes ? 'Carregando...' : "Selecione o cliente"}
          required
          disabled={loadingClientes}
        />
        {!loadingClientes && clientes.length === 0 && (
          <p className="text-xs text-orange-600 mt-1">Nenhum cliente disponível</p>
        )}
      </div>

      {/* Obra */}
      <div>
        <Select
          value={obraId}
          onChange={onObraChange}
          options={[
            { value: '', label: !clienteId ? 'Selecione o cliente primeiro' : loadingObras ? 'Carregando...' : 'Selecione a obra' },
            ...obrasOptions
          ]}
          label="Obra"
          placeholder={loadingObras ? 'Carregando...' : "Selecione a obra"}
          required
          disabled={!clienteId || loadingObras}
        />
        {clienteId && !loadingObras && obras.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">Nenhuma obra cadastrada para este cliente</p>
        )}
      </div>

      {/* Rua */}
      <div>
        <Select
          value={ruaId}
          onChange={onRuaChange}
          options={[
            { value: '', label: !obraId ? 'Selecione a obra primeiro' : loadingRuas ? 'Carregando...' : 'Selecione a rua' },
            ...ruasOptions
          ]}
          label="Rua"
          placeholder={loadingRuas ? 'Carregando...' : "Selecione a rua"}
          required
          disabled={!obraId || loadingRuas}
        />
        {obraId && !loadingRuas && ruas.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Nenhuma rua pendente ou em andamento disponível
          </p>
        )}
      </div>
    </div>
  )
}


