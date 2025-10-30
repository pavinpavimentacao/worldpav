/**
 * Script para corrigir as políticas RLS de maquinários
 * Executa o SQL diretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMaquinariosRLS() {
  console.log('🔧 Corrigindo políticas RLS para maquinários...\n');

  try {
    // 1. Tentar inserir um maquinário de teste usando a função RPC
    console.log('1️⃣ Tentando inserir maquinário usando função RPC...');
    
    const { data: maquinario, error: rpcError } = await supabase.rpc('insert_maquinario_bypass_rls', {
      p_name: 'Vibroacabadora CAT AP1055F',
      p_type: 'Vibroacabadora (Pavimentadora de Asfalto)',
      p_brand: 'Caterpillar',
      p_model: 'AP1055F',
      p_plate: 'ABC-1234',
      p_year: 2020,
      p_status: 'ativo',
      p_observations: 'Equipamento principal para pavimentação de vias urbanas',
      p_company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345'
    });

    if (rpcError) {
      console.error('❌ Erro ao inserir via RPC:', rpcError.message);
      console.log('\n⚠️ A função RPC ainda não foi criada.');
      console.log('\n📋 INSTRUÇÕES:');
      console.log('1. Abra o painel do Supabase: https://supabase.com/dashboard');
      console.log('2. Selecione seu projeto');
      console.log('3. Vá em SQL Editor');
      console.log('4. Cole e execute o conteúdo do arquivo:');
      console.log('   db/migrations/fix_maquinarios_rls.sql');
      console.log('\n5. Após executar o SQL, rode este script novamente\n');
      return;
    }

    console.log('✅ Maquinário inserido com sucesso via RPC!');
    console.log('📋 Dados do maquinário:', JSON.stringify(maquinario, null, 2));

    // 2. Verificar se conseguimos buscar o maquinário
    console.log('\n2️⃣ Verificando se conseguimos buscar o maquinário...');
    const { data: maquinarios, error: selectError } = await supabase
      .from('maquinarios')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ Erro ao buscar maquinários:', selectError.message);
    } else {
      console.log(`✅ Maquinários encontrados: ${maquinarios?.length || 0}`);
      maquinarios?.forEach(maq => {
        console.log(`   - ${maq.name} (${maq.type || 'Tipo não especificado'})`);
      });
    }

    console.log('\n🎉 Políticas RLS corrigidas com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  }
}

// Executar
fixMaquinariosRLS()
  .then(() => {
    console.log('\n✨ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });

