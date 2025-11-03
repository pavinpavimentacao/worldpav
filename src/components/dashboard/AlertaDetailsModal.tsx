import React, { useEffect, useState } from 'react'
import { X, AlertTriangle, Calendar, User, FileText, Wrench, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AlertaDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: 'manutencao' | 'conta' | 'licenca' | 'documento'
  mensagem: string
  urgencia: 'alta' | 'media'
}

interface DetalheItem {
  id: string
  titulo: string
  subtitulo?: string
  data?: string
  valor?: number
  status?: string
  diasAtraso?: number
}

export const AlertaDetailsModal: React.FC<AlertaDetailsModalProps> = ({
  isOpen,
  onClose,
  tipo,
  mensagem,
  urgencia
}) => {
  const [loading, setLoading] = useState(true)
  const [detalhes, setDetalhes] = useState<DetalheItem[]>([])

  useEffect(() => {
    if (isOpen) {
      carregarDetalhes()
    }
  }, [isOpen, tipo, mensagem])

  const carregarDetalhes = async () => {
    setLoading(true)
    const hoje = format(new Date(), 'yyyy-MM-dd')

    try {
      if (tipo === 'conta') {
        // Contas atrasadas ou a vencer
        if (mensagem.includes('atrasadas')) {
          const { data } = await supabase
            .from('contas_pagar')
            .select('id, description, supplier, amount, due_date, status')
            .in('status', ['pendente', 'atrasado'])
            .lt('due_date', hoje)
            .order('due_date', { ascending: true })

          setDetalhes((data || []).map((conta: any) => {
            const diasAtraso = Math.floor(
              (new Date().getTime() - new Date(conta.due_date).getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
              id: conta.id,
              titulo: conta.description || 'Sem descrição',
              subtitulo: conta.supplier || 'Fornecedor não informado',
              data: conta.due_date,
              valor: conta.amount,
              status: conta.status,
              diasAtraso
            }
          }))
        } else if (mensagem.includes('7 dias')) {
          const dataLimite = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
          const { data } = await supabase
            .from('contas_pagar')
            .select('id, description, supplier, amount, due_date, status')
            .eq('status', 'pendente')
            .gte('due_date', hoje)
            .lte('due_date', dataLimite)
            .order('due_date', { ascending: true })

          setDetalhes((data || []).map((conta: any) => ({
            id: conta.id,
            titulo: conta.description || 'Sem descrição',
            subtitulo: conta.supplier || 'Fornecedor não informado',
            data: conta.due_date,
            valor: conta.amount,
            status: conta.status
          })))
        }
      } else if (tipo === 'documento') {
        // Documentos vencidos
        if (mensagem.includes('Documentos pessoais')) {
          const { data } = await supabase
            .from('colaboradores_documentos')
            .select(`
              id,
              document_type,
              expiry_date,
              colaborador:colaboradores(name)
            `)
            .not('expiry_date', 'is', null)
            .lt('expiry_date', hoje)
            .order('expiry_date', { ascending: true })

          setDetalhes((data || []).map((doc: any) => {
            const diasVencido = Math.floor(
              (new Date().getTime() - new Date(doc.expiry_date).getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
              id: doc.id,
              titulo: `${doc.document_type || 'Documento'}`,
              subtitulo: doc.colaborador?.name || 'Colaborador não encontrado',
              data: doc.expiry_date,
              diasAtraso: diasVencido
            }
          }))
        } else if (mensagem.includes('Certificados')) {
          const { data } = await supabase
            .from('colaboradores_certificados')
            .select(`
              id,
              tipo,
              validade,
              colaborador:colaboradores(name)
            `)
            .lt('validade', hoje)
            .order('validade', { ascending: true })

          setDetalhes((data || []).map((cert: any) => {
            const diasVencido = Math.floor(
              (new Date().getTime() - new Date(cert.validade).getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
              id: cert.id,
              titulo: cert.tipo || 'Certificado',
              subtitulo: cert.colaborador?.name || 'Colaborador não encontrado',
              data: cert.validade,
              diasAtraso: diasVencido
            }
          }))
        } else if (mensagem.includes('Seguros')) {
          const { data } = await supabase
            .from('maquinarios_seguros')
            .select(`
              id,
              expiry_date,
              maquinario:maquinarios(name)
            `)
            .lt('expiry_date', hoje)
            .order('expiry_date', { ascending: true })

          setDetalhes((data || []).map((seg: any) => {
            const diasVencido = Math.floor(
              (new Date().getTime() - new Date(seg.expiry_date).getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
              id: seg.id,
              titulo: 'Seguro',
              subtitulo: seg.maquinario?.name || 'Maquinário não encontrado',
              data: seg.expiry_date,
              diasAtraso: diasVencido
            }
          }))
        }
      } else if (tipo === 'licenca') {
        const { data } = await supabase
          .from('maquinarios_licencas')
          .select(`
            id,
            license_type,
            expiry_date,
            maquinario:maquinarios(name)
          `)
          .lt('expiry_date', hoje)
          .order('expiry_date', { ascending: true })

        setDetalhes((data || []).map((lic: any) => {
          const diasVencido = Math.floor(
            (new Date().getTime() - new Date(lic.expiry_date).getTime()) / (1000 * 60 * 60 * 24)
          )
          return {
            id: lic.id,
            titulo: lic.license_type || 'Licença',
            subtitulo: lic.maquinario?.name || 'Maquinário não encontrado',
            data: lic.expiry_date,
            diasAtraso: diasVencido
          }
        }))
      } else if (tipo === 'manutencao') {
        const { data } = await supabase
          .from('maquinarios')
          .select('id, name, next_maintenance_date')
          .not('next_maintenance_date', 'is', null)
          .lt('next_maintenance_date', hoje)
          .neq('status', 'inativo')
          .order('next_maintenance_date', { ascending: true })

        setDetalhes((data || []).map((maq: any) => {
          const diasAtraso = Math.floor(
            (new Date().getTime() - new Date(maq.next_maintenance_date).getTime()) / (1000 * 60 * 60 * 24)
          )
          return {
            id: maq.id,
            titulo: maq.name || 'Maquinário',
            data: maq.next_maintenance_date,
            diasAtraso
          }
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getIcon = () => {
    switch (tipo) {
      case 'conta': return <DollarSign className="w-6 h-6" />
      case 'documento': return <FileText className="w-6 h-6" />
      case 'licenca': return <FileText className="w-6 h-6" />
      case 'manutencao': return <Wrench className="w-6 h-6" />
      default: return <AlertTriangle className="w-6 h-6" />
    }
  }

  const getCorUrgencia = () => {
    return urgencia === 'alta' 
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-yellow-50 border-yellow-200 text-yellow-700'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 border-b border-gray-200 flex items-center justify-between ${getCorUrgencia()}`}>
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h3 className="text-lg font-semibold">{mensagem}</h3>
                <p className="text-sm opacity-75">
                  {detalhes.length} {detalhes.length === 1 ? 'item encontrado' : 'itens encontrados'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : detalhes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum item encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {detalhes.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.titulo}</span>
                          {item.diasAtraso !== undefined && item.diasAtraso > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                              Vencido há {item.diasAtraso} dia{item.diasAtraso !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {item.subtitulo && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                            <User className="w-3.5 h-3.5" />
                            {item.subtitulo}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {item.data && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(item.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                          )}

                          {item.valor !== undefined && (
                            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <DollarSign className="w-3.5 h-3.5" />
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(item.valor)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

