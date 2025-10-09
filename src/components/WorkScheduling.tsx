import React, { useState } from 'react'
import { Button } from './Button'
import { Badge } from './Badge'
import { format } from 'date-fns'

type ScheduledWork = {
  id: string
  work_name: string
  client_name: string
  start_date: string
  end_date: string
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
  responsible_company: 'WorldPav' | 'Pavin'
  equipment_required: string[]
  team_size: number
  estimated_hours: number
  priority: 'baixa' | 'media' | 'alta'
  location: string
  notes?: string
}

type WorkSchedulingProps = {
  clientId?: string
  onWorkSelect?: (work: ScheduledWork) => void
}

export const WorkScheduling: React.FC<WorkSchedulingProps> = ({ 
  clientId, 
  onWorkSelect 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  // Mock data - será substituído por dados reais do banco
  const mockScheduledWorks: ScheduledWork[] = [
    {
      id: '1',
      work_name: 'Pavimentação Residencial - Condomínio ABC',
      client_name: 'Construtora ABC Ltda',
      start_date: '2024-02-01',
      end_date: '2024-02-15',
      status: 'agendada',
      responsible_company: 'WorldPav',
      equipment_required: ['Bomba Estacionária', 'Rolo Compactador'],
      team_size: 4,
      estimated_hours: 80,
      priority: 'alta',
      location: 'Condomínio ABC - São Paulo/SP',
      notes: 'Obra com prazo apertado, priorizar recursos'
    },
    {
      id: '2',
      work_name: 'Recapeamento - Rua das Flores',
      client_name: 'Prefeitura Municipal',
      start_date: '2024-02-05',
      end_date: '2024-02-10',
      status: 'agendada',
      responsible_company: 'Pavin',
      equipment_required: ['Bomba Lança', 'Pavimentadora'],
      team_size: 3,
      estimated_hours: 40,
      priority: 'media',
      location: 'Rua das Flores - Centro',
      notes: 'Trabalho noturno, evitar ruído'
    },
    {
      id: '3',
      work_name: 'Manutenção - Estacionamento Shopping',
      client_name: 'Shopping Center XYZ',
      start_date: '2024-01-25',
      end_date: '2024-01-30',
      status: 'em_andamento',
      responsible_company: 'WorldPav',
      equipment_required: ['Bomba Estacionária'],
      team_size: 2,
      estimated_hours: 24,
      priority: 'baixa',
      location: 'Shopping Center XYZ - São Paulo/SP'
    }
  ]

  const filteredWorks = clientId 
    ? mockScheduledWorks.filter(work => work.client_name.toLowerCase().includes(clientId.toLowerCase()))
    : mockScheduledWorks

  function getStatusBadge(status: string) {
    const variants = {
      'agendada': 'secondary',
      'em_andamento': 'warning',
      'concluida': 'success',
      'cancelada': 'danger'
    } as const
    return variants[status as keyof typeof variants] || 'secondary'
  }

  function getPriorityBadge(priority: string) {
    const variants = {
      'baixa': 'secondary',
      'media': 'warning',
      'alta': 'danger'
    } as const
    return variants[priority as keyof typeof variants] || 'secondary'
  }

  function getCompanyBadge(company: string) {
    return company === 'WorldPav' ? 'primary' : 'info'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Programação de Obras</h3>
          <p className="text-sm text-gray-500">
            {clientId ? 'Obras agendadas para este cliente' : 'Todas as obras agendadas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendário
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            📋 Lista
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos</option>
              <option value="agendada">Agendada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas</option>
              <option value="WorldPav">WorldPav</option>
              <option value="Pavin">Pavin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredWorks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Nenhuma obra encontrada para os filtros selecionados.</p>
            </div>
          ) : (
            filteredWorks.map((work) => (
              <div key={work.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{work.work_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{work.client_name}</p>
                    <p className="text-sm text-gray-500 mt-1">📍 {work.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadge(work.status)} size="sm">
                      {work.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={getPriorityBadge(work.priority)} size="sm">
                      {work.priority.toUpperCase()}
                    </Badge>
                    <Badge variant={getCompanyBadge(work.responsible_company)} size="sm">
                      {work.responsible_company}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Início:</span>
                    <span className="ml-2 font-medium">{format(new Date(work.start_date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fim:</span>
                    <span className="ml-2 font-medium">{format(new Date(work.end_date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Equipe:</span>
                    <span className="ml-2 font-medium">{work.team_size} pessoas</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Horas Est.:</span>
                    <span className="ml-2 font-medium">{work.estimated_hours}h</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-500 text-sm">Equipamentos necessários:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {work.equipment_required.map((equipment, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>

                {work.notes && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">Observações:</span>
                    <p className="text-sm text-gray-700 mt-1">{work.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    📝 Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    📋 Relatório
                  </Button>
                  {onWorkSelect && (
                    <Button size="sm" onClick={() => onWorkSelect(work)}>
                      Selecionar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualização de Calendário</h3>
            <p className="text-gray-500 mb-4">
              A visualização em calendário será implementada com uma biblioteca de calendário.
            </p>
            <Button variant="outline" onClick={() => setViewMode('list')}>
              Ver como Lista
            </Button>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {filteredWorks.length} obra(s) encontrada(s)
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            📊 Relatório de Programação
          </Button>
          <Button>
            ➕ Nova Programação
          </Button>
        </div>
      </div>
    </div>
  )
}






