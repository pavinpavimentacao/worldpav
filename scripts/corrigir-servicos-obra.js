/**
 * Corrigir serviços da obra com valores corretos
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

async function corrigir() {
  console.log('🔧 CORRIGINDO SERVIÇOS DA OBRA\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // Buscar metragem planejada total
    const { data: ruas } = await supabase
      .from('obras_ruas')
      .select('metragem_planejada')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
    
    const metragemTotal = ruas?.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0) || 0
    
    console.log(`Metragem planejada total: ${metragemTotal.toFixed(2)} m²\n`)
    
    // Buscar serviços
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    console.log(`Serviços encontrados: ${servicos?.length || 0}\n`)
    
    // O usuário quer que os preços venham dos serviços
    // Mas os valores atuais são R$ 8 e R$ 5 por m² (total R$ 13/m²)
    // Então vou corrigir os serviços para ter a quantidade correta
    
    for (const serv of servicos || []) {
      const precoUnitario = parseFloat(serv.preco_unitario) || 0
      const quantidade = parseFloat(serv.quantidade) || 1
      
      // Se quantidade = 1 mas deveria ser metragem total
      if (quantidade === 1 && metragemTotal > 1) {
        const novaQuantidade = metragemTotal
        const novoValorTotal = novaQuantidade * precoUnitario
        
        console.log(`Corrigindo serviço: ${serv.servico_nome}`)
        console.log(`  Quantidade antiga: ${quantidade}`)
        console.log(`  Quantidade nova: ${novaQuantidade.toFixed(2)}`)
        console.log(`  Preço unitário: R$ ${precoUnitario.toFixed(2)}`)
        console.log(`  Valor total antigo: R$ ${serv.valor_total}`)
        console.log(`  Valor total novo: R$ ${novoValorTotal.toFixed(2)}`)
        
        const { error } = await supabase
          .from('obras_servicos')
          .update({
            quantidade: novaQuantidade,
            valor_total: novoValorTotal
          })
          .eq('id', serv.id)
        
        if (error) {
          console.error(`  ❌ Erro:`, error)
        } else {
          console.log(`  ✅ Atualizado`)
        }
        console.log('')
      }
    }
    
    // Recalcular preço por m²
    const { data: servicosAtualizados } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    const valorTotalServicos = servicosAtualizados?.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0) || 0
    const precoPorM2 = metragemTotal > 0 ? valorTotalServicos / metragemTotal : 0
    
    console.log('\n' + '='.repeat(60))
    console.log('RESUMO ATUALIZADO:')
    console.log(`  Total de serviços: ${servicosAtualizados?.length || 0}`)
    console.log(`  Valor total dos serviços: R$ ${valorTotalServicos.toFixed(2)}`)
    console.log(`  Metragem planejada: ${metragemTotal.toFixed(2)} m²`)
    console.log(`  Preço por m²: R$ ${precoPorM2.toFixed(2)}`)
    
    console.log('\n✅ Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

corrigir()







