import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ztcwsztsiuevwmgyfyzh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY1NDczODQsImV4cCI6MjAzMjEyMzM4NH0.zKgwkPKYgUoNH42iTSl7T3qGBsFgLMv_9U1gxGGTGFc'
)

async function verificarRelatorio() {
  const relatorioId = '14978779-1433-4662-85d4-6bfeb6e3eeb7'
  
  console.log('🔍 Verificando relatório:', relatorioId)
  
  // 1. Buscar relatório
  const { data: relatorio, error: relError } = await supabase
    .from('relatorios_diarios')
    .select('*')
    .eq('id', relatorioId)
    .single()
  
  if (relError) {
    console.error('❌ Erro ao buscar relatório:', relError)
    return
  }
  
  console.log('\n📄 Relatório encontrado:')
  console.log('  - ID:', relatorio.id)
  console.log('  - equipe_id:', relatorio.equipe_id)
  console.log('  - tipo_equipe:', relatorio.tipo_equipe)
  
  // 2. Buscar colaboradores com equipe_id
  const { data: colaboradores, error: colError } = await supabase
    .from('colaboradores')
    .select('id, name, equipe_id, tipo_equipe')
    .is('deleted_at', null)
    .limit(5)
  
  if (colError) {
    console.error('❌ Erro ao buscar colaboradores:', colError)
  } else {
    console.log('\n👥 Colaboradores:')
    colaboradores.forEach(c => {
      console.log(`  - ${c.name}: equipe_id=${c.equipe_id}, tipo_equipe=${c.tipo_equipe}`)
    })
  }
  
  // 3. Buscar equipes
  const { data: equipes, error: eqError } = await supabase
    .from('equipes')
    .select('id, name, prefixo')
    .is('deleted_at', null)
  
  if (eqError) {
    console.error('❌ Erro ao buscar equipes:', eqError)
  } else {
    console.log('\n👥 Equipes:')
    equipes.forEach(e => {
      console.log(`  - ${e.name} (${e.prefixo})`)
    })
  }
}

verificarRelatorio()
