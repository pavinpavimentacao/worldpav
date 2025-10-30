/**
 * Script para verificar TODAS as notas fiscais reais no banco
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarTodasNotas() {
  console.log('🔍 VERIFICANDO TODAS AS NOTAS FISCAIS REAIS\n')
  console.log('═'.repeat(70))
  
  try {
    // Buscar TODAS as notas fiscais
    const { data: todasNotas, error } = await supabase
      .from('obras_notas_fiscais')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    console.log(`\n📊 TOTAL: ${todasNotas?.length || 0} notas fiscais encontradas\n`)
    console.log('═'.repeat(70))
    
    if (!todasNotas || todasNotas.length === 0) {
      console.log('⚠️  Nenhuma nota fiscal encontrada no banco de dados')
      console.log('\n💡 Para adicionar notas fiscais, use a aba Financeiro de uma obra')
      return
    }
    
    // Exibir detalhes de cada nota
    todasNotas.forEach((nota, index) => {
      console.log(`\n${index + 1}. NOTA FISCAL`)
      console.log('─'.repeat(70))
      console.log(`   ID: ${nota.id}`)
      console.log(`   Obra ID: ${nota.obra_id}`)
      console.log(`   Número: ${nota.numero_nota || 'N/A'}`)
      console.log(`   Status: ${nota.status}`)
      console.log(`   Valor Bruto: R$ ${nota.valor_nota?.toFixed(2) || '0.00'}`)
      console.log(`   Valor Líquido: R$ ${nota.valor_liquido?.toFixed(2) || '0.00'}`)
      console.log(`   Vencimento: ${nota.vencimento || 'N/A'}`)
      console.log(`   Data Pagamento: ${nota.data_pagamento || 'N/A'}`)
      console.log(`   Desconto INSS: R$ ${nota.desconto_inss?.toFixed(2) || '0.00'}`)
      console.log(`   Desconto ISS: R$ ${nota.desconto_iss?.toFixed(2) || '0.00'}`)
      console.log(`   Outro Desconto: R$ ${nota.outro_desconto?.toFixed(2) || '0.00'}`)
      if (nota.observacoes) {
        console.log(`   Observações: ${nota.observacoes}`)
      }
      console.log(`   Arquivo: ${nota.arquivo_nota_url || 'N/A'}`)
      console.log(`   Criada em: ${nota.created_at}`)
      console.log(`   Atualizada em: ${nota.updated_at || nota.created_at}`)
    })
    
    // Buscar nomes das obras
    console.log('\n\n🔗 BUSCANDO NOMES DAS OBRAS')
    console.log('═'.repeat(70))
    
    for (const nota of todasNotas) {
      const { data: obra } = await supabase
        .from('obras')
        .select('id, name')
        .eq('id', nota.obra_id)
        .single()
      
      console.log(`\nNota ${nota.numero_nota || nota.id}:`)
      console.log(`  Obra: ${obra?.name || 'N/A'} (${nota.obra_id})`)
    }
    
    // Verificar se aparecem em getAllNotasFiscais
    console.log('\n\n✅ VERIFICAÇÃO FINAL')
    console.log('═'.repeat(70))
    
    const { data: notasGetAll, error: getAllError } = await supabase
      .from('obras_notas_fiscais')
      .select('*')
      .order('vencimento', { ascending: false })
    
    if (getAllError) {
      console.error('❌ Erro ao buscar notas:', getAllError)
      return
    }
    
    console.log(`\nTodas as notas no banco: ${todasNotas?.length || 0}`)
    console.log(`Notas retornadas por getAllNotasFiscais(): ${notasGetAll?.length || 0}`)
    
    if (todasNotas?.length === notasGetAll?.length) {
      console.log('\n✅ SUCESSO: Todas as notas aparecem em /recebimentos!')
    } else {
      console.log('\n⚠️  ATENÇÃO: Algumas notas podem não estar aparecendo')
    }
    
    console.log('\n💡 Para ver as notas fiscais:')
    console.log('   1. Acesse /recebimentos no sistema')
    console.log('   2. Você verá todas as notas listadas')
    console.log('   3. Clique em "👁️ Ver Detalhes" para mais informações')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verificarTodasNotas()


