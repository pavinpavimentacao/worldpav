import React, { useState, useEffect } from 'react'
import { Building2, Briefcase, MapPin } from 'lucide-react'
import { Select } from '../Select'

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
  status: 'pendente' | 'em_andamento' | 'finalizada'
}

interface SelecionarClienteObraRuaProps {
  clienteId: string
  obraId: string
  ruaId: string
  onClienteChange: (clienteId: string) => void
  onObraChange: (obraId: string) => void
  onRuaChange: (ruaId: string) => void
}

// ========== MOCKUPS ==========
const mockClientes: Cliente[] = [
  { id: 'cli-1', nome: 'Prefeitura de Osasco' },
  { id: 'cli-2', nome: 'Construtora ABC' },
  { id: 'cli-3', nome: 'Prefeitura de Barueri' },
  { id: 'cli-4', nome: 'Incorporadora XYZ' }
]

const mockObras: Obra[] = [
  { id: '1', nome: 'Pavimentação Rua das Flores - Osasco', cliente_id: 'cli-1' },
  { id: '2', nome: 'Avenida Central - Barueri', cliente_id: 'cli-2' },
  { id: '3', nome: 'Conjunto Residencial Vila Nova', cliente_id: 'cli-4' },
  { id: '4', nome: 'Recapeamento Av. Principal - Osasco', cliente_id: 'cli-1' },
  { id: '5', nome: 'Pavimentação Bairro Industrial', cliente_id: 'cli-3' }
]

const mockRuas: Rua[] = [
  { id: 'rua-1', nome: 'Rua das Flores - Trecho 1', obra_id: '1', status: 'finalizada' },
  { id: 'rua-2', nome: 'Rua das Flores - Trecho 2', obra_id: '1', status: 'pendente' },
  { id: 'rua-3', nome: 'Rua das Flores - Trecho 3', obra_id: '1', status: 'em_andamento' },
  { id: 'rua-4', nome: 'Avenida Central - Quadra A', obra_id: '2', status: 'pendente' },
  { id: 'rua-5', nome: 'Avenida Central - Quadra B', obra_id: '2', status: 'em_andamento' },
  { id: 'rua-6', nome: 'Rua Principal - Bloco 1', obra_id: '3', status: 'pendente' },
  { id: 'rua-7', nome: 'Rua Principal - Bloco 2', obra_id: '3', status: 'pendente' },
  { id: 'rua-8', nome: 'Av. Principal - Trecho Norte', obra_id: '4', status: 'em_andamento' },
  { id: 'rua-9', nome: 'Rua Industrial 1', obra_id: '5', status: 'pendente' }
]

export function SelecionarClienteObraRua({
  clienteId,
  obraId,
  ruaId,
  onClienteChange,
  onObraChange,
  onRuaChange
}: SelecionarClienteObraRuaProps) {
  const [obrasFiltradas, setObrasFiltradas] = useState<Obra[]>([])
  const [ruasFiltradas, setRuasFiltradas] = useState<Rua[]>([])

  // Filtrar obras quando cliente mudar
  useEffect(() => {
    if (clienteId) {
      const obras = mockObras.filter(o => o.cliente_id === clienteId)
      setObrasFiltradas(obras)
      
      // Se a obra selecionada não pertence ao cliente, limpar
      if (obraId && !obras.find(o => o.id === obraId)) {
        onObraChange('')
        onRuaChange('')
      }
    } else {
      setObrasFiltradas([])
      onObraChange('')
      onRuaChange('')
    }
  }, [clienteId])

  // Filtrar ruas quando obra mudar
  useEffect(() => {
    if (obraId) {
      // Apenas ruas pendentes ou em andamento
      const ruas = mockRuas.filter(
        r => r.obra_id === obraId && (r.status === 'pendente' || r.status === 'em_andamento')
      )
      setRuasFiltradas(ruas)
      
      // Se a rua selecionada não pertence à obra, limpar
      if (ruaId && !ruas.find(r => r.id === ruaId)) {
        onRuaChange('')
      }
    } else {
      setRuasFiltradas([])
      onRuaChange('')
    }
  }, [obraId])

  const clientesOptions = mockClientes.map(c => ({
    value: c.id,
    label: c.nome
  }))

  const obrasOptions = obrasFiltradas.map(o => ({
    value: o.id,
    label: o.nome
  }))

  const ruasOptions = ruasFiltradas.map(r => ({
    value: r.id,
    label: `${r.nome} ${r.status === 'em_andamento' ? '(Em Andamento)' : ''}`
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cliente */}
      <div>
        <Select
          value={clienteId}
          onChange={onClienteChange}
          options={[
            { value: '', label: 'Selecione o cliente' },
            ...clientesOptions
          ]}
          label="Cliente"
          placeholder="Selecione o cliente"
          required
        />
      </div>

      {/* Obra */}
      <div>
        <Select
          value={obraId}
          onChange={onObraChange}
          options={[
            { value: '', label: clienteId ? 'Selecione a obra' : 'Selecione o cliente primeiro' },
            ...obrasOptions
          ]}
          label="Obra"
          placeholder="Selecione a obra"
          required
          disabled={!clienteId}
        />
        {clienteId && obrasFiltradas.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">Nenhuma obra cadastrada para este cliente</p>
        )}
      </div>

      {/* Rua */}
      <div>
        <Select
          value={ruaId}
          onChange={onRuaChange}
          options={[
            { value: '', label: obraId ? 'Selecione a rua' : 'Selecione a obra primeiro' },
            ...ruasOptions
          ]}
          label="Rua"
          placeholder="Selecione a rua"
          required
          disabled={!obraId}
        />
        {obraId && ruasFiltradas.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Nenhuma rua pendente ou em andamento disponível
          </p>
        )}
      </div>
    </div>
  )
}


