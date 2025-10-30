/**
 * Script para verificar e corrigir:
 * 1. Ruas com metragem_executada mas status diferente de 'concluida'
 * 2. Faturamentos com preços incorretos
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarECorrigirRuasFaturamentos() {
  console.log('🔍 Iniciando verificação de ruas e faturamentos...\n')

  try {
    // 1. Buscar todas as ruas
    console.log('📊 Buscando todas as ruas...')
    const { data: ruas, error: ruasError } = await supabase
      .from('obras_ruas')
      .select('*')
      .is('deleted_at', null)

    if (ruasError) {
      console.error('❌ Erro ao buscar ruas:', ruasError)
      return
    }

    console.log(`✅ Total de ruas encontradas: ${ruas.length}\n`)

    // 2. Identificar ruas com metragem executada mas status incorreto
    const ruasParaCorrigir = ruas.filter(rua => 
      rua.metragem_executada && rua.metragem_executada > 0 && rua.status !== 'concluida'
    )

    console.log(`⚠️ Ruas com metragem executada mas status não 'concluida': ${ruasParaCorrigir.length}`)
    
    if (ruasParaCorrigir.length > 0) {
      console.log('\nRuas que precisam ser corrigidas:')
      ruasParaCorrigir.forEach(rua => {
        console.log(`  - Rua: ${rua.name} (ID: ${rua.id})`)
        console.log(`    Status atual: ${rua.status}`)
        console.log(`    Metragem executada: ${rua.metragem_executada} m²`)
        console.log(`    Data finalização: ${rua.data_finalizacao || 'N/A'}`)
      })

      // Corrigir status
      console.log('\n🔄 Corrigindo status das ruas...')
      for (const rua of ruasParaCorrigir) {
        const { error } = await supabase
          .from('obras_ruas')
          .update({ status: 'concluida' })
          .eq('id', rua.id)

        if (error) {
          console.error(`❌ Erro ao corrigir rua ${rua.name}:`, error)
        } else {
          console.log(`✅ Rua ${rua.name} atualizada para status 'concluida'`)
        }
      }
    }

    // 3. Buscar faturamentos
    console.log('\n💰 Buscando faturamentos...')
    const { data: faturamentos, error: fatError } = await supabase
      .from('obras_financeiro_faturamentos')
      .select('*, rua:obras_ruas(*)')
      .is('deleted_at', null)

    if (fatError) {
      console.error('❌ Erro ao buscar faturamentos:', fatError)
      return
    }

    console.log(`✅ Total de faturamentos encontrados: ${faturamentos.length}\n`)

    // 4. Verificar e corrigir preços dos faturamentos
    if (faturamentos.length > 0) {
      console.log('🔍 Verificando cálculos de preços...')
      
      const faturamentosParaCorrigir = []

      for (const fat of faturamentos) {
        // Buscar preço/m² da obra
        const { data: obra } = await supabase
          .from('obras')
          .select('id')
          .eq('id', fat.obra_id)
          .single()

        if (obra) {
          // Buscar serviços da obra para calcular preço/m²
          const { data: servicos } = await supabase
            .from('obras_servicos')
            .select('*')
            .eq('obra_id', fat.obra_id)

          if (servicos && servicos.length > 0) {
            // Calcular preço/m² baseado nos serviços
            const valorTotalServicos = servicos.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0)
            
            // Buscar metragem planejada total da obra
            const { data: ruasObra } = await supabase
              .from('obras_ruas')
              .select('metragem_planejada')
              .eq('obra_id', fat.obra_id)
              .is('deleted_at', null)

            const metragemPlanejadaTotal = ruasObra?.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0) || 0
            
            const precoPorM2Calculado = metragemPlanejadaTotal > 0 ? valorTotalServicos / metragemPlanejadaTotal : 0

            // Verificar se o valor total está correto
            const valorEsperado = fat.metragem_executada * precoPorM2Calculado
            
            if (Math.abs(fat.valor_total - valorEsperado) > 0.01) {
              faturamentosParaCorrigir.push({
                fat,
                valorEsperado,
                valorAtual: fat.valor_total,
                precoPorM2: precoPorM2Calculado
              })
            }
          }
        }
      }

      console.log(`⚠️ Faturamentos com preços incorretos: ${faturamentosParaCorrigir.length}`)

      if (faturamentosParaCorrigir.length > 0) {
        console.log('\nFaturamentos que precisam ser corrigidos:')
        faturamentosParaCorrigir.forEach(({ fat, valorEsperado, valorAtual, precoPorM2 }) => {
          console.log(`  - Rua: ${fat.rua?.name || fat.rua_id}`)
          console.log(`    Valor atual: R$ ${valorAtual.toFixed(2)}`)
          console.log(`    Valor esperado: R$ ${valorEsperado.toFixed(2)}`)
          console.log(`    Preço/m²: R$ ${precoPorM2.toFixed(2)}`)
          console.log(`    Metragem: ${fat.metragem_executada} m²`)
        })

        // Corrigir valores
        console.log('\n🔄 Corrigindo valores dos faturamentos...')
        for (const { fat, valorEsperado, precoPorM2 } of faturamentosParaCorrigir) {
          const { error } = await supabase
            .from('obras_financeiro_faturamentos')
            .update({ 
              valor_total: valorEsperado,
              preco_por_m2: precoPorM2
            })
            .eq('id', fat.id)

          if (error) {
            console.error(`❌ Erro ao corrigir faturamento ${fat.id}:`, error)
          } else {
            console.log(`✅ Faturamento corrigido: R$ ${valorEsperado.toFixed(2)}`)
          }
        }
      }
    }

    console.log('\n✅ Verificação e correção concluídas!')
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  }
}

// Executar o script
verificarECorrigirRuasFaturamentos()



