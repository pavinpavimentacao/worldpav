/**
 * Atualizar ruas finalizadas com o preço correto dos serviços
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

async function atualizar() {
  console.log('🔧 ATUALIZANDO RUAS COM PREÇO DOS SERVIÇOS\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // 1. Calcular preço por m² dos serviços
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    const valorTotalServicos = servicos?.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0) || 0
    
    const { data: ruas } = await supabase
      .from('obras_ruas')
      .select('metragem_planejada')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
    
    const metragemTotal = ruas?.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0) || 0
    const precoPorM2 = metragemTotal > 0 ? valorTotalServicos / metragemTotal : 0
    
    console.log(`Valor total dos serviços: R$ ${valorTotalServicos.toFixed(2)}`)
    console.log(`Metragem planejada: ${metragemTotal.toFixed(2)} m²`)
    console.log(`Preço por m²: R$ ${precoPorM2.toFixed(2)}\n`)
    
    // 2. Buscar ruas finalizadas
    const { data: ruasFinalizadas } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .eq('status', 'concluida')
      .is('deleted_at', null)
    
    console.log(`Ruas finalizadas encontradas: ${ruasFinalizadas?.length || 0}\n`)
    
    if (ruasFinalizadas && ruasFinalizadas.length > 0) {
      for (const rua of ruasFinalizadas) {
        if (!rua.metragem_executada || rua.metragem_executada <= 0) continue
        
        const metragem = parseFloat(rua.metragem_executada)
        const toneladas = parseFloat(rua.toneladas_utilizadas) || 0
        const valorTotal = metragem * precoPorM2
        const espessura = toneladas > 0 && metragem > 0 
          ? ((toneladas / metragem) / 2.4) * 100 
          : rua.espessura_calculada || 0
        
        console.log(`Rua: ${rua.name}`)
        console.log(`  Metragem: ${metragem} m²`)
        console.log(`  Valor total: R$ ${valorTotal.toFixed(2)}`)
        console.log(`  Preço/m²: R$ ${precoPorM2.toFixed(2)}`)
        
        const { error } = await supabase
          .from('obras_ruas')
          .update({
            preco_por_m2: precoPorM2,
            valor_total: valorTotal,
            espessura_calculada: espessura
          })
          .eq('id', rua.id)
        
        if (error) {
          console.error(`  ❌ Erro:`, error)
        } else {
          console.log(`  ✅ Atualizada`)
        }
        console.log('')
      }
    }
    
    console.log('✅ Atualização concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

atualizar()









