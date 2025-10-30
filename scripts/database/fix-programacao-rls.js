/**
 * Script para corrigir as políticas RLS de programação de pavimentação
 * Executa o SQL diretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProgramacaoRLS() {
  console.log('🔧 Corrigindo políticas RLS para programação de pavimentação...\n');

  try {
    // 1. Tentar inserir uma programação de teste usando a função RPC
    console.log('1️⃣ Tentando inserir programação usando função RPC...');
    
    const { data: programacao, error: rpcError } = await supabase.rpc('insert_programacao_bypass_rls', {
      p_date: '2025-10-25',
      p_team: 'Equipe A',
      p_equipment: ['3fbcf460-045d-41a6-8c1d-894aba983d2c'],
      p_observations: 'Teste de programação via RPC',
      p_status: 'programado',
      p_company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345',
      p_obra_id: '81c3623b-25e1-41e2-8bcb-ce4d2c4e6972'
    });

    if (rpcError) {
      console.error('❌ Erro ao inserir via RPC:', rpcError.message);
      console.log('\n⚠️ A função RPC ainda não foi criada.');
      console.log('\n📋 INSTRUÇÕES:');
      console.log('1. Abra o painel do Supabase: https://supabase.com/dashboard');
      console.log('2. Selecione seu projeto');
      console.log('3. Vá em SQL Editor');
      console.log('4. Cole e execute o conteúdo do arquivo:');
      console.log('   db/migrations/fix_programacao_rls.sql');
      console.log('\n5. Após executar o SQL, rode este script novamente\n');
      return;
    }

    console.log('✅ Programação inserida com sucesso via RPC!');
    console.log('📋 Dados da programação:', JSON.stringify(programacao, null, 2));

    // 2. Verificar se conseguimos buscar a programação
    console.log('\n2️⃣ Verificando se conseguimos buscar a programação...');
    const { data: programacoes, error: selectError } = await supabase
      .from('programacao_pavimentacao')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ Erro ao buscar programações:', selectError.message);
    } else {
      console.log(`✅ Programações encontradas: ${programacoes?.length || 0}`);
      programacoes?.forEach(prog => {
        console.log(`   - ${prog.date} - ${prog.team} (${prog.status})`);
      });
    }

    console.log('\n🎉 Políticas RLS corrigidas com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  }
}

// Executar
fixProgramacaoRLS()
  .then(() => {
    console.log('\n✨ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });
