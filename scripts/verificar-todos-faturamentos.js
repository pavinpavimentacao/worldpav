/**
 * Script para verificar TODOS os faturamentos de todas as obras
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
  console.log('🔍 VERIFICAÇÃO COMPLETA DE FATURAMENTOS\n')
  
  try {
    // Buscar TODOS os faturamentos
    const { data: faturamentos, error } = await supabase
      .from('obras_financeiro_faturamentos')
      .select(`
        *,
        rua:obras_ruas(*),
        obra:obras(id, name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    console.log(`Total de faturamentos: ${faturamentos.length}\n`)
    
    if (faturamentos.length > 0) {
      console.log('Detalhes dos faturamentos:')
      console.log('='.repeat(80))
      
      faturamentos.forEach((fat, i) => {
        console.log(`\n${i + 1}. Faturamento ID: ${fat.id}`)
        console.log(`   Obra: ${fat.obra?.name || fat.obra_id}`)
        console.log(`   Rua: ${fat.rua?.name || 'N/A'}`)
        console.log(`   Metragem: ${fat.metragem_executada} m²`)
        console.log(`   Preço/m²: R$ ${fat.preco_por_m2}`)
        console.log(`   Valor total: R$ ${fat.valor_total}`)
        console.log(`   Data: ${fat.data_finalizacao}`)
        console.log(`   Status da rua: ${fat.rua?.status || 'N/A'}`)
        
        // Verificar se valor está correto
        const esperado = fat.metragem_executada * fat.preco_por_m2
        if (Math.abs(fat.valor_total - esperado) > 0.01) {
          console.log(`   ⚠️ VALOR INCORRETO! Esperado: R$ ${esperado.toFixed(2)}`)
        }
        
        // Verificar se rua está concluída
        if (fat.rua && fat.rua.status !== 'concluida') {
          console.log(`   ⚠️ RUA NÃO ESTÁ CONCLUÍDA! Status: ${fat.rua.status}`)
        }
      })
      
      // Agrupar por obra
      console.log('\n' + '='.repeat(80))
      console.log('RESUMO POR OBRA:\n')
      
      const porObra = {}
      faturamentos.forEach(fat => {
        const obraNome = fat.obra?.name || fat.obra_id
        if (!porObra[obraNome]) {
          porObra[obraNome] = []
        }
        porObra[obraNome].push(fat)
      })
      
      Object.keys(porObra).forEach(obraNome => {
        console.log(`Obra: ${obraNome}`)
        console.log(`  Total de faturamentos: ${porObra[obraNome].length}`)
        const total = porObra[obraNome].reduce((sum, f) => sum + f.valor_total, 0)
        console.log(`  Valor total: R$ ${total.toFixed(2)}\n`)
      })
    }
    
    console.log('✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

verificar()

