/**
 * Corrigir preços das ruas para R$ 25/m²
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

const PRECO_POR_M2 = 25.00

async function corrigir() {
  console.log(`🔧 CORRIGINDO PREÇOS PARA R$ ${PRECO_POR_M2}/m²\n`)
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // Buscar todas as ruas concluídas
    const { data: ruas, error } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .eq('status', 'concluida')
      .is('deleted_at', null)
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    console.log(`Ruas concluídas encontradas: ${ruas.length}\n`)
    
    for (const rua of ruas) {
      if (!rua.metragem_executada || rua.metragem_executada <= 0) {
        console.log(`Rua ${rua.name}: pulando (sem metragem executada)`)
        continue
      }
      
      const metragem = parseFloat(rua.metragem_executada)
      const toneladas = parseFloat(rua.toneladas_utilizadas) || 0
      const valorTotal = metragem * PRECO_POR_M2
      const espessura = toneladas > 0 && metragem > 0 
        ? ((toneladas / metragem) / 2.4) * 100 
        : rua.espessura_calculada || 0
      
      console.log(`Rua: ${rua.name}`)
      console.log(`  Metragem: ${metragem} m²`)
      console.log(`  Preço/m²: R$ ${PRECO_POR_M2}`)
      console.log(`  Valor total: R$ ${valorTotal.toFixed(2)}`)
      console.log(`  Espessura: ${espessura.toFixed(2)} cm`)
      
      // Atualizar rua
      const { error: updateError } = await supabase
        .from('obras_ruas')
        .update({
          preco_por_m2: PRECO_POR_M2,
          valor_total: valorTotal,
          espessura_calculada: espessura
        })
        .eq('id', rua.id)
      
      if (updateError) {
        console.error(`  ❌ Erro ao atualizar:`, updateError)
      } else {
        console.log(`  ✅ Atualizada`)
      }
      console.log('')
    }
    
    console.log('✅ Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

corrigir()









