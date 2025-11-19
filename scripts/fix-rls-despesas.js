import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDg0NjQsImV4cCI6MjA0ODQ4NDQ2NH0.tLkBQx91MmYSDf2LnMMOd1oMJFSwGAUFt5d4hDpJW-A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRLS() {
  try {
    console.log('🔧 Corrigindo RLS da tabela obras_financeiro_despesas...')
    
    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '../db/migrations/fix_rls_obras_financeiro_despesas.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error)
      
      // Tentar executar diretamente via API
      console.log('⚠️ Tentando método alternativo...')
      console.log('\n📋 Execute este SQL manualmente no Supabase SQL Editor:\n')
      console.log(sql)
      console.log('\n')
      
      return
    }
    
    console.log('✅ RLS corrigido com sucesso!')
    console.log('📊 Resultado:', data)
    
  } catch (error) {
    console.error('❌ Erro:', error)
    console.log('\n⚠️ Execute manualmente no Supabase SQL Editor:')
    console.log('\n📁 Arquivo: db/migrations/fix_rls_obras_financeiro_despesas.sql\n')
  }
}

fixRLS()





