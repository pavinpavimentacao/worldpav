/**
 * Script para verificar a estrutura da tabela contas_pagar
 * Compara estrutura esperada vs estrutura real no banco
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

// Estrutura esperada (baseada no código TypeScript)
const ESTRUTURA_ESPERADA = {
  campos_portugues: [
    'id', 'numero_nota', 'valor', 'data_emissao', 'data_vencimento',
    'status', 'fornecedor', 'descricao', 'categoria', 'data_pagamento',
    'valor_pago', 'forma_pagamento', 'observacoes', 'anexo_url', 'anexo_nome',
    'created_at', 'updated_at', 'created_by', 'updated_by', 'company_id', 'obra_id'
  ],
  campos_ingles: [
    'id', 'company_id', 'obra_id', 'description', 'category', 'supplier',
    'amount', 'due_date', 'payment_date', 'status', 'payment_method',
    'invoice_number', 'invoice_url', 'observations', 'created_at', 'updated_at', 'deleted_at'
  ],
  status_esperado: ['Pendente', 'Paga', 'Atrasada', 'Cancelada'],
  status_enum: ['pendente', 'pago', 'atrasado', 'cancelado']
}

async function verificarEstrutura() {
  console.log('🔍 ==========================================')
  console.log('🔍 VERIFICAÇÃO DA ESTRUTURA: contas_pagar')
  console.log('🔍 ==========================================\n')

  try {
    // 1. Tentar buscar dados de exemplo
    console.log('📋 1. Buscando dados de exemplo da tabela...\n')
    const { data: contas, error: dataError } = await supabase
      .from('contas_pagar')
      .select('*')
      .limit(3)
    
    if (dataError) {
      console.error('❌ Erro ao buscar dados:', dataError.message)
      console.error('❌ Código:', dataError.code)
      console.error('❌ Detalhes:', dataError.details)
      console.error('❌ Hint:', dataError.hint)
      
      // Verificar se a tabela existe ou se é problema de RLS
      if (dataError.code === 'PGRST116' || dataError.message?.includes('permission')) {
        console.log('\n⚠️  Possíveis causas:')
        console.log('   - Tabela não existe')
        console.log('   - RLS (Row Level Security) bloqueando acesso')
        console.log('   - Usuário não autenticado')
      }
      return
    }

    if (contas && contas.length > 0) {
      console.log(`✅ ${contas.length} registro(s) encontrado(s):\n`)
      contas.forEach((conta, i) => {
        console.log(`📄 Registro ${i + 1}:`)
        console.log(JSON.stringify(conta, null, 2))
        console.log('')
      })
      
      // Analisar estrutura
      console.log('\n🎯 ==========================================')
      console.log('🎯 ANÁLISE DA ESTRUTURA')
      console.log('🎯 ==========================================\n')
      
      const columnNames = Object.keys(contas[0])
      console.log(`📊 Total de campos encontrados: ${columnNames.length}\n`)
      
      // Verificar se usa campos em português ou inglês
      const camposPortugues = ESTRUTURA_ESPERADA.campos_portugues
      const camposIngles = ESTRUTURA_ESPERADA.campos_ingles
      
      const temPortugues = camposPortugues.some(campo => columnNames.includes(campo))
      const temIngles = camposIngles.some(campo => columnNames.includes(campo))
      
      console.log('🔍 Identificação de idioma dos campos:')
      if (temPortugues && !temIngles) {
        console.log('   ✅ A tabela usa campos em PORTUGUÊS')
        console.log('   ✅ Alinhado com o código TypeScript')
      } else if (temIngles && !temPortugues) {
        console.log('   ⚠️  A tabela usa campos em INGLÊS')
        console.log('   ❌ NÃO alinhado com o código TypeScript')
        console.log('   💡 Será necessário criar função de mapeamento')
      } else if (temIngles && temPortugues) {
        console.log('   ⚠️  A tabela tem AMBOS os campos (inglês e português)')
        console.log('   💡 Verificar se há dados duplicados ou migração incompleta')
      } else {
        console.log('   ❓ Estrutura não reconhecida')
      }
      console.log('')
      
      // Listar todos os campos encontrados
      console.log('📋 Campos encontrados na tabela:')
      columnNames.forEach(campo => {
        const isPortugues = camposPortugues.includes(campo)
        const isIngles = camposIngles.includes(campo)
        const valor = contas[0][campo]
        const tipo = typeof valor
        let status = ''
        if (isPortugues) status = ' ✅ (PORTUGUÊS - Alinhado)'
        if (isIngles) status = ' ⚠️  (INGLÊS - Precisa mapeamento)'
        if (!isPortugues && !isIngles) status = ' ❓ (Não esperado)'
        
        console.log(`   - ${campo}: ${tipo}${status}`)
        if (valor !== null && valor !== undefined) {
          console.log(`     Exemplo: ${JSON.stringify(valor).substring(0, 50)}`)
        }
      })
      console.log('')
      
      // Verificar campos obrigatórios esperados
      console.log('🔍 Verificação de campos obrigatórios:')
      const camposObrigatoriosEsperados = ['id', 'numero_nota', 'valor', 'data_emissao', 'data_vencimento', 'status']
      camposObrigatoriosEsperados.forEach(campo => {
        const existe = columnNames.includes(campo)
        if (existe) {
          console.log(`   ✅ ${campo}`)
        } else {
          // Verificar se existe equivalente em inglês
          const equivalentes = {
            'numero_nota': 'invoice_number',
            'valor': 'amount',
            'data_emissao': null, // Não tem equivalente direto
            'data_vencimento': 'due_date',
            'status': 'status'
          }
          const equivalente = equivalentes[campo]
          if (equivalente && columnNames.includes(equivalente)) {
            console.log(`   ⚠️  ${campo} → existe como "${equivalente}" (INGLÊS)`)
          } else {
            console.log(`   ❌ ${campo} → NÃO ENCONTRADO`)
          }
        }
      })
      console.log('')
      
      // Verificar valores de status
      console.log('🔍 Verificação de valores de STATUS:')
      const statusEncontrados = [...new Set(contas.map(c => c.status).filter(Boolean))]
      console.log(`   Status encontrados: ${statusEncontrados.join(', ')}`)
      
      const statusMaiusculos = statusEncontrados.filter(s => /^[A-Z]/.test(s))
      const statusMinusculos = statusEncontrados.filter(s => /^[a-z]/.test(s))
      
      if (statusMaiusculos.length > 0) {
        console.log('   ✅ Usando primeira letra MAIÚSCULA (alinhado com código)')
      }
      if (statusMinusculos.length > 0) {
        console.log('   ⚠️  Usando minúsculas (enum do banco)')
        console.log('   💡 Será necessário criar função de mapeamento')
      }
      console.log('')
      
      // Verificar company_id
      console.log('🔍 Verificação de COMPANY_ID:')
      if (columnNames.includes('company_id')) {
        const temCompanyId = contas.some(c => c.company_id)
        if (temCompanyId) {
          console.log('   ✅ Campo company_id existe e está sendo usado')
        } else {
          console.log('   ⚠️  Campo company_id existe mas está NULL nos registros')
          console.log('   💡 Será necessário preencher ao criar novos registros')
        }
      } else {
        console.log('   ❌ Campo company_id NÃO EXISTE na tabela')
        console.log('   💡 Será necessário adicionar (migration)')
      }
      console.log('')
      
      // Verificar campos de controle
      console.log('🔍 Verificação de campos de controle:')
      const camposControle = ['created_at', 'updated_at', 'created_by', 'updated_by']
      camposControle.forEach(campo => {
        if (columnNames.includes(campo)) {
          console.log(`   ✅ ${campo}`)
        } else {
          console.log(`   ⚠️  ${campo} → NÃO ENCONTRADO`)
        }
      })
      console.log('')
      
      // Relatório final
      console.log('📊 ==========================================')
      console.log('📊 RELATÓRIO FINAL')
      console.log('📊 ==========================================\n')
      
      const problemas = []
      const avisos = []
      
      if (!temPortugues && temIngles) {
        problemas.push('Tabela usa campos em inglês, código espera português')
      }
      
      if (statusMinusculos.length > 0) {
        avisos.push('Status em minúsculas, código espera primeira letra maiúscula')
      }
      
      if (!columnNames.includes('company_id')) {
        problemas.push('Campo company_id não existe na tabela')
      } else if (!contas.some(c => c.company_id)) {
        avisos.push('Campo company_id existe mas não está sendo preenchido')
      }
      
      if (problemas.length > 0) {
        console.log('❌ PROBLEMAS CRÍTICOS ENCONTRADOS:')
        problemas.forEach((p, i) => console.log(`   ${i + 1}. ${p}`))
        console.log('')
      }
      
      if (avisos.length > 0) {
        console.log('⚠️  AVISOS:')
        avisos.forEach((a, i) => console.log(`   ${i + 1}. ${a}`))
        console.log('')
      }
      
      if (problemas.length === 0 && avisos.length === 0) {
        console.log('✅ Estrutura está alinhada com o código!')
        console.log('✅ Todos os campos esperados estão presentes')
      }
      
    } else {
      console.log('⚠️  Nenhum registro encontrado na tabela')
      console.log('✅ A tabela existe (query executada com sucesso)')
      console.log('')
      console.log('🔍 Tentando verificar estrutura via metadados...\n')
      
      // Tentar fazer uma query que retorne apenas os campos (sem dados)
      const { data: emptyQuery, error: emptyError } = await supabase
        .from('contas_pagar')
        .select('*')
        .limit(0)
      
      if (!emptyError) {
        console.log('✅ Conexão com a tabela está funcionando')
        console.log('💡 A estrutura será verificada quando houver dados\n')
      }
    }
    
    // Verificar estrutura tentando inserir um registro de teste (rollback)
    console.log('🔍 Verificando estrutura via tentativa de inserção...\n')
    try {
      const testData = {
        numero_nota: 'TEST-VERIFICACAO-001',
        valor: 0.01,
        data_emissao: '2025-01-01',
        data_vencimento: '2025-01-31',
        status: 'Pendente'
      }
      
      // Tentar inserir com campos em português
      const { error: errorPt } = await supabase
        .from('contas_pagar')
        .insert(testData)
        .select()
      
      if (!errorPt) {
        console.log('✅ Estrutura usa campos em PORTUGUÊS!')
        console.log('✅ Campos aceitos:', Object.keys(testData).join(', '))
        
        // Deletar registro de teste
        const { data } = await supabase
          .from('contas_pagar')
          .select('id')
          .eq('numero_nota', 'TEST-VERIFICACAO-001')
          .single()
        
        if (data) {
          await supabase
            .from('contas_pagar')
            .delete()
            .eq('id', data.id)
        }
        
      } else {
        console.log('⚠️  Erro ao inserir com campos em português:', errorPt.message)
        
        // Tentar com campos em inglês
        const testDataEn = {
          invoice_number: 'TEST-VERIFICACAO-001',
          amount: 0.01,
          due_date: '2025-01-31',
          status: 'pendente',
          description: 'Teste de verificação'
        }
        
        const { error: errorEn } = await supabase
          .from('contas_pagar')
          .insert(testDataEn)
          .select()
        
        if (!errorEn) {
          console.log('⚠️  Estrutura usa campos em INGLÊS!')
          console.log('⚠️  Campos aceitos:', Object.keys(testDataEn).join(', '))
          console.log('💡 Será necessário criar função de mapeamento')
          
          // Deletar registro de teste
          const { data } = await supabase
            .from('contas_pagar')
            .select('id')
            .eq('invoice_number', 'TEST-VERIFICACAO-001')
            .single()
          
          if (data) {
            await supabase
              .from('contas_pagar')
              .delete()
              .eq('id', data.id)
          }
        } else {
          console.log('❌ Erro também ao inserir com campos em inglês:', errorEn.message)
          console.log('💡 Possíveis causas:')
          console.log('   - Campos obrigatórios faltando')
          console.log('   - Problemas com RLS')
          console.log('   - Estrutura diferente do esperado')
        }
      }
    } catch (testError) {
      console.log('⚠️  Não foi possível verificar via inserção:', testError.message)
    }
    
    console.log('')
    console.log('📋 Para verificar a estrutura completa, você pode:')
    console.log('   1. Executar a migration 11_contas_pagar.sql')
    console.log('   2. Consultar diretamente no Supabase Dashboard')
    console.log('   3. Criar um registro de teste manualmente')

  } catch (error) {
    console.error('❌ Erro geral:', error)
    console.error('Stack:', error.stack)
  }
}

// Executar verificação
verificarEstrutura()

