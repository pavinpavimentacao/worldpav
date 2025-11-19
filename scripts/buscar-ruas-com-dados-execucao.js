/**
 * Buscar ruas que têm dados de execução mas não estão marcadas como concluídas
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

function loadEnv() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8')
    const env = {}
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=')
      if (key && value.length) {
        env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '')
      }
    })
    return env
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

const env = loadEnv()
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function buscar() {
  console.log('🔍 BUSCANDO RUAS COM DADOS DE EXECUÇÃO\n')
  
  try {
    // Buscar TODAS as ruas com qualquer metragem executada
    const { data: ruas, error } = await supabase
      .from('obras_ruas')
      .select('*, obra:obras(name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    console.log(`Total de ruas: ${ruas.length}\n`)
    
    // Filtrar ruas com metragem executada
    const ruasComExecucao = ruas.filter(r => r.metragem_executada && parseFloat(r.metragem_executada) > 0)
    
    console.log(`Ruas com metragem executada: ${ruasComExecucao.length}\n`)
    
    if (ruasComExecucao.length > 0) {
      console.log('Ruas com dados de execução:')
      console.log('='.repeat(80))
      
      ruasComExecucao.forEach((rua, i) => {
        console.log(`\n${i + 1}. Rua: ${rua.name}`)
        console.log(`   Obra: ${rua.obra?.name || rua.obra_id}`)
        console.log(`   ID: ${rua.id}`)
        console.log(`   Status: ${rua.status}`)
        console.log(`   Metragem executada: ${rua.metragem_executada} m²`)
        console.log(`   Toneladas: ${rua.toneladas_utilizadas || 'N/A'}`)
        console.log(`   Espessura: ${rua.espessura_calculada || 'N/A'} cm`)
        console.log(`   Preço/m²: ${rua.preco_por_m2 || 'N/A'}`)
        console.log(`   Valor total: ${rua.valor_total || 'N/A'}`)
        console.log(`   Data finalização: ${rua.data_finalizacao || 'N/A'}`)
        console.log(`   Data atualização: ${rua.updated_at}`)
        
        if (rua.status !== 'concluida') {
          console.log(`   ⚠️ PROBLEMA: Status não é 'concluida'!`)
        }
      })
    }
    
    // Verificar total de ruas por status
    const porStatus = { planejada: 0, em_execucao: 0, concluida: 0 }
    ruas.forEach(r => {
      if (r.status in porStatus) {
        porStatus[r.status]++
      }
    })
    
    console.log('\n' + '='.repeat(80))
    console.log('Resumo de todas as ruas:')
    console.log(`  Planejadas: ${porStatus.planejada}`)
    console.log(`  Em execução: ${porStatus.em_execucao}`)
    console.log(`  Concluídas: ${porStatus.concluida}`)
    
    console.log('\n✅ Busca concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

buscar()









