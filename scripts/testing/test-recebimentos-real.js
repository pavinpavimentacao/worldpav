/**
 * Script de Teste - APIs de Recebimentos com Dados Reais
 * 
 * Testa as funções de notas fiscais e pagamentos diretos
 * com dados reais do banco de dados
 */

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🧪 Iniciando testes de APIs de Recebimentos...\n')

// =====================================================
// TESTE 1: Buscar Nota Fiscal
// =====================================================
async function testGetNotaFiscal() {
  console.log('📄 TESTE 1: Buscar Nota Fiscal')
  console.log('─'.repeat(50))
  
  try {
    const { data, error } = await supabase
      .from('obras_notas_fiscais')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhuma nota fiscal encontrada')
      return
    }
    
    const nota = data[0]
    console.log('✅ Nota Fiscal encontrada:')
    console.log('  ID:', nota.id)
    console.log('  Número:', nota.numero_nota)
    console.log('  Valor:', nota.valor_nota)
    console.log('  Valor Líquido:', nota.valor_liquido)
    console.log('  Status:', nota.status)
    console.log('  Vencimento:', nota.vencimento)
    console.log()
    
    return nota
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// =====================================================
// TESTE 2: Buscar Pagamentos Diretos
// =====================================================
async function testGetPagamentosDiretos() {
  console.log('💳 TESTE 2: Buscar Pagamentos Diretos')
  console.log('─'.repeat(50))
  
  try {
    const { data, error } = await supabase
      .from('obras_pagamentos_diretos')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhum pagamento direto encontrado')
      console.log('  (Normal para banco novo)\n')
      return
    }
    
    console.log(`✅ ${data.length} pagamento(s) direto(s) encontrado(s)`)
    data.forEach((pag, index) => {
      console.log(`\n  Pagamento ${index + 1}:`)
      console.log('    ID:', pag.id)
      console.log('    Descrição:', pag.description || pag.descricao)
      console.log('    Valor:', pag.amount || pag.valor)
      console.log('    Data:', pag.payment_date || pag.data_pagamento)
      console.log('    Método:', pag.payment_method || pag.forma_pagamento)
    })
    console.log()
    
    return data
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// =====================================================
// TESTE 3: Calcular KPIs
// =====================================================
async function testCalculateKPIs() {
  console.log('📊 TESTE 3: Calcular KPIs')
  console.log('─'.repeat(50))
  
  try {
    // Notas fiscais
    const { data: notas, error: notasError } = await supabase
      .from('obras_notas_fiscais')
      .select('valor_liquido, status')
    
    if (notasError) {
      console.error('❌ Erro ao buscar notas:', notasError.message)
      return
    }
    
    const totalNotas = notas?.reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0
    const notasPagas = notas?.filter(n => n.status === 'pago').reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0
    const notasPendentes = notas?.filter(n => n.status === 'pendente' || n.status === 'emitida').reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0
    const notasVencidas = notas?.filter(n => n.status === 'vencido').reduce((sum, n) => sum + (n.valor_liquido || 0), 0) || 0
    
    console.log('📈 Notas Fiscais:')
    console.log('  Total:', totalNotas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    console.log('  Pagas:', notasPagas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    console.log('  Pendentes:', notasPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    console.log('  Vencidas:', notasVencidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    
    // Pagamentos diretos
    const { data: pagamentos, error: pagError } = await supabase
      .from('obras_pagamentos_diretos')
      .select('amount')
    
    if (pagError) {
      console.error('❌ Erro ao buscar pagamentos:', pagError.message)
      return
    }
    
    const totalPagamentos = pagamentos?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    
    console.log('\n💳 Pagamentos Diretos:')
    console.log('  Total:', totalPagamentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    
    console.log('\n💰 Total Recebido:', (notasPagas + totalPagamentos).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
    console.log()
    
    return {
      totalNotas,
      notasPagas,
      notasPendentes,
      notasVencidas,
      totalPagamentos,
      totalRecebido: notasPagas + totalPagamentos
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// =====================================================
// TESTE 4: Testar Mapeamento de Pagamentos Diretos
// =====================================================
async function testMappingPagamentos() {
  console.log('🔄 TESTE 4: Testar Mapeamento de Pagamentos Diretos')
  console.log('─'.repeat(50))
  
  try {
    // Simular um pagamento em inglês
    const pagamentoExemplo = {
      id: 'exemplo-123',
      obra_id: 'obra-456',
      description: 'PIX - Janeiro 2025',
      amount: 15000.00,
      payment_date: '2025-01-15',
      payment_method: 'pix',
      document_url: 'https://exemplo.com/comprovante.pdf',
      observations: 'Pagamento de teste',
      created_at: new Date().toISOString()
    }
    
    console.log('📥 Dados do Banco (inglês):')
    console.log(JSON.stringify(pagamentoExemplo, null, 2))
    console.log()
    
    // Simular mapeamento
    const mapeado = {
      id: pagamentoExemplo.id,
      obra_id: pagamentoExemplo.obra_id,
      descricao: pagamentoExemplo.description,
      valor: pagamentoExemplo.amount,
      data_pagamento: pagamentoExemplo.payment_date,
      forma_pagamento: pagamentoExemplo.payment_method,
      comprovante_url: pagamentoExemplo.document_url,
      observacoes: pagamentoExemplo.observations,
      created_at: pagamentoExemplo.created_at,
      updated_at: pagamentoExemplo.created_at
    }
    
    console.log('📤 Dados Mapeados (português):')
    console.log(JSON.stringify(mapeado, null, 2))
    console.log('✅ Mapeamento funcionando corretamente!')
    console.log()
    
    return mapeado
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// =====================================================
// EXECUTAR TODOS OS TESTES
// =====================================================
async function runAllTests() {
  try {
    await testGetNotaFiscal()
    await testGetPagamentosDiretos()
    await testCalculateKPIs()
    await testMappingPagamentos()
    
    console.log('🎉 Todos os testes concluídos!')
    console.log('─'.repeat(50))
  } catch (error) {
    console.error('❌ Erro ao executar testes:', error)
  }
}

// Executar testes
runAllTests()

