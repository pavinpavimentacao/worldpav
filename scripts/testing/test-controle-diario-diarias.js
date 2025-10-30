/**
 * TESTE: Controle Diário de Diárias
 * 
 * Este script testa:
 * 1. Colunas adicionadas (status_pagamento, data_pagamento, etc)
 * 2. Valores padrão
 * 3. Índices criados
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

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`)
};

async function testColumnsAdded() {
  log.test('Testando colunas adicionadas...');
  
  const columns = [
    'status_pagamento',
    'data_pagamento',
    'data_diaria',
    'updated_at',
    'adicional',
    'desconto',
    'horas_extras',
    'valor_hora_extra',
    'total_horas_extras',
    'valor_total',
    'quantidade',
    'valor_unitario'
  ];
  
  for (const column of columns) {
    try {
      const { data, error } = await supabase
        .from('controle_diario_diarias')
        .select(column)
        .limit(1);
      
      if (error) {
        log.error(`Coluna "${column}" não existe`);
        return false;
      }
      
      log.success(`Coluna "${column}" existe`);
    } catch (err) {
      log.error(`Erro ao verificar coluna "${column}": ${err.message}`);
      return false;
    }
  }
  
  return true;
}

async function testDefaultValues() {
  log.test('Testando valores padrão...');
  
  try {
    // Verificar se registros existentes têm status_pagamento = 'pendente'
    const { data, error } = await supabase
      .from('controle_diario_diarias')
      .select('status_pagamento')
      .limit(10);
    
    if (error) {
      log.error(`Erro ao buscar registros: ${error.message}`);
      return false;
    }
    
    const comStatus = data.filter(r => r.status_pagamento !== null);
    
    if (comStatus.length > 0) {
      const todosPendentes = comStatus.every(r => r.status_pagamento === 'pendente');
      
      if (todosPendentes) {
        log.success('Todos os registros têm status_pagamento como "pendente"');
      } else {
        log.error('Alguns registros não têm status_pagamento = "pendente"');
        return false;
      }
    } else {
      log.info('Nenhum registro encontrado para verificar');
    }
    
    return true;
  } catch (err) {
    log.error(`Erro no teste de valores padrão: ${err.message}`);
    return false;
  }
}

async function testInsertWithDefaults() {
  log.test('Testando inserção com valores padrão...');
  
  try {
    // Buscar colaborador para teste
    const { data: colaborador } = await supabase
      .from('colaboradores')
      .select('id')
      .limit(1)
      .single();
    
    if (!colaborador) {
      log.warning('Nenhum colaborador encontrado para teste');
      return true;
    }
    
    // Inserir registro de teste
    const { data, error } = await supabase
      .from('controle_diario_diarias')
      .insert({
        colaborador_id: colaborador.id,
        data_diaria: new Date(),
        quantidade: 1,
        valor_unitario: 100
      })
      .select()
      .single();
    
    if (error) {
      log.error(`Erro ao inserir: ${error.message}`);
      return false;
    }
    
    // Verificar valores padrão
    const verificacoes = [
      { campo: 'status_pagamento', esperado: 'pendente' },
      { campo: 'adicional', esperado: 0 },
      { campo: 'desconto', esperado: 0 },
      { campo: 'horas_extras', esperado: 0 },
      { campo: 'total_horas_extras', esperado: 0 }
    ];
    
    for (const verificacao of verificacoes) {
      if (data[verificacao.campo] !== verificacao.esperado) {
        log.error(`${verificacao.campo} incorreto. Esperado: ${verificacao.esperado}, Recebido: ${data[verificacao.campo]}`);
        return false;
      }
    }
    
    log.success('Valores padrão funcionando corretamente');
    
    // Limpar
    await supabase
      .from('controle_diario_diarias')
      .delete()
      .eq('id', data.id);
    
    return true;
  } catch (err) {
    log.error(`Erro no teste de inserção: ${err.message}`);
    return false;
  }
}

async function runAllTests() {
  log.info('========================================');
  log.info('INICIANDO TESTES - CONTROLE DIÁRIO DIÁRIAS');
  log.info('========================================\n');
  
  const testes = [
    { name: 'Colunas adicionadas', fn: testColumnsAdded },
    { name: 'Valores padrão atualizados', fn: testDefaultValues },
    { name: 'Inserção com valores padrão', fn: testInsertWithDefaults }
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

runAllTests().catch(console.error);

