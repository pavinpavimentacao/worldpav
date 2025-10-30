import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztcwsztsiuevwmgyfyzh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y3dzenRzaXVldndtZ3lmeXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODgyMTQsImV4cCI6MjA3NTM2NDIxNH0.FuUKmSmd4Kj3HWhxNCfnGa3Q34rxvM8ZQB0YC44bQok';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarCamposProgramacao() {
  console.log('🔍 Verificando campos da tabela programacao_pavimentacao...');
  
  try {
    // Primeiro, vamos tentar buscar dados existentes para ver a estrutura
    console.log('📋 Buscando estrutura da tabela através de dados existentes...');
    const { data: existingData, error: selectError } = await supabase
      .from('programacao_pavimentacao')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Erro ao buscar dados existentes:', selectError.message);
      console.log('💡 Isso pode indicar que a tabela não existe ou não tem permissão de acesso');
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log('✅ Tabela encontrada! Campos disponíveis:');
      Object.keys(existingData[0]).forEach(campo => {
        console.log(`  - ${campo}: ${typeof existingData[0][campo]}`);
      });
    } else {
      console.log('ℹ️  Tabela vazia, vamos testar inserção para verificar campos...');
    }

    // Primeiro, vamos buscar uma obra válida para usar no teste
    console.log('\n🔍 Buscando obra válida para teste...');
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('id')
      .limit(1);

    let obraIdValida = null;
    if (obras && obras.length > 0) {
      obraIdValida = obras[0].id;
      console.log(`✅ Obra encontrada: ${obraIdValida}`);
    } else {
      console.log('⚠️  Nenhuma obra encontrada, usando null para obra_id');
    }

    // Testar inserção de dados de exemplo
    console.log('\n🧪 Testando inserção de dados...');
    const testData = {
      date: '2024-01-15',
      team: 'Equipe A',
      equipment: [],
      observations: 'Teste de verificação',
      status: 'programado',
      company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345',
      obra_id: obraIdValida, // Usar obra válida ou null
      metragem_prevista: 100.50,
      quantidade_toneladas: 5.25,
      faixa_realizar: 'faixa_1',
      rua_id: null,
      horario_inicio: '08:00',
      espessura_media_solicitada: 5.5,
      tipo_servico: 'CBUQ',
      espessura: 5.0
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('programacao_pavimentacao')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ Erro ao testar inserção:', insertError.message);
      if (insertError.message.includes('rua_id')) {
        console.log('💡 Dica: O campo rua_id pode não existir ou ter restrição de foreign key');
      }
      if (insertError.message.includes('espessura_media_solicitada')) {
        console.log('💡 Dica: O campo espessura_media_solicitada pode não existir');
      }
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      console.log('Dados inseridos:', insertResult[0]);
      
      // Limpar dados de teste
      await supabase
        .from('programacao_pavimentacao')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('🧹 Dados de teste removidos');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
verificarCamposProgramacao();
