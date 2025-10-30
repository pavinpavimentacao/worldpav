/**
 * VERIFICADOR: Estado da Migração de Relatórios Diários
 * 
 * Verifica se a migração foi aplicada e qual é a estrutura atual
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
  warning: (msg) => console.warn(`⚠️  ${msg}`),
  test: (msg) => console.log(`🧪 ${msg}`)
};

async function verificarColunasTabela(tableName) {
  log.test(`Verificando colunas da tabela: ${tableName}`);
  
  try {
    // Tentar buscar estrutura de diferentes formas
    const { data: data1, error: error1 } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (!error1 && data1 && data1.length > 0) {
      const colunas = Object.keys(data1[0]);
      log.success(`Colunas encontradas: ${colunas.join(', ')}`);
      return colunas;
    }
    
    // Se não retornou dados, tentar query SQL direta
    const { data: data2, error: error2 } = await supabase.rpc('describe_table', { 
      table_name: tableName 
    });
    
    if (!error2) {
      log.success(`Estrutura: ${JSON.stringify(data2, null, 2)}`);
      return data2;
    }
    
    log.warning('Não foi possível obter estrutura da tabela via Supabase');
    return [];
    
  } catch (err) {
    log.error(`Erro: ${err.message}`);
    return [];
  }
}

async function main() {
  log.info('========================================');
  log.info('VERIFICANDO MIGRAÇÃO - RELATÓRIOS DIÁRIOS');
  log.info('========================================\n');
  
  // Verificar se tabela relatorios_diarios existe
  log.test('\n1. Verificando existência de tabelas...');
  
  const tabelas = [
    'relatorios_diarios',
    'relatorios_diarios_maquinarios'
  ];
  
  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(0);
      
      if (error && error.code === 'PGRST116') {
        log.error(`❌ Tabela "${tabela}" NÃO EXISTE`);
      } else if (error) {
        log.error(`❌ Erro ao verificar "${tabela}": ${error.message}`);
      } else {
        log.success(`✅ Tabela "${tabela}" EXISTE`);
      }
    } catch (err) {
      log.error(`❌ Erro ao verificar "${tabela}": ${err.message}`);
    }
  }
  
  // Verificar colunas em relatorios_diarios
  log.test('\n2. Verificando colunas de relatorios_diarios...');
  
  try {
    // Tentar uma query simples para ver o schema
    const { data, error } = await supabase
      .from('relatorios_diarios')
      .select('*')
      .limit(0);
    
    if (error) {
      log.error(`Erro: ${error.message}`);
      log.error(`Código: ${error.code}`);
      log.error(`Detalhes: ${JSON.stringify(error, null, 2)}`);
    } else {
      log.success('Consulta retornou sem erros');
    }
    
    // Tentar inserir um registro de teste para ver o erro completo
    log.test('\n3. Tentando inserir registro de teste...');
    
    const { data: testeData, error: testeError } = await supabase
      .from('relatorios_diarios')
      .insert({
        numero: 'RD-2024-TEST',
        data_inicio: new Date().toISOString().split('T')[0]
      })
      .select();
    
    if (testeError) {
      log.error(`Erro na inserção: ${testeError.message}`);
      log.error(`Detalhes: ${JSON.stringify(testeError, null, 2)}`);
      
      // Extrair informações do erro
      if (testeError.hint) {
        log.info(`💡 Dica: ${testeError.hint}`);
      }
      if (testeError.details) {
        log.info(`📝 Detalhes: ${testeError.details}`);
      }
    } else {
      log.success('Registro inserido com sucesso!');
      log.info(`Dados: ${JSON.stringify(testeData, null, 2)}`);
      
      // Limpar teste
      if (testeData && testeData.length > 0 && testeData[0].id) {
        await supabase
          .from('relatorios_diarios')
          .delete()
          .eq('id', testeData[0].id);
      }
    }
    
  } catch (err) {
    log.error(`Erro geral: ${err.message}`);
  }
}

main().catch(console.error);


