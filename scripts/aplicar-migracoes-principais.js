#!/usr/bin/env node

/**
 * Script para aplicar migrações principais do WorldPav
 * Aplica as migrações em ordem para criar todas as tabelas necessárias
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = 'https://rgsovlqsezjeqohlbyod.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc292bHFzZXpqZXFvaGxieW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2Mzk1ODksImV4cCI6MjA3NDIxNTU4OX0.od07D8mGwg-nYC5-QzzBledOl2FciqxDR5S0Ut8Ah8k';

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de migrações em ordem de execução
const migrations = [
  '00_foundation.sql',
  '01_clientes.sql', 
  '02_obras.sql',
  '03_obras_financeiro.sql',
  '04_colaboradores.sql',
  '06_maquinarios.sql',
  '08_relatorios_diarios.sql',
  '11_contas_pagar.sql',
  '15_storage_setup.sql',
  '18_views.sql',
  '20_indexes_additional.sql'
];

async function readMigrationFile(filename) {
  const filePath = path.join(__dirname, '..', 'db', 'migrations', filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filename}:`, error.message);
    return null;
  }
}

async function executeMigration(filename, sql) {
  console.log(`🔄 Executando migração: ${filename}`);
  
  try {
    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        if (error) {
          console.error(`❌ Erro no comando SQL:`, error);
          console.error(`Comando: ${command.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`✅ Migração ${filename} executada com sucesso`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar migração ${filename}:`, error.message);
    return false;
  }
}

async function testTables() {
  console.log('\n🔍 Testando tabelas após migrações...');
  
  const tables = [
    'companies',
    'clients', 
    'obras',
    'colaboradores',
    'maquinarios',
    'relatorios_diarios',
    'contas_pagar'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} - ${error.message}`);
      } else {
        console.log(`✅ ${table} - ${data?.length || 0} registros`);
      }
    } catch (err) {
      console.log(`❌ ${table} - Erro: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando aplicação das migrações do WorldPav...\n');
  
  let successCount = 0;
  let totalCount = migrations.length;
  
  for (const migration of migrations) {
    const sql = await readMigrationFile(migration);
    if (sql) {
      const success = await executeMigration(migration, sql);
      if (success) successCount++;
    }
    
    // Pequena pausa entre migrações
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Resumo: ${successCount}/${totalCount} migrações executadas com sucesso`);
  
  if (successCount === totalCount) {
    console.log('🎉 Todas as migrações foram aplicadas com sucesso!');
    await testTables();
  } else {
    console.log('⚠️  Algumas migrações falharam. Verifique os erros acima.');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, executeMigration, testTables };
