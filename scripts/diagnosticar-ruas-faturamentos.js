/**
 * Script para diagnosticar problemas com ruas e faturamentos
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE RUAS E FATURAMENTOS\n')
  
  try {
    // 1. Buscar a obra específica (21cda776-c1a1-4292-bc20-735cb6f0bd4d)
    const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
    
    console.log('📊 Obra ID:', obraId)
    console.log('=' .repeat(50) + '\n')
    
    // 2. Buscar ruas da obra
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
    
    // Analisar status das ruas
    const statusCount = {
      planejada: 0,
      em_execucao: 0,
      concluida: 0
    }
    
    ruas.forEach(rua => {
      statusCount[rua.status] = (statusCount[rua.status] || 0) + 1
    })
    
    console.log('Status das ruas:')
    console.log(`  - Planejadas: ${statusCount.planejada}`)
    console.log(`  - Em execução: ${statusCount.em_execucao}`)
    console.log(`  - Concluídas: ${statusCount.concluida}\n`)
    
    // Detalhar cada rua
    console.log('Detalhes das ruas:')
    console.log('-'.repeat(70))
    ruas.forEach((rua, index) => {
      console.log(`\nRua ${index + 1}: ${rua.name}`)
      console.log(`  Status: ${rua.status}`)
      console.log(`  Metragem planejada: ${rua.metragem_planejada || 'N/A'} m²`)
      console.log(`  Metragem executada: ${rua.metragem_executada || 'N/A'} m²`)
      console.log(`  Toneladas: ${rua.toneladas_utilizadas || 'N/A'}`)
      console.log(`  Espessura: ${rua.espessura_calculada || 'N/A'} cm`)
      console.log(`  Preço/m²: ${rua.preco_por_m2 || 'N/A'}`)
      console.log(`  Valor total: ${rua.valor_total || 'N/A'}`)
      console.log(`  Data finalização: ${rua.data_finalizacao || 'N/A'}`)
      
      // Verificar inconsistências
      if (rua.metragem_executada && rua.metragem_executada > 0 && rua.status !== 'concluida') {
        console.log(`  ⚠️ PROBLEMA: Tem metragem executada mas status não é 'concluida'`)
      }
    })
    
    console.log('\n' + '='.repeat(70))
    console.log('📊 FATURAMENTOS\n')
    
    // 3. Buscar faturamentos
    const { data: faturamentos, error: fatError } = await supabase
      .from('obras_financeiro_faturamentos')
      .select(`
        *,
        rua:obras_ruas(*)
      `)
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (fatError) {
      console.error('❌ Erro ao buscar faturamentos:', fatError)
    } else {
      console.log(`Total de faturamentos: ${faturamentos.length}\n`)
      
      if (faturamentos.length > 0) {
        console.log('Detalhes dos faturamentos:')
        console.log('-'.repeat(70))
        
        faturamentos.forEach((fat, index) => {
          console.log(`\nFaturamento ${index + 1}:`)
          console.log(`  Rua: ${fat.rua?.name || 'N/A'}`)
          console.log(`  Data finalização: ${fat.data_finalizacao}`)
          console.log(`  Metragem: ${fat.metragem_executada} m²`)
          console.log(`  Toneladas: ${fat.toneladas_utilizadas}`)
          console.log(`  Espessura: ${fat.espessura_calculada} cm`)
          console.log(`  Preço/m²: R$ ${fat.preco_por_m2}`)
          console.log(`  Valor total: R$ ${fat.valor_total}`)
          
          // Verificar cálculo
          const valorEsperado = fat.metragem_executada * fat.preco_por_m2
          if (Math.abs(fat.valor_total - valorEsperado) > 0.01) {
            console.log(`  ⚠️ PROBLEMA: Valor incorreto!`)
            console.log(`     Esperado: R$ ${valorEsperado.toFixed(2)}`)
            console.log(`     Atual: R$ ${fat.valor_total.toFixed(2)}`)
          }
        })
      }
    }
    
    // 4. Buscar serviços da obra para calcular preço/m² correto
    console.log('\n' + '='.repeat(70))
    console.log('💰 CÁLCULO DO PREÇO/M²\n')
    
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    if (servicos && servicos.length > 0) {
      const valorTotalServicos = servicos.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0)
      const metragemTotal = ruas.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0)
      
      console.log(`Total de serviços: ${servicos.length}`)
      console.log(`Valor total dos serviços: R$ ${valorTotalServicos.toFixed(2)}`)
      console.log(`Metragem planejada total: ${metragemTotal.toFixed(2)} m²`)
      
      if (metragemTotal > 0) {
        const precoPorM2 = valorTotalServicos / metragemTotal
        console.log(`\nPreço/m² correto: R$ ${precoPorM2.toFixed(2)}`)
      }
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('✅ Diagnóstico concluído!')
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error)
  }
}

diagnosticar()









