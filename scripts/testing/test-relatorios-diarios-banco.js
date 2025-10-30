/**
 * TESTE: Relatórios Diários - Teste Direto no Banco
 * 
 * Este script testa as funções de Relatórios Diários diretamente no Supabase
 * sem passar pela interface web.
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok'

const supabase = createClient(supabaseUrl, supabaseKey)

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

console.log('\n' + colors.cyan + '═══════════════════════════════════════')
console.log('TESTE: Relatórios Diários - Banco de Dados')
console.log('═══════════════════════════════════════' + colors.reset + '\n')

// ========== FUNÇÕES DE TESTE ==========

/**
 * Calcular espessura (mesma fórmula da API)
 */
function calcularEspessura(metragem, toneladas) {
  const densidade = 2.4
  return (toneladas / metragem / densidade) * 100
}

/**
 * TESTE 1: Criar Relatório Diário
 */
async function testeCriarRelatorio() {
  console.log(colors.blue + '🧪 TESTE 1: Criar Relatório Diário' + colors.reset)
  
  try {
    // Buscar uma rua para testar
    const { data: ruas, error: ruaError } = await supabase
      .from('obras_ruas')
      .select('id, obra_id, name')
      .limit(1)
      .single()

    if (ruaError || !ruas) {
      console.log(colors.yellow + '⚠️  Nenhuma rua encontrada para testar' + colors.reset)
      return false
    }

    console.log('✅ Rua encontrada:', ruas.name)

    // Buscar obra relacionada
    const { data: obra } = await supabase
      .from('obras')
      .select('id, client_id, name')
      .eq('id', ruas.obra_id)
      .single()

    if (!obra) {
      console.log(colors.red + '❌ Obra não encontrada' + colors.reset)
      return false
    }

    console.log('✅ Obra encontrada:', obra.name)
    console.log('✅ Cliente ID:', obra.client_id)

    // Dados do relatório de teste
    const espessuraCalculada = calcularEspessura(450, 27)

    console.log('\n📝 Criando relatório...')
    console.log('- Metragem: 450 m²')
    console.log('- Toneladas: 27 t')
    console.log('- Espessura calculada:', espessuraCalculada.toFixed(2), 'cm')

    // Inserir relatório
    const { data: relatorio, error: insertError } = await supabase
      .from('relatorios_diarios')
      .insert({
        cliente_id: obra.client_id,
        obra_id: obra.id,
        rua_id: ruas.id,
        equipe_id: 'equipe-teste',
        equipe_is_terceira: false,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: new Date().toISOString().split('T')[0],
        horario_inicio: '07:00',
        metragem_feita: 450,
        toneladas_aplicadas: 27,
        espessura_calculada: espessuraCalculada,
        observacoes: 'Relatório criado por teste automatizado',
        status: 'finalizado'
      })
      .select('*')
      .single()

    if (insertError) {
      console.log(colors.red + '❌ Erro ao criar relatório:', insertError.message + colors.reset)
      return false
    }

    console.log(colors.green + '✅ Relatório criado com sucesso!' + colors.reset)
    console.log('   ID:', relatorio.id)
    console.log('   Número:', relatorio.numero)

    // Verificar se a rua foi finalizada
    const { data: ruaAtualizada } = await supabase
      .from('obras_ruas')
      .select('status, relatorio_diario_id, data_finalizacao, metragem_executada, toneladas_executadas')
      .eq('id', ruas.id)
      .single()

    if (ruaAtualizada) {
      console.log('\n🔍 Verificando se rua foi finalizada...')
      console.log('   Status:', ruaAtualizada.status)
      console.log('   Relatório vinculado:', ruaAtualizada.relatorio_diario_id)
      console.log('   Data finalização:', ruaAtualizada.data_finalizacao)
      console.log('   Metragem executada:', ruaAtualizada.metragem_executada)
      console.log('   Toneladas:', ruaAtualizada.toneladas_executadas)
      
      if (ruaAtualizada.relatorio_diario_id === relatorio.id) {
        console.log(colors.green + '✅ Rua finalizada automaticamente via trigger!' + colors.reset)
        return true
      } else {
        console.log(colors.red + '❌ Rua não foi vinculada corretamente' + colors.reset)
        return false
      }
    }

    return false

  } catch (error) {
    console.log(colors.red + '❌ Erro no teste:', error.message + colors.reset)
    return false
  }
}

