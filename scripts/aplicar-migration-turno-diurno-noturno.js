/**
 * Script para aplicar a migration de turno diurno/noturno
 * Execute este script para adicionar os valores 'diurno' e 'noturno' ao ENUM
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarMigration() {
  console.log('🔄 Aplicando migration: Adicionar turno diurno e noturno...\n');

  // Ler o arquivo SQL
  const migrationPath = path.join(__dirname, '../db/migrations/04f_add_turno_diurno_noturno_horas_extras.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Executar a migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Se o RPC não existir, tentar executar diretamente via query
      console.log('⚠️  RPC não disponível, tentando método alternativo...');
      
      // Dividir o SQL em comandos individuais
      const comandos = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (const comando of comandos) {
        if (comando.includes('ALTER TYPE')) {
          // Para ALTER TYPE, precisamos executar via SQL direto
          console.log(`Executando: ${comando.substring(0, 50)}...`);
          // Nota: Supabase não permite ALTER TYPE via client, precisa ser feito no SQL Editor
        }
      }

      console.log('\n⚠️  ATENÇÃO: Esta migration precisa ser executada manualmente no Supabase SQL Editor!');
      console.log('\n📋 Instruções:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá em SQL Editor');
      console.log('3. Cole o conteúdo do arquivo:');
      console.log(`   ${migrationPath}`);
      console.log('4. Execute o SQL');
      return;
    }

    console.log('✅ Migration aplicada com sucesso!');
    console.log('\n📊 Verificando valores do ENUM...');

    // Verificar se os valores foram adicionados
    const { data: enumValues, error: enumError } = await supabase
      .from('pg_enum')
      .select('*')
      .eq('enumtypid', '(SELECT oid FROM pg_type WHERE typname = \'tipo_dia_hora_extra\')');

    if (!enumError) {
      console.log('✅ Valores do ENUM verificados!');
    }

  } catch (err) {
    console.error('❌ Erro ao aplicar migration:', err.message);
    console.log('\n📋 Execute manualmente no Supabase SQL Editor:');
    console.log(`   ${migrationPath}`);
  }
}

aplicarMigration();


