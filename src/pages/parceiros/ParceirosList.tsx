import React, { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { Plus, Search, Building2, Phone, Mail, MapPin, Eye, DollarSign, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getParceiros } from '../../lib/parceirosApi'
import { Parceiro, NichoParceiro, nichoLabels } from '../../types/parceiros'
import { Input } from '../../components/ui/input'

const ParceirosList = () => {
  const navigate = useNavigate()
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNicho, setFilterNicho] = useState<NichoParceiro | ''>('')

  useEffect(() => {
    loadParceiros()
  }, [])

  async function loadParceiros() {
    try {
      setLoading(true)
      const data = await getParceiros()
      setParceiros(data)
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar parceiros
  const filteredParceiros = parceiros.filter(parceiro => {
    const matchesSearch = 
      parceiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parceiro.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parceiro.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNicho = filterNicho === '' || parceiro.nicho === filterNicho
    return matchesSearch && matchesNicho
  })

  const getNichoBadgeColor = (nicho: NichoParceiro) => {
    switch (nicho) {
      case 'usina_asfalto':
        return 'bg-blue-100 text-blue-800'
      case 'usina_rr2c':
        return 'bg-purple-100 text-purple-800'
      case 'empreiteiro':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Parceiros</h2>
            <p className="text-gray-600 mt-1">
              Gerencie usinas de asfalto, RR2C e empreiteiros parceiros
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={() => navigate('/parceiros/novo')}
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Parceiro
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Parceiro
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Digite o nome, endereço ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filterNicho}
              onChange={(value) => setFilterNicho(value as NichoParceiro | '')}
              options={[
                { value: '', label: 'Todos os nichos' },
                { value: 'usina_asfalto', label: nichoLabels.usina_asfalto },
                { value: 'usina_rr2c', label: nichoLabels.usina_rr2c },
                { value: 'empreiteiro', label: nichoLabels.empreiteiro }
              ]}
              label="Filtrar por Nicho"
              placeholder="Selecione o nicho"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {parceiros.filter(p => p.nicho === 'usina_asfalto').length}
                </p>
                <p className="text-sm text-gray-600">Usinas de Asfalto</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {parceiros.filter(p => p.nicho === 'usina_rr2c').length}
                </p>
                <p className="text-sm text-gray-600">Usinas de RR2C</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {parceiros.filter(p => p.nicho === 'empreiteiro').length}
                </p>
                <p className="text-sm text-gray-600">Empreiteiros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Parceiros */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando parceiros...</p>
          </div>
        ) : filteredParceiros.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Nenhum parceiro encontrado</p>
            <p className="text-gray-500 text-sm mt-1">
              Ajuste os filtros ou cadastre um novo parceiro
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParceiros.map(parceiro => (
              <div
                key={parceiro.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => navigate(`/parceiros/${parceiro.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {parceiro.nome}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getNichoBadgeColor(parceiro.nicho)}`}>
                      {nichoLabels[parceiro.nicho]}
                    </span>
                  </div>
                </div>

                {/* Informações */}
                <div className="space-y-2 mb-4">
                  {parceiro.contato && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{parceiro.contato}</span>
                    </div>
                  )}

                  {parceiro.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{parceiro.telefone}</span>
                    </div>
                  )}

                  {parceiro.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{parceiro.email}</span>
                    </div>
                  )}

                  {parceiro.endereco && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{parceiro.endereco}</span>
                    </div>
                  )}
                </div>

                {/* Informações específicas */}
                {parceiro.nicho === 'usina_asfalto' && parceiro.precos_faixas && parceiro.precos_faixas.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {parceiro.precos_faixas.length} faixa(s) com preço
                      </span>
                    </div>
                    <div className="space-y-1">
                      {parceiro.precos_faixas.slice(0, 3).map(({ faixa, preco_tonelada }) => (
                        <div key={faixa} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{faixa.toUpperCase()}</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(preco_tonelada)}
                          </span>
                        </div>
                      ))}
                      {parceiro.precos_faixas.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{parceiro.precos_faixas.length - 3} faixa(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Botão Ver Detalhes */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/parceiros/${parceiro.id}`)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ParceirosList

