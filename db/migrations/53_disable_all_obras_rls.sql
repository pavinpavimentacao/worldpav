-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- =====================================================
-- ATENÇÃO: Isto é apenas para desenvolvimento!
-- Em produção, reabilite o RLS e configure as policies corretas
-- =====================================================

-- Desabilitar RLS nas tabelas de obras (se existirem)
DO $$
BEGIN
  -- Obras
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras') THEN
    ALTER TABLE public.obras DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Ruas
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_ruas') THEN
    ALTER TABLE public.obras_ruas DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Financeiro
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_financeiro') THEN
    ALTER TABLE public.obras_financeiro DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Financeiro Faturamentos
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_financeiro_faturamentos') THEN
    ALTER TABLE public.obras_financeiro_faturamentos DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Financeiro Despesas
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_financeiro_despesas') THEN
    ALTER TABLE public.obras_financeiro_despesas DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Medições
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_medicoes') THEN
    ALTER TABLE public.obras_medicoes DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Notas Fiscais
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_notas_fiscais') THEN
    ALTER TABLE public.obras_notas_fiscais DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Obras Pagamentos Diretos
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obras_pagamentos_diretos') THEN
    ALTER TABLE public.obras_pagamentos_diretos DISABLE ROW LEVEL SECURITY;
  END IF;

  -- Maquinários Diesel
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'maquinarios_diesel') THEN
    ALTER TABLE public.maquinarios_diesel DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ RLS desabilitado em todas as tabelas de obras para desenvolvimento';
END $$;

