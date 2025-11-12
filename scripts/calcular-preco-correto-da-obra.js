/**
 * Calcular o preço correto por m² baseado nos serviços da obra
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

async function calcular() {
  console.log('📊 CALCULANDO PREÇO CORRETO DA OBRA\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // 1. Buscar serviços da obra
    console.log('Buscando serviços da obra...')
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    if (servicos) {
      console.log(`\nTotal de serviços: ${servicos.length}`)
      console.log('\nDetalhes dos serviços:')
      console.log('-'.repeat(60))
      
      let valorTotalServicos = 0
      servicos.forEach((serv, i) => {
        const valorTotal = parseFloat(serv.valor_total) || 0
        valorTotalServicos += valorTotal
        
        console.log(`\n${i + 1}. ${serv.descricao || serv.name || 'Serviço'}`)
        console.log(`   Unidade: ${serv.unidade}`)
        console.log(`   Quantidade: ${serv.quantidade}`)
        console.log(`   Preço unitário: R$ ${parseFloat(serv.preco_unitario || 0).toFixed(2)}`)
        console.log(`   Valor total: R$ ${valorTotal.toFixed(2)}`)
      })
      
      console.log(`\n💰 Valor total dos serviços: R$ ${valorTotalServicos.toFixed(2)}`)
    }
    
    // 2. Buscar metragem planejada total da obra
    const { data: ruas } = await supabase
      .from('obras_ruas')
      .select('metragem_planejada')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
    
    const metragemTotal = ruas?.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0) || 0
    
    console.log(`\n📏 Metragem planejada total: ${metragemTotal.toFixed(2)} m²`)
    
    // 3. Calcular preço por m²
    const { data: servicosData } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    const valorTotalServicos = servicosData?.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0) || 0
    const precoPorM2 = metragemTotal > 0 ? valorTotalServicos / metragemTotal : 0
    
    console.log(`\n💲 Preço/m² calculado: R$ ${precoPorM2.toFixed(2)}`)
    
    console.log('\n' + '='.repeat(60))
    console.log('RESUMO DO CÁLCULO:')
    console.log(`  Valor total dos serviços: R$ ${valorTotalServicos.toFixed(2)}`)
    console.log(`  Metragem planejada total: ${metragemTotal.toFixed(2)} m²`)
    console.log(`  Preço por m²: R$ ${precoPorM2.toFixed(2)}`)
    
    console.log('\n✅ Cálculo concluído!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

calcular()







