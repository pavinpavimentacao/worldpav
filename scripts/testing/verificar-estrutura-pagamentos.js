/**
 * Script para verificar a estrutura da tabela obras_pagamentos_diretos
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEstrutura() {
  console.log('🔍 Verificando estrutura da tabela obras_pagamentos_diretos...\n')

  try {
    // Buscar dados de exemplo
    console.log('📋 Buscando dados de exemplo...\n')
    const { data: pagamentos, error: dataError } = await supabase
      .from('obras_pagamentos_diretos')
      .select('*')
      .limit(3)
    
    if (dataError) {
      console.error('❌ Erro ao buscar dados:', dataError)
      return
    }

    if (pagamentos && pagamentos.length > 0) {
      console.log(`✅ ${pagamentos.length} registro(s) encontrado(s):\n`)
      pagamentos.forEach((p, i) => {
        console.log(`📄 Registro ${i + 1}:`)
        console.log(JSON.stringify(p, null, 2))
        console.log('')
      })
      
      // Diagnóstico
      console.log('\n🎯 DIAGNÓSTICO:\n')
      const columnNames = Object.keys(pagamentos[0])
      
      const inglesCampos = ['description', 'amount', 'payment_date', 'payment_method', 'document_url', 'observations']
      const portuguesCampos = ['descricao', 'valor', 'data_pagamento', 'forma_pagamento', 'comprovante_url', 'observacoes']
      
      const temIngles = inglesCampos.some(campo => columnNames.includes(campo))
      const temPortugues = portuguesCampos.some(campo => columnNames.includes(campo))
      
      if (temIngles && !temPortugues) {
        console.log('⚠️ A tabela usa campos em INGLÊS')
        console.log('✅ O mapeamento já está implementado na API')
        console.log('💡 Não é necessário alterar a estrutura do banco')
      } else if (temPortugues && !temIngles) {
        console.log('✅ A tabela usa campos em PORTUGUÊS')
        console.log('⚠️ Verificar se o mapeamento da API está correto')
      } else if (temIngles && temPortugues) {
        console.log('⚠️ A tabela tem AMBOS os campos (inglês e português)')
        console.log('💡 Verificar se há dados duplicados')
      }
      
      console.log('\n📊 Campos encontrados:')
      columnNames.forEach(campo => {
        const isIngles = inglesCampos.includes(campo)
        const isPortugues = portuguesCampos.includes(campo)
        let status = ''
        if (isIngles) status = ' (INGLÊS)'
        if (isPortugues) status = ' (PORTUGUÊS)'
        console.log(`  - ${campo}${status}`)
      })
      
    } else {
      console.log('⚠️ Nenhum registro encontrado na tabela')
      console.log('✅ A tabela existe (query executada com sucesso)')
      console.log('💡 A estrutura será verificada quando houver dados')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verificarEstrutura()
