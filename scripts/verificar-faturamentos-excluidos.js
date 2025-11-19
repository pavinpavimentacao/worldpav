/**
 * Verificar faturamentos excluídos e ruas com dados de execução
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

async function verificar() {
  console.log('🔍 VERIFICANDO FATURAMENTOS E RUAS (incluindo excluídos)\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // 1. Buscar TODAS as ruas (incluindo excluídas)
    console.log('📊 Buscando todas as ruas...')
    const { data: todasRuas, error: ruasError } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: true })

    if (ruasError) {
      console.error('❌ Erro:', ruasError)
      return
    }

    console.log(`Total de ruas (incluindo excluídas): ${todasRuas.length}\n`)
    
    todasRuas.forEach(rua => {
      console.log(`Rua: ${rua.name}`)
      console.log(`  Status: ${rua.status}`)
      console.log(`  Deleted: ${rua.deleted_at ? 'SIM' : 'NÃO'}`)
      console.log(`  Metragem executada: ${rua.metragem_executada || 'N/A'}`)
      console.log(`  Toneladas: ${rua.toneladas_utilizadas || 'N/A'}`)
      console.log(`  Preço/m²: ${rua.preco_por_m2 || 'N/A'}`)
      console.log(`  Valor total: ${rua.valor_total || 'N/A'}`)
      console.log(`  Data finalização: ${rua.data_finalizacao || 'N/A'}`)
      console.log('')
    })
    
    // 2. Buscar TODOS os faturamentos (incluindo excluídos)
    console.log('\n💰 Buscando todos os faturamentos...')
    const { data: todosFats, error: fatsError } = await supabase
      .from('obras_financeiro_faturamentos')
      .select('*, rua:obras_ruas(*), obra:obras(name)')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false })

    if (fatsError) {
      console.error('❌ Erro:', fatsError)
    } else {
      console.log(`Total de faturamentos (incluindo excluídos): ${todosFats.length}\n`)
      
      if (todosFats.length > 0) {
        todosFats.forEach((fat, i) => {
          console.log(`${i + 1}. Faturamento ID: ${fat.id}`)
          console.log(`   Deleted: ${fat.deleted_at ? 'SIM' : 'NÃO'}`)
          console.log(`   Obra: ${fat.obra?.name || fat.obra_id}`)
          console.log(`   Rua: ${fat.rua?.name || 'N/A'}`)
          console.log(`   Metragem: ${fat.metragem_executada} m²`)
          console.log(`   Preço/m²: R$ ${fat.preco_por_m2}`)
          console.log(`   Valor total: R$ ${fat.valor_total}`)
          console.log(`   Data: ${fat.data_finalizacao}`)
          console.log('')
        })
      }
    }
    
    console.log('✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificar()