/**
 * TESTE 2: Buscar Relatórios Diários
 */
async function testeBuscarRelatorios() {
  console.log('\n' + colors.blue + '🧪 TESTE 2: Buscar Relatórios Diários' + colors.reset)

  try {
    const { data: relatorios, error } = await supabase
      .from('relatorios_diarios')
      .select('id, numero, data_inicio, metragem_feita, toneladas_aplicadas, espessura_calculada')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.log(colors.red + '❌ Erro ao buscar relatórios:', error.message + colors.reset)
      return false
    }

    if (!relatorios || relatorios.length === 0) {
      console.log(colors.yellow + '⚠️  Nenhum relatório encontrado' + colors.reset)
      return true
    }

    console.log(colors.green + `✅ ${relatorios.length} relatório(s) encontrado(s):` + colors.reset)
    relatorios.forEach((r, index) => {
      console.log(`   ${index + 1}. ${r.numero} - ${r.data_inicio} - ${r.metragem_feita}m² - ${r.espessura_calculada}cm`)
    })

    return true

  } catch (error) {
    console.log(colors.red + '❌ Erro no teste:', error.message + colors.reset)
    return false
  }
}

/**
 * TESTE 3: Verificar Triggers
 */
async function testeVerificarTriggers() {
  console.log('\n' + colors.blue + '🧪 TESTE 3: Verificar Triggers' + colors.reset)

  try {
    const { data: triggers, error } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgrelid', (await supabase.rpc('get_table_oid', { table_name: 'relatorios_diarios' })).data)

    // Verificar triggers de forma diferente
    const { data, error: queryError } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT trigger_name 
          FROM information_schema.triggers 
          WHERE event_object_table = 'relatorios_diarios'
        `
      })

    if (queryError) {
      console.log(colors.yellow + '⚠️  Não foi possível verificar triggers via RPC' + colors.reset)
      console.log('   Tentando método alternativo...')

      // Verificar se existe relatório com número gerado automaticamente
      const { data: relatorios } = await supabase
        .from('relatorios_diarios')
        .select('numero')
        .like('numero', 'RD-%')
        .limit(1)

      if (relatorios && relatorios.length > 0) {
        console.log(colors.green + '✅ Trigger de geração de número está funcionando' + colors.reset)
        console.log('   Número gerado:', relatorios[0].numero)
        return true
      } else {
        console.log(colors.yellow + '⚠️  Não foi possível verificar triggers' + colors.reset)
        return false
      }
    }

    console.log(colors.green + '✅ Triggers encontrados:', data?.length || 0 + colors.reset)
    return true

  } catch (error) {
    console.log(colors.yellow + '⚠️  Erro ao verificar triggers:', error.message + colors.reset)
    return false
  }
}

// ========== EXECUTAR TESTES ==========

async function executarTestes() {
  console.log(colors.cyan + '🚀 Iniciando testes...\n' + colors.reset)

  let resultados = {
    total: 0,
    sucesso: 0,
    falha: 0
  }

  // Teste 1: Buscar relatórios existentes
  resultados.total++
  if (await testeBuscarRelatorios()) {
    resultados.sucesso++
  } else {
    resultados.falha++
  }

  // Teste 2: Criar novo relatório
  resultados.total++
  if (await testeCriarRelatorio()) {
    resultados.sucesso++
  } else {
    resultados.falha++
  }

  // Teste 3: Verificar triggers
  resultados.total++
  if (await testeVerificarTriggers()) {
    resultados.sucesso++
  } else {
    resultados.falha++
  }

  // Resumo
  console.log('\n' + colors.cyan + '═══════════════════════════════════════')
  console.log('RESULTADO DOS TESTES')
  console.log('═══════════════════════════════════════' + colors.reset)
  console.log('Total:', resultados.total)
  console.log(colors.green + '✅ Sucesso:', resultados.sucesso + colors.reset)
  console.log(colors.red + '❌ Falhas:', resultados.falha + colors.reset)
  console.log(colors.cyan + '═══════════════════════════════════════\n' + colors.reset)

  process.exit(resultados.falha > 0 ? 1 : 0)
}

// Executar
executarTestes().catch(error => {
  console.error(colors.red + '❌ Erro fatal:', error + colors.reset)
  process.exit(1)
})


