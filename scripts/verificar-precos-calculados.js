/**
 * Verificar preços calculados e ruas restauradas
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
  console.log('🔍 VERIFICANDO PREÇOS E RUAS RESTAURADAS\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // Buscar serviços da obra
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    console.log('Serviços da obra:')
    servicos?.forEach(s => {
      console.log(`  - ${s.descricao || s.name}`)
      console.log(`    Valor total: R$ ${parseFloat(s.valor_total).toFixed(2)}`)
      console.log(`    Unidade: ${s.unidade}`)
      console.log('')
    })
    
    const valorTotal = servicos?.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0) || 0
    console.log(`Valor total dos serviços: R$ ${valorTotal.toFixed(2)}\n`)
    
    // Buscar metragem planejada
    const { data: ruas } = await supabase
      .from('obras_ruas')
      .select('metragem_planejada')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
    
    const metragemTotal = ruas?.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0) || 0
    console.log(`Metragem planejada total: ${metragemTotal.toFixed(2)} m²\n`)
    
    const precoPorM2 = metragemTotal > 0 ? valorTotal / metragemTotal : 0
    console.log(`Preço/m² calculado: R$ ${precoPorM2.toFixed(2)}\n`)
    
    // Buscar ruas ativas
    console.log('Ruas ativas:')
    const { data: ruasAtivas } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    ruasAtivas?.forEach(rua => {
      console.log(`\nRua: ${rua.name}`)
      console.log(`  Status: ${rua.status}`)
      console.log(`  Metragem executada: ${rua.metragem_executada || 'N/A'}`)
      console.log(`  Preço/m² atual: ${rua.preco_por_m2 || 'N/A'}`)
      console.log(`  Valor total atual: ${rua.valor_total || 'N/A'}`)
      
      if (rua.status === 'concluida' && rua.metragem_executada) {
        const valorCorreto = rua.metragem_executada * precoPorM2
        console.log(`  Valor correto: R$ ${valorCorreto.toFixed(2)}`)
        
        if (Math.abs((rua.valor_total || 0) - valorCorreto) > 0.01) {
          console.log(`  ⚠️ Valor precisa ser corrigido!`)
        }
      }
    })
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificar()



