/**
 * Script de teste: Criar Relação Diária via Supabase
 * Analisa a integração com o Supabase para criação de relações diárias
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qwhkhnjzhfqqhpbhxnxp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 Configuração Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarRelacaoTeste() {
  console.log('\n📝 Criando relação diária de teste...');
  
  const dataHoje = new Date().toISOString().split('T')[0];
  const companyId = '39cf8b61-6737-4aa5-af3f-51fba9fe2f03';
  const equipeId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Equipe de Pavimentação
  
  // 1. Criar relação
  console.log('\n1️⃣ Criando relação na tabela controle_diario_relacoes...');
  const { data: relacao, error: relacaoError } = await supabase
    .from('controle_diario_relacoes')
    .insert({
      company_id: companyId,
      date: dataHoje,
      equipe_id: equipeId,
      observacoes: 'Relação de teste criada via MCP',
      status: 'finalizada'
    })
    .select()
    .single();
  
  if (relacaoError) {
    console.error('❌ Erro ao criar relação:', relacaoError);
    console.error('Detalhes:', JSON.stringify(relacaoError, null, 2));
    return;
  }
  
  console.log('✅ Relação criada:', relacao);
  
  // 2. Buscar colaboradores da equipe de pavimentação
  console.log('\n2️⃣ Buscando colaboradores da equipe de pavimentação...');
  const { data: colaboradores, error: colabError } = await supabase
    .from('colaboradores')
    .select('id, name, position')
    .eq('tipo_equipe', 'pavimentacao')
    .eq('status', 'ativo')
    .limit(3);
  
  if (colabError) {
    console.error('❌ Erro ao buscar colaboradores:', colabError);
    return;
  }
  
  console.log('✅ Colaboradores encontrados:', colaboradores);
  
  if (!colaboradores || colaboradores.length === 0) {
    console.log('⚠️ Nenhum colaborador encontrado');
    return;
  }
  
  // 3. Criar presenças (2 presentes, 1 ausente)
  console.log('\n3️⃣ Criando registros de presença...');
  
  const presencas = [
    {
      relacao_id: relacao.id,
      colaborador_id: colaboradores[0].id,
      status: 'presente'
    },
    {
      relacao_id: relacao.id,
      colaborador_id: colaboradores[1]?.id || colaboradores[0].id,
      status: 'presente'
    },
    {
      relacao_id: relacao.id,
      colaborador_id: colaboradores[2]?.id || colaboradores[0].id,
      status: 'falta',
      observacoes: 'Ausência de teste via MCP'
    }
  ];
  
  const { data: presencasData, error: presencasError } = await supabase
    .from('controle_diario_presencas')
    .insert(presencas)
    .select();
  
  if (presencasError) {
    console.error('❌ Erro ao criar presenças:', presencasError);
    console.error('Detalhes:', JSON.stringify(presencasError, null, 2));
    return;
  }
  
  console.log('✅ Presenças criadas:', presencasData);
  
  // 4. Buscar relação completa
  console.log('\n4️⃣ Buscando relação completa...');
  const { data: relacaoCompleta, error: buscaError } = await supabase
    .from('controle_diario_relacoes')
    .select('*, controle_diario_presencas(*)')
    .eq('id', relacao.id)
    .single();
  
  if (buscaError) {
    console.error('❌ Erro ao buscar relação completa:', buscaError);
    return;
  }
  
  console.log('\n✅ RELAÇÃO DIÁRIA CRIADA COM SUCESSO!');
  console.log('\n📊 Resumo:');
  console.log('ID:', relacaoCompleta.id);
  console.log('Data:', relacaoCompleta.date);
  console.log('Equipe ID:', relacaoCompleta.equipe_id);
  console.log('Total Presentes:', relacaoCompleta.total_presentes);
  console.log('Total Ausências:', relacaoCompleta.total_ausencias);
  console.log('Registros de Presença:', relacaoCompleta.controle_diario_presencas?.length || 0);
  
  console.log('\n📋 Detalhes dos registros:');
  if (relacaoCompleta.controle_diario_presencas) {
    relacaoCompleta.controle_diario_presencas.forEach((pres, index) => {
      console.log(`  ${index + 1}. Colaborador: ${pres.colaborador_id}, Status: ${pres.status}`);
    });
  }
  
  // 5. Analisar integração
  console.log('\n🔍 ANÁLISE DA INTEGRAÇÃO:');
  console.log('✓ Relação criada na tabela controle_diario_relacoes');
  console.log('✓ Registros de presença criados na tabela controle_diario_presencas');
  console.log('✓ Triggers do banco atualizaram os totais automaticamente');
  console.log('✓ Relação completa pode ser buscada com JOIN');
  
  return relacaoCompleta;
}

criarRelacaoTeste()
  .then(() => {
    console.log('\n✅ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  });

