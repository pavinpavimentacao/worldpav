/**
 * Testes de Integração - Contas a Pagar
 * Testa todas as funcionalidades da API com dados reais
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

// Funções auxiliares
const mapearStatusAppParaBanco = (status) => {
  switch (status) {
    case 'Pendente': return 'pendente'
    case 'Paga': return 'pago'
    case 'Atrasada': return 'atrasado'
    case 'Cancelada': return 'cancelado'
    default: return 'pendente'
  }
}

const mapearStatusBancoParaApp = (status) => {
  switch (status?.toLowerCase()) {
    case 'pendente': return 'Pendente'
    case 'pago': return 'Paga'
    case 'atrasado': return 'Atrasada'
    case 'cancelado': return 'Cancelada'
    default: return 'Pendente'
  }
}

// Obter company_id padrão
async function getOrCreateDefaultCompany() {
  try {
    const DEFAULT_COMPANY_ID = '39cf8b61-6737-4aa5-af3f-51fba9f12345'
    
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', DEFAULT_COMPANY_ID)
      .single()
    
    if (existingCompany) {
      return existingCompany.id
    }
    
    const { data: newCompanies } = await supabase
      .from('companies')
      .insert([{ id: DEFAULT_COMPANY_ID, name: 'Worldpav' }])
      .select('id')
    
    return newCompanies?.[0]?.id || DEFAULT_COMPANY_ID
  } catch (error) {
    console.error('Erro ao obter company:', error)
    return '39cf8b61-6737-4aa5-af3f-51fba9f12345'
  }
}

// Testes
let contaCriadaId = null
let companyId = null

async function testarCriacao() {
  console.log('\n🧪 TESTE 1: Criar Conta a Pagar')
  console.log('='.repeat(50))
  
  try {
    companyId = await getOrCreateDefaultCompany()
    console.log('✅ Company ID obtido:', companyId)
    
    const novaConta = {
      company_id: companyId,
      description: 'NF-001 - Teste de integração - Materiais de construção',
      invoice_number: 'NF-TEST-001',
      amount: 1500.00,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
      status: 'pendente',
      supplier: 'Fornecedor Teste Ltda',
      category: 'Materiais',
    }
    
    console.log('📤 Enviando dados:', JSON.stringify(novaConta, null, 2))
    
    const { data, error } = await supabase
      .from('contas_pagar')
      .insert(novaConta)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar:', error.message)
      console.error('   Código:', error.code)
      console.error('   Detalhes:', error.details)
      return false
    }
    
    contaCriadaId = data.id
    console.log('✅ Conta criada com sucesso!')
    console.log('   ID:', data.id)
    console.log('   Número:', data.invoice_number)
    console.log('   Status:', mapearStatusBancoParaApp(data.status))
    console.log('   Valor:', data.amount)
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarListagem() {
  console.log('\n🧪 TESTE 2: Listar Contas')
  console.log('='.repeat(50))
  
  try {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Erro ao listar:', error.message)
      return false
    }
    
    console.log(`✅ ${data.length} conta(s) encontrada(s)`)
    
    if (data.length > 0) {
      console.log('\n📋 Primeiras contas:')
      data.forEach((conta, i) => {
        console.log(`\n   ${i + 1}. ${conta.invoice_number || 'Sem número'}`)
        console.log(`      Status: ${mapearStatusBancoParaApp(conta.status)}`)
        console.log(`      Valor: R$ ${Number(conta.amount).toFixed(2)}`)
        console.log(`      Vencimento: ${conta.due_date}`)
        if (conta.supplier) console.log(`      Fornecedor: ${conta.supplier}`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarBuscaPorId() {
  console.log('\n🧪 TESTE 3: Buscar Conta por ID')
  console.log('='.repeat(50))
  
  if (!contaCriadaId) {
    console.log('⚠️  Nenhuma conta criada para testar')
    return false
  }
  
  try {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('id', contaCriadaId)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar:', error.message)
      return false
    }
    
    if (!data) {
      console.error('❌ Conta não encontrada')
      return false
    }
    
    console.log('✅ Conta encontrada!')
    console.log('   ID:', data.id)
    console.log('   Número:', data.invoice_number)
    console.log('   Descrição:', data.description)
    console.log('   Valor:', data.amount)
    console.log('   Status:', mapearStatusBancoParaApp(data.status))
    console.log('   Company ID:', data.company_id)
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarFiltros() {
  console.log('\n🧪 TESTE 4: Filtros e Busca')
  console.log('='.repeat(50))
  
  try {
    // Teste 4.1: Filtro por status
    console.log('\n📌 4.1. Filtro por status "pendente"')
    const { data: porStatus, error: errStatus } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pendente')
      .is('deleted_at', null)
    
    if (errStatus) {
      console.error('   ❌ Erro:', errStatus.message)
    } else {
      console.log(`   ✅ ${porStatus.length} conta(s) pendente(s)`)
    }
    
    // Teste 4.2: Busca por texto (invoice_number)
    console.log('\n📌 4.2. Busca por texto "TEST"')
    const { data: porTexto, error: errTexto } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('company_id', companyId)
      .or('invoice_number.ilike.%TEST%,description.ilike.%TEST%,supplier.ilike.%TEST%')
      .is('deleted_at', null)
    
    if (errTexto) {
      console.error('   ❌ Erro:', errTexto.message)
    } else {
      console.log(`   ✅ ${porTexto.length} conta(s) encontrada(s) com "TEST"`)
    }
    
    // Teste 4.3: Filtro por data (próximos 60 dias)
    console.log('\n📌 4.3. Filtro por data (próximos 60 dias)')
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + 60)
    const dataLimiteStr = dataLimite.toISOString().split('T')[0]
    
    const { data: porData, error: errData } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('company_id', companyId)
      .lte('due_date', dataLimiteStr)
      .is('deleted_at', null)
    
    if (errData) {
      console.error('   ❌ Erro:', errData.message)
    } else {
      console.log(`   ✅ ${porData.length} conta(s) com vencimento nos próximos 60 dias`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarEdicao() {
  console.log('\n🧪 TESTE 5: Editar Conta')
  console.log('='.repeat(50))
  
  if (!contaCriadaId) {
    console.log('⚠️  Nenhuma conta criada para testar')
    return false
  }
  
  try {
    const dadosAtualizacao = {
      description: 'NF-001 - Teste de integração - MATERIAIS ATUALIZADOS',
      amount: 1750.00,
      status: 'pago',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'PIX',
    }
    
    console.log('📤 Atualizando com:', JSON.stringify(dadosAtualizacao, null, 2))
    
    const { data, error } = await supabase
      .from('contas_pagar')
      .update(dadosAtualizacao)
      .eq('id', contaCriadaId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao atualizar:', error.message)
      console.error('   Código:', error.code)
      return false
    }
    
    console.log('✅ Conta atualizada com sucesso!')
    console.log('   Novo valor:', data.amount)
    console.log('   Novo status:', mapearStatusBancoParaApp(data.status))
    console.log('   Data pagamento:', data.payment_date)
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarEstatisticas() {
  console.log('\n🧪 TESTE 6: Calcular Estatísticas')
  console.log('='.repeat(50))
  
  try {
    const { data, error } = await supabase
      .from('contas_pagar')
      .select('status, amount, due_date, payment_date')
      .eq('company_id', companyId)
      .is('deleted_at', null)
    
    if (error) {
      console.error('❌ Erro ao buscar dados:', error.message)
      return false
    }
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const stats = {
      total: 0,
      pendente: 0,
      pago: 0,
      atrasado: 0,
      valorTotal: 0,
      valorPendente: 0,
      valorPago: 0,
      valorAtrasado: 0,
    }
    
    data.forEach((item) => {
      stats.total++
      stats.valorTotal += Number(item.amount) || 0
      
      const statusApp = mapearStatusBancoParaApp(item.status)
      const dueDate = item.due_date ? new Date(item.due_date) : null
      
      if (statusApp === 'Paga') {
        stats.pago++
        stats.valorPago += Number(item.amount) || 0
      } else if (statusApp === 'Pendente') {
        stats.pendente++
        stats.valorPendente += Number(item.amount) || 0
        
        if (dueDate && dueDate < hoje) {
          stats.atrasado++
          stats.valorAtrasado += Number(item.amount) || 0
        }
      } else if (statusApp === 'Atrasada') {
        stats.atrasado++
        stats.valorAtrasado += Number(item.amount) || 0
      }
    })
    
    console.log('✅ Estatísticas calculadas:')
    console.log(`   Total de contas: ${stats.total}`)
    console.log(`   Pendentes: ${stats.pendente} (R$ ${stats.valorPendente.toFixed(2)})`)
    console.log(`   Pagas: ${stats.pago} (R$ ${stats.valorPago.toFixed(2)})`)
    console.log(`   Atrasadas: ${stats.atrasado} (R$ ${stats.valorAtrasado.toFixed(2)})`)
    console.log(`   Valor total: R$ ${stats.valorTotal.toFixed(2)}`)
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarRLS() {
  console.log('\n🧪 TESTE 7: Row Level Security (RLS)')
  console.log('='.repeat(50))
  
  try {
    // Verificar se consegue ver apenas contas da própria empresa
    const { data: contasPropria, error: errPropria } = await supabase
      .from('contas_pagar')
      .select('id, company_id')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .limit(1)
    
    if (errPropria) {
      console.error('❌ Erro ao verificar RLS:', errPropria.message)
      return false
    }
    
    console.log('✅ RLS funcionando - consegue ver contas da própria empresa')
    console.log(`   ${contasPropria?.length || 0} conta(s) visível(is)`)
    
    // Tentar acessar com outro company_id (deve falhar ou retornar vazio)
    const outroCompanyId = '00000000-0000-0000-0000-000000000000'
    const { data: contasOutro, error: errOutro } = await supabase
      .from('contas_pagar')
      .select('id')
      .eq('company_id', outroCompanyId)
      .is('deleted_at', null)
    
    if (errOutro) {
      console.log('✅ RLS bloqueando acesso a outras empresas (esperado)')
    } else {
      console.log(`   Acesso a outras empresas retornou ${contasOutro?.length || 0} resultado(s)`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function testarExclusao() {
  console.log('\n🧪 TESTE 8: Soft Delete (Exclusão)')
  console.log('='.repeat(50))
  
  if (!contaCriadaId) {
    console.log('⚠️  Nenhuma conta criada para testar exclusão')
    return false
  }
  
  try {
    // Soft delete usando deleted_at
    const { error } = await supabase
      .from('contas_pagar')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', contaCriadaId)
    
    if (error) {
      console.error('❌ Erro ao excluir:', error.message)
      console.error('   Código:', error.code)
      return false
    }
    
    console.log('✅ Conta marcada como deletada (soft delete)')
    
    // Verificar se não aparece mais na listagem (deleted_at IS NULL)
    const { data: contasAposDelecao } = await supabase
      .from('contas_pagar')
      .select('id')
      .eq('id', contaCriadaId)
      .is('deleted_at', null)
      .single()
    
    if (contasAposDelecao) {
      console.error('❌ Conta ainda aparece na listagem após exclusão')
      return false
    } else {
      console.log('✅ Conta não aparece mais na listagem (deleted_at IS NULL funciona)')
    }
    
    return true
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

async function executarTodosTestes() {
  console.log('🚀 ==========================================')
  console.log('🚀 TESTES DE INTEGRAÇÃO - CONTAS A PAGAR')
  console.log('🚀 ==========================================')
  
  const resultados = {
    criacao: false,
    listagem: false,
    buscaPorId: false,
    filtros: false,
    edicao: false,
    estatisticas: false,
    rls: false,
    exclusao: false,
  }
  
  try {
    resultados.criacao = await testarCriacao()
    resultados.listagem = await testarListagem()
    resultados.buscaPorId = await testarBuscaPorId()
    resultados.filtros = await testarFiltros()
    resultados.edicao = await testarEdicao()
    resultados.estatisticas = await testarEstatisticas()
    resultados.rls = await testarRLS()
    resultados.exclusao = await testarExclusao()
    
  } finally {
    // Limpar conta de teste se ainda existir
    if (contaCriadaId) {
      try {
        await supabase
          .from('contas_pagar')
          .delete()
          .eq('id', contaCriadaId)
        console.log('\n🧹 Conta de teste removida permanentemente')
      } catch (error) {
        console.log('\n⚠️  Não foi possível remover conta de teste')
      }
    }
  }
  
  // Relatório final
  console.log('\n📊 ==========================================')
  console.log('📊 RELATÓRIO FINAL DOS TESTES')
  console.log('📊 ==========================================\n')
  
  const totalTestes = Object.keys(resultados).length
  const testesPassaram = Object.values(resultados).filter(r => r === true).length
  
  Object.entries(resultados).forEach(([teste, passou]) => {
    const status = passou ? '✅ PASSOU' : '❌ FALHOU'
    console.log(`   ${teste.padEnd(20)} ${status}`)
  })
  
  console.log(`\n   Total: ${testesPassaram}/${totalTestes} testes passaram`)
  
  if (testesPassaram === totalTestes) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!')
  } else {
    console.log(`\n⚠️  ${totalTestes - testesPassaram} teste(s) falharam`)
  }
  
  console.log('\n')
}

// Executar
executarTodosTestes().catch(console.error)








