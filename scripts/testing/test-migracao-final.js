/**
 * TESTE FINAL: Migração de Relatórios Diários
 * 
 * Testa a estrutura atual e a migração completa
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
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

async function verificarEstrutura() {
  log.info('\n========================================');
  log.info('VERIFICANDO ESTRUTURA ATUAL');
  log.info('========================================\n');
  
  try {
    // Tentar buscar registros para ver a estrutura
    const { data, error } = await supabase
      .from('relatorios_diarios')
      .select('*')
      .limit(1);
    
    if (error) {
      log.error(`Erro: ${error.message}`);
      log.info(`\n💡 A migração precisa ser aplicada primeiro!`);
      log.info(`Execute: migrate_relatorios_diarios_to_new_structure.sql`);
      return false;
    }
    
    if (data && data.length > 0) {
      const colunas = Object.keys(data[0]);
      log.success('Estrutura da tabela relatorios_diarios:');
      colunas.forEach(col => log.info(`  - ${col}`));
      
      // Verificar se tem as colunas novas
      const colunasEsperadas = [
        'data_inicio',
        'horario_inicio',
        'rua_id',
        'metragem_feita',
        'toneladas_aplicadas',
        'espessura_calculada'
      ];
      
      const faltantes = colunasEsperadas.filter(c => !colunas.includes(c));
      
      if (faltantes.length > 0) {
        log.error(`Colunas faltantes: ${faltantes.join(', ')}`);
        log.info(`\n💡 Execute a migração: migrate_relatorios_diarios_to_new_structure.sql`);
        return false;
      }
      
      log.success('Todas as colunas esperadas estão presentes!');
      return true;
    } else {
      log.info('Tabela existe mas não há registros para verificar estrutura');
      log.info('Tentando inserir registro de teste...');
      
      return await testarInsercao();
    }
  } catch (err) {
    log.error(`Erro: ${err.message}`);
    return false;
  }
}

async function testarInsercao() {
  log.test('\nTestando inserção de registro...');
  
  try {
    // Buscar obra
    const { data: obras } = await supabase
      .from('obras')
      .select('id')
      .limit(1)
      .single();
    
    if (!obras) {
      log.error('Nenhuma obra encontrada para teste');
      return false;
    }
    
    // Tentar inserir
    const { data, error } = await supabase
      .from('relatorios_diarios')
      .insert({
        data_inicio: new Date().toISOString().split('T')[0],
        horario_inicio: '08:00',
        obra_id: obras.id,
        metragem_feita: 100,
        toneladas_aplicadas: 50
      })
      .select()
      .single();
    
    if (error) {
      log.error(`Erro ao inserir: ${error.message}`);
      
      if (error.code === 'PGRST204') {
        log.info(`\n💡 A coluna não existe no schema.`);
        log.info(`Execute a migração: migrate_relatorios_diarios_to_new_structure.sql`);
      }
      
      return false;
    }
    
    log.success('✅ Registro inserido com sucesso!');
    log.info(`Dados: ${JSON.stringify(data, null, 2)}`);
    
    // Limpar
    await supabase
      .from('relatorios_diarios')
      .delete()
      .eq('id', data.id);
    
    return true;
    
  } catch (err) {
    log.error(`Erro: ${err.message}`);
    return false;
  }
}

async function main() {
  log.info('\n🧪 INICIANDO TESTES DE MIGRAÇÃO\n');
  
  const resultado = await verificarEstrutura();
  
  log.info('\n========================================');
  log.info('RESULTADO');
  log.info('========================================');
  
  if (resultado) {
    log.success('\n✅ A estrutura está correta!');
    log.info('Você pode prosseguir com os testes.');
  } else {
    log.error('\n❌ A estrutura precisa ser migrada');
    log.info('\n📝 Próximos passos:');
    log.info('1. Execute: migrate_relatorios_diarios_to_new_structure.sql');
    log.info('2. Execute novamente: node scripts/testing/test-migracao-final.js');
  }
}

main().catch(console.error);


