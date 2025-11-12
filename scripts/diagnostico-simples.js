/**
 * Script simples para diagnosticar ruas e faturamentos
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

// Ler .env.local
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
    console.error('Erro ao ler .env.local:', error.message)
    process.exit(1)
  }
}

const env = loadEnv()
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE RUAS E FATURAMENTOS\n')
  
  try {
    const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
    
    console.log('📊 Obra ID:', obraId)
    console.log('=' .repeat(50) + '\n')
    
    // Buscar ruas
    const { data: ruas, error: ruasError } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (ruasError) {
      console.error('❌ Erro ao buscar ruas:', ruasError)
      return
    }

    console.log(`Total de ruas: ${ruas.length}\n`)
    
    // Status das ruas
    const statusCount = { planejada: 0, em_execucao: 0, concluida: 0 }
    ruas.forEach(rua => statusCount[rua.status]++)
    
    console.log('Status das ruas:')
    console.log(`  - Planejadas: ${statusCount.planejada}`)
    console.log(`  - Em execução: ${statusCount.em_execucao}`)
    console.log(`  - Concluídas: ${statusCount.concluida}\n`)
    
    console.log('Detalhes das ruas:')
    console.log('-'.repeat(70))
    ruas.forEach((rua, i) => {
      console.log(`\nRua ${i + 1}: ${rua.name}`)
      console.log(`  Status: ${rua.status}`)
      console.log(`  Metragem planejada: ${rua.metragem_planejada || 'N/A'} m²`)
      console.log(`  Metragem executada: ${rua.metragem_executada || 'N/A'} m²`)
      console.log(`  Toneladas: ${rua.toneladas_utilizadas || 'N/A'}`)
      console.log(`  Preço/m²: ${rua.preco_por_m2 || 'N/A'}`)
      console.log(`  Valor total: ${rua.valor_total || 'N/A'}`)
      
      if (rua.metragem_executada && rua.metragem_executada > 0 && rua.status !== 'concluida') {
        console.log(`  ⚠️ PROBLEMA: Tem metragem executada mas status não é 'concluida'`)
      }
    })
    
    console.log('\n' + '='.repeat(70))
    console.log('💰 FATURAMENTOS\n')
    
    const { data: faturamentos, error: fatError } = await supabase
      .from('obras_financeiro_faturamentos')
      .select('*, rua:obras_ruas(*)')
      .eq('obra_id', obraId)
      .is('deleted_at', null)

    if (fatError) {
      console.error('❌ Erro:', fatError)
    } else {
      console.log(`Total de faturamentos: ${faturamentos.length}\n`)
      
      faturamentos.forEach((fat, i) => {
        console.log(`Faturamento ${i + 1}:`)
        console.log(`  Rua: ${fat.rua?.name || 'N/A'}`)
        console.log(`  Metragem: ${fat.metragem_executada} m²`)
        console.log(`  Preço/m²: R$ ${fat.preco_por_m2}`)
        console.log(`  Valor total: R$ ${fat.valor_total}`)
        
        const esperado = fat.metragem_executada * fat.preco_por_m2
        if (Math.abs(fat.valor_total - esperado) > 0.01) {
          console.log(`  ⚠️ PROBLEMA: Valor incorreto!`)
          console.log(`     Esperado: R$ ${esperado.toFixed(2)}`)
        }
      })
    }
    
    console.log('\n✅ Diagnóstico concluído!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

diagnosticar()







