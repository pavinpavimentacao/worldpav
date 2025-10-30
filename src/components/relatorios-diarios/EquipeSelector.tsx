import React, { useState, useEffect } from 'react'
import { Users, Building } from 'lucide-react'
import { Select } from "../shared/Select"
import { EquipeSelecionavel } from '../../types/relatorios-diarios'
import { getEquipesParceiros } from '../../lib/parceirosApi'
import { getEquipes } from '../../lib/equipesApi' // ✅ CORRIGIDO: Importar da tabela equipes
import { supabase } from '../../lib/supabase' // ✅ Importar supabase para buscar colaborador
import { useAuth } from '../../lib/auth'

interface EquipeSelectorProps {
  equipeId: string
  onChange: (equipeId: string, isTerceira: boolean, tipoEquipe?: string) => void
}

export function EquipeSelector({ equipeId, onChange }: EquipeSelectorProps) {
  const [equipes, setEquipes] = useState<EquipeSelecionavel[]>([])
  const [loading, setLoading] = useState(true)
  const [equipeIdSelecionada, setEquipeIdSelecionada] = useState<string>('') // ✅ Armazenar equipe_id separadamente
  const [colaboradorIdParaEquipe, setColaboradorIdParaEquipe] = useState<Map<string, string>>(new Map()) // ✅ Mapear equipe_id -> colaborador_id
  const { jwtUser } = useAuth();

  useEffect(() => {
    console.log('🔍 [EquipeSelector] useEffect disparado, jwtUser:', JSON.stringify(jwtUser, null, 2));
    console.log('🔍 [EquipeSelector] companyId:', jwtUser?.companyId);
    
    // Se jwtUser está disponível mas companyId não, tenta carregar diretamente do localStorage
    if (!jwtUser?.companyId && jwtUser?.userId) {
      try {
        const token = localStorage.getItem('jwt_token');
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 [EquipeSelector] Token decodificado:', decoded);
          if (decoded.companyId) {
            console.log('✅ [EquipeSelector] CompanyId encontrado no token:', decoded.companyId);
          }
        }
      } catch (e) {
        console.error('Erro ao decodificar token:', e);
      }
    }
    
    if (jwtUser?.companyId) {
      console.log('✅ [EquipeSelector] Chamando loadEquipes...');
      loadEquipes()
    } else {
      console.log('❌ [EquipeSelector] companyId não disponível!');
      // Tenta carregar com companyId padrão como fallback
      console.log('🔄 [EquipeSelector] Tentando carregar com fallback...');
      loadEquipes();
    }
  }, [jwtUser?.companyId, jwtUser?.userId])

  async function loadEquipes() {
    try {
      setLoading(true)
      console.log('🔍 [EquipeSelector] Carregando equipes...');
      console.log('🔍 [EquipeSelector] Company ID:', jwtUser?.companyId);
      
      // Usar companyId padrão se não estiver disponível
      const companyId = jwtUser?.companyId || '39cf8b61-6737-4aa5-af3f-51fba9f12345'; // Company ID padrão
      console.log('✅ [EquipeSelector] Usando companyId:', companyId);
      
      let equipesProprias: EquipeSelecionavel[] = [];
      
      try {
        // ✅ Tentar buscar equipes próprias da tabela equipes
        console.log('🔍 [EquipeSelector] Chamando getEquipes com companyId:', companyId);
        const equipesPropriasBanco = await getEquipes(companyId);
        console.log('✅ [EquipeSelector] Equipes retornadas do banco:', equipesPropriasBanco);
        console.log('✅ [EquipeSelector] Total de equipes:', equipesPropriasBanco?.length || 0);
        if (equipesPropriasBanco && equipesPropriasBanco.length > 0) {
          equipesPropriasBanco.forEach((eq, i) => {
            console.log(`  ${i + 1}. ${eq.name} (ID: ${eq.id}, Prefixo: ${eq.prefixo})`);
          });
        }
        
        // Mapear para formato selecionável - filtrar equipes com nome inválido e buscar quantidade de colaboradores
        equipesProprias = await Promise.all(
          equipesPropriasBanco
            .filter(eq => {
              // Filtrar equipes sem nome ou com nome vazio
              const hasValidName = eq.name && eq.name.trim().length > 0;
              if (!hasValidName) {
                console.warn(`⚠️ [EquipeSelector] Equipe com ID ${eq.id} tem nome inválido:`, eq.name);
              }
              return hasValidName;
            })
            .map(async eq => {
              // ✅ Buscar quantidade real de colaboradores vinculados à equipe
              let quantidadePessoas = 0;
              try {
                const { count, error: countError } = await supabase
                  .from('colaboradores')
                  .select('*', { count: 'exact', head: true })
                  .eq('equipe_id', eq.id)
                  .is('deleted_at', null);
                
                if (!countError && count !== null) {
                  quantidadePessoas = count;
                  console.log(`✅ [EquipeSelector] Equipe ${eq.name} tem ${quantidadePessoas} colaborador(es)`);
                } else if (countError) {
                  console.warn(`⚠️ [EquipeSelector] Erro ao contar colaboradores da equipe ${eq.name}:`, countError);
                }
              } catch (error) {
                console.warn(`⚠️ [EquipeSelector] Exceção ao contar colaboradores da equipe ${eq.name}:`, error);
              }
              
              return {
                id: eq.id,
                nome: eq.name.trim(), // ✅ Usar 'name' da tabela equipes e remover espaços
                tipo_equipe: undefined, // Não há mais tipo_equipe na nova estrutura
                is_terceira: false,
                quantidade_pessoas: quantidadePessoas, // ✅ Quantidade real de colaboradores
                especialidade: eq.descricao || 'Equipe de Pavimentação' // ✅ Usar descricao
              };
            })
        );
        
        console.log('✅ [EquipeSelector] Equipes próprias da tabela equipes (após filtro):', equipesProprias.length);
      } catch (error) {
        console.warn('⚠️ [EquipeSelector] Tabela equipes não existe ou erro ao buscar. Usando fallback...');
        
        // ✅ FALLBACK: Criar equipes baseadas nos colaboradores existentes
        const { data: colaboradores, error: colError } = await supabase
          .from('colaboradores')
          .select('tipo_equipe')
          .eq('company_id', companyId)
          .not('tipo_equipe', 'is', null)
          .is('deleted_at', null);
          
        if (!colError && colaboradores) {
          // Agrupar por tipo_equipe
          const tiposUnicos = [...new Set(colaboradores.map(c => c.tipo_equipe))];
          
          equipesProprias = tiposUnicos.map(tipo => ({
            id: `fallback-${tipo}`,
            nome: tipo === 'pavimentacao' ? 'Equipe de Pavimentação' : 
                  tipo === 'maquinas' ? 'Equipe de Máquinas' : 
                  tipo === 'apoio' ? 'Equipe de Apoio' : 
                  `Equipe ${tipo}`,
            tipo_equipe: tipo,
            is_terceira: false,
            quantidade_pessoas: colaboradores.filter(c => c.tipo_equipe === tipo).length,
            especialidade: `Equipe de ${tipo}`
          }));
          
          console.log('✅ [EquipeSelector] Equipes criadas via fallback:', equipesProprias.length);
        }
      }
      
      // Buscar equipes de parceiros
      const equipesParc = await getEquipesParceiros()
      console.log('✅ [EquipeSelector] Equipes de parceiros:', equipesParc.length);
      
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
      const todasEquipes = [...equipesProprias, ...equipesTerceiras];
      console.log('✅ [EquipeSelector] Total de equipes:', todasEquipes.length);
      console.log('✅ [EquipeSelector] Equipes:', todasEquipes);
      setEquipes(todasEquipes)
    } catch (error) {
      console.error('❌ [EquipeSelector] Erro ao carregar equipes:', error)
      // Em caso de erro, retorna array vazio
      setEquipes([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (value: string) => {
    console.log('🔍 [EquipeSelector] handleChange chamado com value:', value)
    console.log('🔍 [EquipeSelector] Total de equipes disponíveis:', equipes.length)
    equipes.forEach((eq, i) => {
      console.log(`  ${i + 1}. ${eq.nome} (ID: ${eq.id}, is_terceira: ${eq.is_terceira})`)
    })
    
    if (!value || value === '') {
      console.log('⚠️ [EquipeSelector] Value vazio, ignorando')
      return
    }
    
    const equipeSelecionada = equipes.find(e => e.id === value)
    console.log('🔍 [EquipeSelector] Equipe encontrada:', equipeSelecionada ? equipeSelecionada.nome : 'NÃO ENCONTRADA')
    
    if (!equipeSelecionada) {
      console.error('❌ [EquipeSelector] Equipe não encontrada para ID:', value)
      // Mesmo assim, tentar passar o valor para não bloquear a seleção
      onChange(value, false, undefined)
      return
    }
    
    // Se é uma equipe própria, tentar buscar um colaborador dessa equipe
    // MAS sempre garantir que onChange é chamado no final
    if (!equipeSelecionada.is_terceira && !value.startsWith('fallback-')) {
      try {
        console.log('🔍 [EquipeSelector] Buscando colaborador da equipe:', value)
        
        // Buscar um colaborador da equipe
        const { data: colaboradores, error } = await supabase
          .from('colaboradores')
          .select('id')
          .eq('equipe_id', value)
          .is('deleted_at', null)
          .limit(1)
        
        if (!error && colaboradores && colaboradores.length > 0) {
          const colaborador = colaboradores[0]
          console.log('✅ [EquipeSelector] Colaborador encontrado:', colaborador.id)
          // ✅ Armazenar mapeamento equipe_id -> colaborador_id
          setColaboradorIdParaEquipe(prev => {
            const novo = new Map(prev)
            novo.set(value, colaborador.id)
            return novo
          })
          // ✅ Atualizar equipeIdSelecionada para que o Select mostre a seleção corretamente
          setEquipeIdSelecionada(value)
          // ✅ Passar colaborador.id para o formulário
          onChange(colaborador.id, false, equipeSelecionada?.tipo_equipe)
          return
        } else {
          console.log('ℹ️ [EquipeSelector] Nenhum colaborador encontrado ou erro:', error)
        }
      } catch (error) {
        console.error('❌ [EquipeSelector] Erro ao buscar colaborador:', error)
      }
      
      // Se não encontrou colaborador ou deu erro, passar o equipe_id diretamente
      console.log('✅ [EquipeSelector] Nenhum colaborador encontrado, passando equipe_id diretamente:', value)
      setEquipeIdSelecionada(value)
      onChange(value, false, equipeSelecionada?.tipo_equipe)
      return
    }
    
    // Para equipes fallback ou terceiras
    if (value.startsWith('fallback-')) {
      const tipoEquipe = value.replace('fallback-', '')
      try {
        const { data: colaboradores } = await supabase
          .from('colaboradores')
          .select('id')
          .eq('tipo_equipe', tipoEquipe)
          .is('deleted_at', null)
          .limit(1)
        
        if (colaboradores && colaboradores.length > 0) {
          console.log('✅ [EquipeSelector] Colaborador encontrado (fallback):', colaboradores[0].id)
          setEquipeIdSelecionada(value)
          onChange(colaboradores[0].id, false, tipoEquipe)
          return
        }
      } catch (error) {
        console.error('❌ [EquipeSelector] Erro ao buscar colaborador (fallback):', error)
      }
      
      setEquipeIdSelecionada(value)
      onChange(value, false, tipoEquipe)
      return
    }
    
    // Para equipes terceiras ou caso padrão
    console.log('✅ [EquipeSelector] Passando valor para equipe terceira ou padrão:', value)
    setEquipeIdSelecionada(value)
    onChange(value, equipeSelecionada.is_terceira || false, equipeSelecionada?.tipo_equipe)
  }

  // Criar opções validando valores únicos e não vazios
  const equipesOptionsMap = new Map<string, string>()
  equipes.forEach(eq => {
    const idStr = String(eq.id || '').trim()
    const nomeStr = String(eq.nome || '').trim()
    
    if (idStr.length > 0 && nomeStr.length > 0) {
      // Evitar duplicatas (usar o primeiro encontrado)
      if (!equipesOptionsMap.has(idStr)) {
        equipesOptionsMap.set(idStr, eq.is_terceira 
          ? `${nomeStr} (Terceira - R$ ${eq.valor_diaria?.toFixed(2)}/dia)` 
          : nomeStr)
      } else {
        console.warn(`⚠️ [EquipeSelector] Equipe duplicada encontrada: ${idStr} - ${nomeStr}`)
      }
    } else {
      console.warn(`⚠️ [EquipeSelector] Equipe com dados inválidos ignorada:`, { id: eq.id, nome: eq.nome })
    }
  })

  const equipesOptions = Array.from(equipesOptionsMap.entries()).map(([id, label]) => ({
    value: id,
    label
  }))

  // Logs para debug
  console.log('🔍 [EquipeSelector] Render - equipeId atual:', equipeId)
  console.log('🔍 [EquipeSelector] Render - Total de equipes:', equipes.length)
  console.log('🔍 [EquipeSelector] Render - Total de opções válidas:', equipesOptions.length)
  equipesOptions.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt.label} (value: ${opt.value})`)
  })

  // Equipe selecionada - usar equipeIdSelecionada para o Select em vez de equipeId (que pode ser colaborador_id)
  const equipeSelecionada = equipes.find(e => e.id === equipeIdSelecionada || e.id === equipeId)
  console.log('🔍 [EquipeSelector] Render - Equipe selecionada:', equipeSelecionada ? equipeSelecionada.nome : 'NENHUMA')
  console.log('🔍 [EquipeSelector] Render - equipeId do formulário:', equipeId, 'equipeIdSelecionada:', equipeIdSelecionada)

  // ✅ Se recebemos um equipeId que é um colaborador_id, tentar encontrar o equipe_id correspondente
  useEffect(() => {
    if (equipeId && !equipeIdSelecionada) {
      // Verificar se equipeId corresponde a alguma equipe
      const equipeEncontrada = equipes.find(e => e.id === equipeId)
      if (equipeEncontrada) {
        setEquipeIdSelecionada(equipeId)
      } else {
        // Se não encontrou, pode ser um colaborador_id - buscar equipe_id do colaborador
        const encontrarEquipeIdDoColaborador = async () => {
          try {
            const { data: colaborador } = await supabase
              .from('colaboradores')
              .select('equipe_id')
              .eq('id', equipeId)
              .single()
            
            if (colaborador?.equipe_id) {
              console.log('✅ [EquipeSelector] Encontrou equipe_id do colaborador:', colaborador.equipe_id)
              setEquipeIdSelecionada(colaborador.equipe_id)
              setColaboradorIdParaEquipe(prev => {
                const novo = new Map(prev)
                novo.set(colaborador.equipe_id, equipeId)
                return novo
              })
            }
          } catch (error) {
            console.warn('⚠️ [EquipeSelector] Não foi possível encontrar equipe_id do colaborador:', error)
          }
        }
        encontrarEquipeIdDoColaborador()
      }
    }
  }, [equipeId, equipes])

  return (
    <div className="space-y-3">
      <Select
        value={equipeIdSelecionada || ''}
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


