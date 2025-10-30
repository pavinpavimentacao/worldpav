import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTQ5MjAwMCwiZXhwIjoxOTU1MDY4MDAwfQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
  console.log('🔍 Testando migração da tabela equipes...\n');
  
  try {
    // 1. Verificar se a tabela equipes existe
    console.log('1️⃣ Verificando se a tabela equipes existe...');
    const { data: equipes, error: equipesError } = await supabase
      .from('equipes')
      .select('*')
      .limit(5);
      
    if (equipesError) {
      console.error('❌ Erro ao buscar equipes:', equipesError.message);
      console.log('💡 A tabela equipes pode não ter sido criada ainda.');
      return;
    }
    
    console.log('✅ Tabela equipes existe!');
    console.log(`📊 Equipes encontradas: ${equipes?.length || 0}`);
    if (equipes && equipes.length > 0) {
      console.log('📋 Primeiras equipes:');
      equipes.forEach((eq, i) => {
        console.log(`   ${i + 1}. ${eq.name} (ID: ${eq.id})`);
      });
    }
    
    // 2. Verificar se colaboradores têm equipe_id
    console.log('\n2️⃣ Verificando colaboradores com equipe_id...');
    const { data: colaboradores, error: colError } = await supabase
      .from('colaboradores')
      .select('id, name, equipe_id, tipo_equipe')
      .not('equipe_id', 'is', null)
      .limit(5);
      
    if (colError) {
      console.error('❌ Erro ao buscar colaboradores:', colError.message);
    } else {
      console.log(`✅ Colaboradores com equipe_id: ${colaboradores?.length || 0}`);
      if (colaboradores && colaboradores.length > 0) {
        console.log('📋 Colaboradores vinculados:');
        colaboradores.forEach((col, i) => {
          console.log(`   ${i + 1}. ${col.name} → Equipe ID: ${col.equipe_id} (tipo: ${col.tipo_equipe})`);
        });
      }
    }
    
    // 3. Verificar relatórios diários
    console.log('\n3️⃣ Verificando relatórios diários...');
    const { data: relatorios, error: relError } = await supabase
      .from('relatorios_diarios')
      .select('id, equipe_id, equipe_is_terceira')
      .limit(5);
      
    if (relError) {
      console.error('❌ Erro ao buscar relatórios:', relError.message);
    } else {
      console.log(`✅ Relatórios encontrados: ${relatorios?.length || 0}`);
      if (relatorios && relatorios.length > 0) {
        console.log('📋 Relatórios:');
        relatorios.forEach((rel, i) => {
          console.log(`   ${i + 1}. ID: ${rel.id} → Equipe ID: ${rel.equipe_id} (terceira: ${rel.equipe_is_terceira})`);
        });
      }
    }
    
    // 4. Se não há equipes, criar algumas de exemplo
    if (!equipes || equipes.length === 0) {
      console.log('\n4️⃣ Criando equipes de exemplo...');
      
      const equipesExemplo = [
        { name: 'Equipe de Pavimentação', prefixo: 'PAV', descricao: 'Equipe responsável pela pavimentação' },
        { name: 'Equipe de Máquinas', prefixo: 'MAQ', descricao: 'Equipe responsável pelos equipamentos' },
        { name: 'Equipe de Apoio', prefixo: 'APO', descricao: 'Equipe de apoio geral' }
      ];
      
      const companyId = '39cf8b61-6737-4aa5-af3f-51fba9f12345'; // Company ID padrão
      
      for (const equipe of equipesExemplo) {
        const { data: novaEquipe, error: insertError } = await supabase
          .from('equipes')
          .insert([{ ...equipe, company_id: companyId }])
          .select()
          .single();
          
        if (insertError) {
          console.error(`❌ Erro ao criar equipe ${equipe.name}:`, insertError.message);
        } else {
          console.log(`✅ Equipe criada: ${novaEquipe.name} (ID: ${novaEquipe.id})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testMigration();
