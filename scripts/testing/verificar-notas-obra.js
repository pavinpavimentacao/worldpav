/**
 * Script para verificar se as notas fiscais de uma obra aparecem nos recebimentos
 */

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Verificando notas fiscais da obra...\n')

async function verificarNotas() {
  try {
    // 1. Buscar todas as obras
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('id, name')
      .limit(10)
    
    if (obrasError) {
      console.error('❌ Erro ao buscar obras:', obrasError)
      return
    }
    
    console.log(`✅ ${obras?.length || 0} obras encontradas\n`)
    
    // 2. Para cada obra, verificar notas fiscais
    for (const obra of obras || []) {
      console.log(`\n📋 Obra: ${obra.name} (ID: ${obra.id})`)
      console.log('─'.repeat(60))
      
      // Buscar notas fiscais da obra
      const { data: notas, error: notasError } = await supabase
        .from('obras_notas_fiscais')
        .select('*')
        .eq('obra_id', obra.id)
        .order('vencimento', { ascending: false })
      
      if (notasError) {
        console.error('  ❌ Erro ao buscar notas:', notasError.message)
        continue
      }
      
      if (!notas || notas.length === 0) {
        console.log('  ⚠️  Nenhuma nota fiscal encontrada')
        continue
      }
      
      console.log(`  ✅ ${notas.length} nota(s) fiscal(is) encontrada(s):\n`)
      
      notas.forEach((nota, index) => {
        console.log(`  ${index + 1}. Nota ${nota.numero_nota || 'N/A'}`)
        console.log(`     Status: ${nota.status}`)
        console.log(`     Valor: R$ ${nota.valor_liquido?.toFixed(2) || '0.00'}`)
        console.log(`     Vencimento: ${nota.vencimento || 'N/A'}`)
        console.log(`     Data Pagamento: ${nota.data_pagamento || 'N/A'}`)
        console.log()
      })
    }
    
    // 3. Verificar total de notas fiscais no sistema
    console.log('\n📊 RESUMO GERAL')
    console.log('─'.repeat(60))
    
    const { data: todasNotas, error: totalError } = await supabase
      .from('obras_notas_fiscais')
      .select('id, obra_id, status')
    
    if (totalError) {
      console.error('❌ Erro ao contar notas:', totalError)
      return
    }
    
    console.log(`Total de notas fiscais no sistema: ${todasNotas?.length || 0}`)
    console.log(`  - Emitidas: ${todasNotas?.filter(n => n.status === 'emitida').length || 0}`)
    console.log(`  - Pagas: ${todasNotas?.filter(n => n.status === 'pago').length || 0}`)
    console.log(`  - Pendentes: ${todasNotas?.filter(n => n.status === 'pendente').length || 0}`)
    console.log(`  - Vencidas: ${todasNotas?.filter(n => n.status === 'vencido').length || 0}`)
    
    // 4. Verificar se todas as notas aparecem em getAllNotasFiscais
    console.log('\n🔍 Testando getAllNotasFiscais()...')
    console.log('─'.repeat(60))
    
    // Simular o que a página faz
    const { data: notasTodas, error: notasTodasError } = await supabase
      .from('obras_notas_fiscais')
      .select('*')
      .order('vencimento', { ascending: false })
    
    if (notasTodasError) {
      console.error('❌ Erro ao buscar todas as notas:', notasTodasError)
      return
    }
    
    console.log(`✅ getAllNotasFiscais() retornou: ${notasTodas?.length || 0} notas`)
    
    if (todasNotas?.length === notasTodas?.length) {
      console.log('✅ SUCESSO: Todas as notas aparecem na lista de recebimentos!')
    } else {
      console.log('⚠️  ATENÇÃO: Número de notas diferente!')
      console.log(`   Esperado: ${todasNotas?.length}`)
      console.log(`   Retornado: ${notasTodas?.length}`)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar verificação
verificarNotas()

