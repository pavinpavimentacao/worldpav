#!/usr/bin/env node

/**
 * Script para criar as tabelas de obras no Supabase
 * Este script aplica as migrações diretamente via SQL
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://rgsovlqsezjeqohlbyod.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc292bHFzZXpqZXFvaGxieW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2Mzk1ODksImV4cCI6MjA3NDIxNTU4OX0.od07D8mGwg-nYC5-QzzBledOl2FciqxDR5S0Ut8Ah8k';

const supabase = createClient(supabaseUrl, supabaseKey);

// SQLs para criar as tabelas
const migrations = [
  {
    name: 'Criar tabela obras',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
        client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'planejamento',
        start_date DATE,
        expected_end_date DATE,
        end_date DATE,
        contract_value DECIMAL(15, 2),
        executed_value DECIMAL(15, 2) DEFAULT 0,
        location TEXT,
        city TEXT,
        state TEXT,
        observations TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT obras_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
      );
    `
  },
  {
    name: 'Criar tabela obras_ruas',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_ruas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        length DECIMAL(10, 2),
        width DECIMAL(10, 2),
        area DECIMAL(12, 2),
        metragem_planejada DECIMAL(10, 2),
        toneladas_planejadas DECIMAL(10, 2),
        status TEXT NOT NULL DEFAULT 'planejada',
        start_date DATE,
        end_date DATE,
        ordem INTEGER NOT NULL DEFAULT 0,
        observations TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMPTZ
      );
    `
  },
  {
    name: 'Criar tabela obras_financeiro_faturamentos',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_financeiro_faturamentos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE CASCADE,
        metragem_executada DECIMAL(10, 2) NOT NULL,
        toneladas_utilizadas DECIMAL(10, 2) NOT NULL,
        espessura_calculada DECIMAL(10, 2) NOT NULL,
        preco_por_m2 DECIMAL(10, 2) NOT NULL,
        valor_total DECIMAL(15, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente',
        data_finalizacao DATE NOT NULL,
        data_pagamento DATE,
        nota_fiscal TEXT,
        observacoes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  },
  {
    name: 'Criar tabela obras_financeiro_despesas',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_financeiro_despesas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        categoria TEXT NOT NULL,
        descricao TEXT NOT NULL,
        valor DECIMAL(15, 2) NOT NULL,
        data_despesa DATE NOT NULL,
        observacoes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  },
  {
    name: 'Criar tabela obras_medicoes',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_medicoes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE CASCADE,
        data_medicao DATE NOT NULL,
        metragem_medida DECIMAL(10, 2) NOT NULL,
        toneladas_aplicadas DECIMAL(10, 2) NOT NULL,
        espessura_medida DECIMAL(10, 2) NOT NULL,
        observacoes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  },
  {
    name: 'Criar tabela obras_notas_fiscais',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_notas_fiscais (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        numero_nota TEXT NOT NULL,
        data_emissao DATE NOT NULL,
        data_vencimento DATE NOT NULL,
        valor DECIMAL(15, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'emitida',
        observacoes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  },
  {
    name: 'Criar tabela obras_pagamentos_diretos',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_pagamentos_diretos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        descricao TEXT NOT NULL,
        valor DECIMAL(15, 2) NOT NULL,
        data_pagamento DATE NOT NULL,
        forma_pagamento TEXT NOT NULL,
        comprovante_url TEXT,
        observacoes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  },
  {
    name: 'Criar tabela obras_servicos',
    sql: `
      CREATE TABLE IF NOT EXISTS public.obras_servicos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        descricao TEXT,
        valor DECIMAL(15, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente',
        data_inicio DATE,
        data_fim DATE,
        observacoes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `
  }
];

async function executeMigration(migration) {
  try {
    console.log(`🔄 Executando: ${migration.name}`);
    
    // Tentar executar via RPC (pode não funcionar)
    const { data, error } = await supabase.rpc('exec', { sql: migration.sql });
    
    if (error) {
      console.log(`❌ Erro ao executar ${migration.name}:`, error.message);
      console.log('💡 Você precisa executar este SQL manualmente no Supabase Dashboard:');
      console.log('📋 SQL:');
      console.log(migration.sql);
      console.log('---');
      return false;
    } else {
      console.log(`✅ ${migration.name} executada com sucesso!`);
      return true;
    }
  } catch (err) {
    console.log(`❌ Erro geral em ${migration.name}:`, err.message);
    console.log('💡 Você precisa executar este SQL manualmente no Supabase Dashboard:');
    console.log('📋 SQL:');
    console.log(migration.sql);
    console.log('---');
    return false;
  }
}

async function testTables() {
  console.log('\n🔍 Testando tabelas após migrações...');
  
  const tables = [
    'obras',
    'obras_ruas',
    'obras_financeiro_faturamentos',
    'obras_financeiro_despesas',
    'obras_medicoes',
    'obras_notas_fiscais',
    'obras_pagamentos_diretos',
    'obras_servicos'
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
  console.log('🚀 Iniciando criação das tabelas de obras...\n');
  
  let successCount = 0;
  let totalCount = migrations.length;
  
  for (const migration of migrations) {
    const success = await executeMigration(migration);
    if (success) successCount++;
    
    // Pequena pausa entre migrações
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Resumo: ${successCount}/${totalCount} migrações executadas com sucesso`);
  
  if (successCount === totalCount) {
    console.log('🎉 Todas as tabelas foram criadas com sucesso!');
    await testTables();
  } else {
    console.log('⚠️  Algumas migrações falharam. Execute os SQLs manualmente no Supabase Dashboard.');
    console.log('📋 Acesse: https://supabase.com/dashboard/project/ztcwsztsiuevwmgyfyzh/editor');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, executeMigration, testTables };
