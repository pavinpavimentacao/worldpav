// Script para testar conexão com o banco e inserir dados de teste
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMjQ4MDAsImV4cCI6MjA0NzgwMDgwMH0.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testando conexão com o banco...')
  
  try {
    // 1. Testar conexão básica
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'colaboradores')
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }
    
    console.log('✅ Tabela colaboradores existe:', tables.length > 0)
    
    // 2. Verificar estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'colaboradores')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError)
      return
    }
    
    console.log('📋 Colunas da tabela colaboradores:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    })
    
    // 3. Tentar inserir um colaborador de teste
    console.log('🧪 Testando inserção de colaborador...')
    
    const { data: insertData, error: insertError } = await supabase
      .from('colaboradores')
      .insert([{
        company_id: '00000000-0000-0000-0000-000000000000', // ID temporário
        name: 'João Silva Teste',
        cpf: '12345678901',
        email: 'joao.teste@example.com',
        phone: '11999999999',
        position: 'Ajudante',
        tipo_equipe: 'massa',
        status: 'ativo'
      }])
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir colaborador:', insertError)
    } else {
      console.log('✅ Colaborador inserido com sucesso:', insertData)
    }
    
    // 4. Tentar buscar colaboradores
    console.log('🔍 Testando busca de colaboradores...')
    
    const { data: colaboradores, error: selectError } = await supabase
      .from('colaboradores')
      .select('*')
      .limit(5)
    
    if (selectError) {
      console.error('❌ Erro ao buscar colaboradores:', selectError)
    } else {
      console.log('✅ Colaboradores encontrados:', colaboradores.length)
      console.log('📄 Dados:', colaboradores)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testDatabase()
