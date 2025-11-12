/**
 * Script para restaurar ruas concluídas e criar faturamentos corretos
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

async function restaurar() {
  console.log('🔧 RESTAURANDO RUAS E CRIANDO FATURAMENTOS\n')
  
  const obraId = '21cda776-c1a1-4292-bc20-735cb6f0bd4d'
  
  try {
    // 1. Buscar ruas deletadas com status concluida
    console.log('📊 Buscando ruas deletadas com status concluida...')
    const { data: ruasDeletadas, error: ruasError } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .eq('status', 'concluida')
      .not('deleted_at', 'is', null)
      .not('metragem_executada', 'is', null)
      .gt('metragem_executada', 0)

    if (ruasError) {
      console.error('❌ Erro:', ruasError)
      return
    }

    console.log(`Ruas deletadas encontradas: ${ruasDeletadas.length}\n`)
    
    if (ruasDeletadas.length === 0) {
      console.log('✅ Nenhuma rua para restaurar')
      return
    }
    
    // 2. Buscar serviços da obra para calcular preço/m²
    const { data: servicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
    
    const valorTotalServicos = servicos?.reduce((sum, s) => sum + (parseFloat(s.valor_total) || 0), 0) || 0
    
    const { data: todasRuas } = await supabase
      .from('obras_ruas')
      .select('metragem_planejada')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
    
    const metragemTotal = todasRuas?.reduce((sum, r) => sum + (parseFloat(r.metragem_planejada) || 0), 0) || 0
    const precoPorM2 = metragemTotal > 0 ? valorTotalServicos / metragemTotal : 0
    
    console.log(`Preço/m² calculado: R$ ${precoPorM2.toFixed(2)}\n`)
    
    // 3. Restaurar ruas e criar faturamentos
    for (const rua of ruasDeletadas) {
      console.log(`\nProcessando rua: ${rua.name}`)
      
      // Calcular valores
      const metragem = parseFloat(rua.metragem_executada)
      const toneladas = parseFloat(rua.toneladas_utilizadas) || 0
      const preco_m2 = rua.preco_por_m2 || precoPorM2
      const valorTotal = metragem * preco_m2
      
      // Calcular espessura
      const espessura = toneladas > 0 && metragem > 0 
        ? ((toneladas / metragem) / 2.4) * 100 
        : rua.espessura_calculada || 0
      
      console.log(`  Metragem: ${metragem} m²`)
      console.log(`  Toneladas: ${toneladas}`)
      console.log(`  Preço/m²: R$ ${preco_m2.toFixed(2)}`)
      console.log(`  Valor total: R$ ${valorTotal.toFixed(2)}`)
      console.log(`  Espessura: ${espessura.toFixed(2)} cm`)
      
      // Restaurar rua
      const { error: restoreError } = await supabase
        .from('obras_ruas')
        .update({
          deleted_at: null,
          status: 'concluida',
          preco_por_m2: preco_m2,
          valor_total: valorTotal,
          espessura_calculada: espessura
        })
        .eq('id', rua.id)
      
      if (restoreError) {
        console.error(`  ❌ Erro ao restaurar rua:`, restoreError)
        continue
      }
      
      console.log(`  ✅ Rua restaurada`)
      
      // Verificar se faturamento já existe
      const { data: fatExistente } = await supabase
        .from('obras_financeiro_faturamentos')
        .select('id')
        .eq('rua_id', rua.id)
        .is('deleted_at', null)
      
      if (!fatExistente || fatExistente.length === 0) {
        // Criar faturamento
        const { error: fatError } = await supabase
          .from('obras_financeiro_faturamentos')
          .insert({
            obra_id: obraId,
            rua_id: rua.id,
            metragem_executada: metragem,
            toneladas_utilizadas: toneladas,
            espessura_calculada: espessura,
            preco_por_m2: preco_m2,
            valor_total: valorTotal,
            data_finalizacao: rua.data_finalizacao || rua.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: 'pendente'
          })
        
        if (fatError) {
          console.error(`  ❌ Erro ao criar faturamento:`, fatError)
        } else {
          console.log(`  ✅ Faturamento criado: R$ ${valorTotal.toFixed(2)}`)
        }
      } else {
        console.log(`  ℹ️ Faturamento já existe`)
      }
    }
    
    console.log('\n✅ Processo concluído!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

restaurar()







