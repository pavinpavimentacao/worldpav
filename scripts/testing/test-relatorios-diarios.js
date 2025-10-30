/**
 * TESTE: Sistema de Relatórios Diários
 * 
 * Este script testa:
 * 1. Criação das tabelas
 * 2. Triggers e funções
 * 3. Inserção de dados
 * 4. Validações
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente manualmente
function loadEnv() {
  try {
    const envPath = join(__dirname, '../../.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
    
    return envVars;
  } catch (err) {
    console.warn('Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
    return {};
  }
}

const envVars = { ...loadEnv(), ...process.env };

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para log colorido
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warning: (msg) => console.warn(`⚠️  ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`)
};

// ========================================
// TESTES
// ========================================

async function testTablesExist() {
  log.test('Testando se as tabelas foram criadas...');
  
  const tables = [
    'relatorios_diarios',
    'relatorios_diarios_maquinarios'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error && error.code === 'PGRST116') {
        log.error(`Tabela "${table}" não existe`);
        return false;
      }
      
      log.success(`Tabela "${table}" existe`);
    } catch (err) {
      log.error(`Erro ao verificar tabela "${table}": ${err.message}`);
      return false;
    }
  }
  
  return true;
}

async function testColumnsAdded() {
  log.test('Testando se as colunas foram adicionadas...');
  
  // Verificar colunas em obras_ruas
  const columnsToCheck = [
    'relatorio_diario_id',
    'data_finalizacao',
    'metragem_executada',
    'toneladas_executadas'
  ];

  for (const column of columnsToCheck) {
    try {
      const { data, error } = await supabase
        .from('obras_ruas')
        .select(column)
        .limit(1);
      
      if (error) {
        log.error(`Coluna "obras_ruas.${column}" não existe`);
        return false;
      }
      
      log.success(`Coluna "obras_ruas.${column}" existe`);
    } catch (err) {
      log.error(`Erro ao verificar coluna "${column}": ${err.message}`);
      return false;
    }
  }
  
  return true;
}

async function testTriggerGeneratesNumber() {
  log.test('Testando se o trigger gera número automaticamente...');
  
  try {
    // Buscar uma obra existente para testar
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('id')
      .limit(1)
      .single();
    
    if (obrasError || !obras) {
      log.warning('Nenhuma obra encontrada para teste');
      return true; // Não é erro, apenas sem dados
    }
    
    // Criar um relatório de teste
    const { data, error } = await supabase
      .from('relatorios_diarios')
      .insert({
        obra_id: obras.id,
        data_inicio: new Date(),
        horario_inicio: '08:00',
        metragem_feita: 100,
        toneladas_aplicadas: 50
      })
      .select()
      .single();
    
    if (error) {
      log.error(`Erro ao criar relatório: ${error.message}`);
      return false;
    }
    
    if (!data.numero) {
      log.error('Número do relatório não foi gerado automaticamente');
      return false;
    }
    
    // Validar formato do número
    const numeroPattern = /^RD-\d{4}-\d{3}$/;
    if (!numeroPattern.test(data.numero)) {
      log.error(`Formato de número inválido: ${data.numero}`);
      return false;
    }
    
    log.success(`Número gerado automaticamente: ${data.numero}`);
    
    // Limpar teste
    await supabase
      .from('relatorios_diarios')
      .delete()
      .eq('id', data.id);
    
    return true;
  } catch (err) {
    log.error(`Erro no teste de trigger: ${err.message}`);
    return false;
  }
}

async function testCalculateThickness() {
  log.test('Testando se a espessura é calculada automaticamente...');
  
  try {
    // Buscar uma obra existente
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('id')
      .limit(1)
      .single();
    
    if (obrasError || !obras) {
      log.warning('Nenhuma obra encontrada para teste');
      return true;
    }
    
    const metragem = 100;
    const toneladas = 50;
    
    // Criar relatório
    const { data, error } = await supabase
      .from('relatorios_diarios')
      .insert({
        obra_id: obras.id,
        data_inicio: new Date(),
        horario_inicio: '08:00',
        metragem_feita: metragem,
        toneladas_aplicadas: toneladas
      })
      .select()
      .single();
    
    if (error) {
      log.error(`Erro ao criar relatório: ${error.message}`);
      return false;
    }
    
    // Calcular espessura esperada (em cm)
    // densidade = 2.4 ton/m³
    // espessura = (toneladas / metragem / densidade) × 100
    const espessuraEsperada = (toneladas / metragem / 2.4) * 100;
    
    if (!data.espessura_calculada) {
      log.error('Espessura não foi calculada automaticamente');
      return false;
    }
    
    // Verificar se o cálculo está correto (tolerância de 0.01)
    const diferenca = Math.abs(data.espessura_calculada - espessuraEsperada);
    if (diferenca > 0.01) {
      log.error(`Espessura calculada incorreta. Esperado: ${espessuraEsperada.toFixed(2)}, Recebido: ${data.espessura_calculada.toFixed(2)}`);
      return false;
    }
    
    log.success(`Espessura calculada corretamente: ${data.espessura_calculada.toFixed(2)} cm`);
    
    // Limpar teste
    await supabase
      .from('relatorios_diarios')
      .delete()
      .eq('id', data.id);
    
    return true;
  } catch (err) {
    log.error(`Erro no teste de espessura: ${err.message}`);
    return false;
  }
}

async function testFinalizeRuaTrigger() {
  log.test('Testando se o trigger finaliza rua automaticamente...');
  
  try {
    // Buscar uma rua que não está finalizada
    const { data: rua, error: ruaError } = await supabase
      .from('obras_ruas')
      .select('id, status')
      .eq('status', 'planejada')
      .limit(1)
      .single();
    
    if (ruaError || !rua) {
      log.warning('Nenhuma rua planejada encontrada para teste');
      return true;
    }
    
    // Criar relatório vinculado à rua
    const metragem = 50;
    const toneladas = 25;
    
    const { data: relatorio, error: relatorioError } = await supabase
      .from('relatorios_diarios')
      .insert({
        rua_id: rua.id,
        data_inicio: new Date(),
        horario_inicio: '08:00',
        metragem_feita: metragem,
        toneladas_aplicadas: toneladas
      })
      .select()
      .single();
    
    if (relatorioError) {
      log.error(`Erro ao criar relatório: ${relatorioError.message}`);
      return false;
    }
    
    // Verificar se a rua foi atualizada
    const { data: ruaAtualizada, error: verificaError } = await supabase
      .from('obras_ruas')
      .select('status, relatorio_diario_id, data_finalizacao, metragem_executada, toneladas_executadas')
      .eq('id', rua.id)
      .single();
    
    if (verificaError) {
      log.error(`Erro ao verificar rua: ${verificaError.message}`);
      return false;
    }
    
    // Validar atualizações
    if (ruaAtualizada.status !== 'finalizada') {
      log.error(`Rua não foi finalizada. Status: ${ruaAtualizada.status}`);
      return false;
    }
    
    if (ruaAtualizada.relatorio_diario_id !== relatorio.id) {
      log.error('Relatório não foi vinculado à rua');
      return false;
    }
    
    if (ruaAtualizada.metragem_executada !== metragem) {
      log.error(`Metragem executada não foi atualizada. Esperado: ${metragem}, Recebido: ${ruaAtualizada.metragem_executada}`);
      return false;
    }
    
    if (ruaAtualizada.toneladas_executadas !== toneladas) {
      log.error(`Toneladas executadas não foram atualizadas. Esperado: ${toneladas}, Recebido: ${ruaAtualizada.toneladas_executadas}`);
      return false;
    }
    
    log.success('Rua foi finalizada automaticamente com sucesso');
    
    // Limpar teste (restaurar rua)
    await supabase
      .from('obras_ruas')
      .update({
        status: 'planejada',
        relatorio_diario_id: null,
        data_finalizacao: null,
        metragem_executada: null,
        toneladas_executadas: null
      })
      .eq('id', rua.id);
    
    await supabase
      .from('relatorios_diarios')
      .delete()
      .eq('id', relatorio.id);
    
    return true;
  } catch (err) {
    log.error(`Erro no teste de finalização de rua: ${err.message}`);
    return false;
  }
}

async function testViewComplete() {
  log.test('Testando se a view está funcionando...');
  
  try {
    const { data, error } = await supabase
      .from('vw_relatorios_diarios_completo')
      .select('*')
      .limit(5);
    
    if (error) {
      log.error(`Erro ao consultar view: ${error.message}`);
      return false;
    }
    
    log.success(`View está funcionando. ${data.length} registro(s) encontrado(s)`);
    return true;
  } catch (err) {
    log.error(`Erro ao testar view: ${err.message}`);
    return false;
  }
}

async function testInsertMaquinarios() {
  log.test('Testando inserção de maquinários em relatório...');
  
  try {
    // Buscar obra
    const { data: obras } = await supabase
      .from('obras')
      .select('id')
      .limit(1)
      .single();
    
    if (!obras) {
      log.warning('Nenhuma obra encontrada para teste');
      return true;
    }
    
    // Criar relatório
    const { data: relatorio } = await supabase
      .from('relatorios_diarios')
      .insert({
        obra_id: obras.id,
        data_inicio: new Date(),
        horario_inicio: '08:00',
        metragem_feita: 100,
        toneladas_aplicadas: 50
      })
      .select()
      .single();
    
    if (!relatorio) {
      log.error('Não foi possível criar relatório');
      return false;
    }
    
    // Inserir maquinário (sem especificar maquinário real, apenas estrutura)
    const { error: maqError } = await supabase
      .from('relatorios_diarios_maquinarios')
      .insert({
        relatorio_id: relatorio.id,
        is_terceiro: false
      });
    
    if (maqError) {
      log.error(`Erro ao inserir maquinário: ${maqError.message}`);
      return false;
    }
    
    log.success('Maquinário inserido com sucesso');
    
    // Limpar
    await supabase
      .from('relatorios_diarios')
      .delete()
      .eq('id', relatorio.id);
    
    return true;
  } catch (err) {
    log.error(`Erro no teste de maquinários: ${err.message}`);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  log.info('========================================');
  log.info('INICIANDO TESTES - RELATÓRIOS DIÁRIOS');
  log.info('========================================\n');
  
  const testes = [
    { name: 'Tabelas criadas', fn: testTablesExist },
    { name: 'Colunas adicionadas', fn: testColumnsAdded },
    { name: 'Trigger gera número', fn: testTriggerGeneratesNumber },
    { name: 'Espessura calculada', fn: testCalculateThickness },
    { name: 'Rua finalizada automaticamente', fn: testFinalizeRuaTrigger },
    { name: 'View completa', fn: testViewComplete },
    { name: 'Inserção de maquinários', fn: testInsertMaquinarios }
  ];
  
  const resultados = [];
  
  for (const teste of testes) {
    log.info(`\nExecutando: ${teste.name}`);
    try {
      const resultado = await teste.fn();
      resultados.push({ name: teste.name, pass: resultado });
    } catch (err) {
      log.error(`Erro inesperado: ${err.message}`);
      resultados.push({ name: teste.name, pass: false });
    }
  }
  
  // Resumo
  log.info('\n========================================');
  log.info('RESUMO DOS TESTES');
  log.info('========================================');
  
  const passou = resultados.filter(r => r.pass).length;
  const falhou = resultados.filter(r => !r.pass).length;
  
  resultados.forEach(r => {
    if (r.pass) {
      log.success(`${r.name}: PASSOU`);
    } else {
      log.error(`${r.name}: FALHOU`);
    }
  });
  
  log.info(`\nTotal: ${resultados.length} | Passou: ${passou} | Falhou: ${falhou}`);
  
  if (falhou === 0) {
    log.success('\n✅ TODOS OS TESTES PASSARAM!');
  } else {
    log.error(`\n❌ ${falhou} teste(s) falharam`);
  }
}

// Executar
runAllTests().catch(console.error);

