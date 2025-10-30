import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarMaquinarios() {
  console.log('🔍 Testando acesso à página de maquinários...');
  
  try {
    // Testar se a tabela maquinarios existe e tem dados
    console.log('📋 Verificando tabela maquinarios...');
    const { data: maquinarios, error } = await supabase
      .from('maquinarios')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao acessar tabela maquinarios:', error.message);
      return;
    }

    console.log('✅ Tabela maquinarios acessível!');
    console.log(`📊 Encontrados ${maquinarios.length} maquinários:`);
    
    maquinarios.forEach((maq, index) => {
      console.log(`  ${index + 1}. ${maq.name} (${maq.status}) - ${maq.type || 'Sem tipo'}`);
    });

    // Testar se há maquinários ativos
    const { data: ativos, error: ativosError } = await supabase
      .from('maquinarios')
      .select('*')
      .eq('status', 'ativo')
      .is('deleted_at', null);

    if (ativosError) {
      console.error('❌ Erro ao buscar maquinários ativos:', ativosError.message);
    } else {
      console.log(`\n✅ Maquinários ativos: ${ativos.length}`);
    }

    // Testar inserção de um maquinário de teste
    console.log('\n🧪 Testando inserção de maquinário...');
    const testMaquinario = {
      name: 'Teste Maquinário API',
      type: 'Vibroacabadora',
      status: 'ativo',
      company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345',
      observations: 'Teste de API'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('maquinarios')
      .insert([testMaquinario])
      .select();

    if (insertError) {
      console.log('❌ Erro ao inserir maquinário de teste:', insertError.message);
    } else {
      console.log('✅ Inserção de teste bem-sucedida!');
      console.log('Dados inseridos:', insertResult[0]);
      
      // Limpar dados de teste
      await supabase
        .from('maquinarios')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('🧹 Dados de teste removidos');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarMaquinarios();

