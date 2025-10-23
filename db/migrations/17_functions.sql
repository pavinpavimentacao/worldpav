-- =====================================================
-- WORLDPAV - FUNCTIONS SQL AUXILIARES
-- =====================================================
-- Functions auxiliares para cálculos e operações
--
-- DEPENDÊNCIAS: Todas as tabelas devem estar criadas
-- =====================================================

-- =====================================================
-- 1. SOFT DELETE GENÉRICO
-- =====================================================

CREATE OR REPLACE FUNCTION public.soft_delete_record(
  p_table_name TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_sql TEXT;
BEGIN
  v_sql := format(
    'UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    p_table_name
  );
  
  EXECUTE v_sql USING p_record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.soft_delete_record(TEXT, UUID) 
  IS 'Soft delete genérico para qualquer tabela';

-- =====================================================
-- 2. CALCULAR RENTABILIDADE DE OBRA
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_obra_rentability(p_obra_id UUID)
RETURNS TABLE (
  receitas DECIMAL,
  despesas DECIMAL,
  saldo DECIMAL,
  rentabilidade_percentual DECIMAL
) AS $$
DECLARE
  v_receitas DECIMAL;
  v_despesas DECIMAL;
  v_contract_value DECIMAL;
BEGIN
  -- Buscar valor contratual
  SELECT contract_value INTO v_contract_value
  FROM public.obras
  WHERE id = p_obra_id;
  
  -- Calcular receitas
  SELECT COALESCE(SUM(amount), 0) INTO v_receitas
  FROM public.obras_financeiro
  WHERE obra_id = p_obra_id 
    AND type = 'receita'
    AND deleted_at IS NULL;
  
  -- Calcular despesas
  SELECT COALESCE(SUM(amount), 0) INTO v_despesas
  FROM public.obras_financeiro
  WHERE obra_id = p_obra_id 
    AND type = 'despesa'
    AND deleted_at IS NULL;
  
  -- Adicionar pagamentos diretos às despesas
  v_despesas := v_despesas + COALESCE((
    SELECT SUM(amount)
    FROM public.obras_pagamentos_diretos
    WHERE obra_id = p_obra_id 
      AND deleted_at IS NULL
  ), 0);
  
  -- Retornar resultado
  RETURN QUERY SELECT 
    v_receitas,
    v_despesas,
    v_receitas - v_despesas AS saldo,
    CASE 
      WHEN v_contract_value > 0 THEN 
        ((v_receitas - v_despesas) / v_contract_value) * 100
      ELSE 0
    END AS rentabilidade_percentual;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_obra_rentability(UUID) 
  IS 'Calcula rentabilidade completa de uma obra';

-- =====================================================
-- 3. CALCULAR CONSUMO DE DIESEL
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_diesel_consumption(
  p_maquinario_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_liters DECIMAL,
  total_amount DECIMAL,
  average_price_per_liter DECIMAL,
  abastecimentos_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(liters), 0) AS total_liters,
    COALESCE(SUM(total_amount), 0) AS total_amount,
    CASE 
      WHEN SUM(liters) > 0 THEN SUM(total_amount) / SUM(liters)
      ELSE 0
    END AS average_price_per_liter,
    COUNT(*)::INTEGER AS abastecimentos_count
  FROM public.maquinarios_diesel
  WHERE maquinario_id = p_maquinario_id
    AND date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_diesel_consumption(UUID, DATE, DATE) 
  IS 'Calcula consumo de diesel de um maquinário em um período';

-- =====================================================
-- 4. CALCULAR TOTAL DE HORAS EXTRAS
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_horas_extras_total(
  p_colaborador_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS TABLE (
  total_horas INTEGER,
  total_valor DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(horas_extras), 0)::INTEGER AS total_horas,
    COALESCE(SUM(total_horas_extras), 0) AS total_valor
  FROM public.controle_diario_diarias
  WHERE colaborador_id = p_colaborador_id
    AND EXTRACT(MONTH FROM date) = p_month
    AND EXTRACT(YEAR FROM date) = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_horas_extras_total(UUID, INTEGER, INTEGER) 
  IS 'Calcula total de horas extras de um colaborador em um mês';

-- =====================================================
-- 5. RESUMO FINANCEIRO
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_financial_summary(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_receitas DECIMAL,
  total_despesas DECIMAL,
  saldo DECIMAL,
  contas_pagar_pendentes DECIMAL,
  contas_pagar_atrasadas DECIMAL
) AS $$
DECLARE
  v_receitas DECIMAL;
  v_despesas DECIMAL;
  v_pendentes DECIMAL;
  v_atrasadas DECIMAL;
BEGIN
  -- Receitas
  SELECT COALESCE(SUM(amount), 0) INTO v_receitas
  FROM public.financial_transactions
  WHERE company_id = p_company_id
    AND type = 'receita'
    AND date BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL;
  
  -- Despesas
  SELECT COALESCE(SUM(amount), 0) INTO v_despesas
  FROM public.financial_transactions
  WHERE company_id = p_company_id
    AND type = 'despesa'
    AND date BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL;
  
  -- Contas a pagar pendentes
  SELECT COALESCE(SUM(amount), 0) INTO v_pendentes
  FROM public.contas_pagar
  WHERE company_id = p_company_id
    AND status = 'pendente'
    AND deleted_at IS NULL;
  
  -- Contas a pagar atrasadas
  SELECT COALESCE(SUM(amount), 0) INTO v_atrasadas
  FROM public.contas_pagar
  WHERE company_id = p_company_id
    AND status = 'atrasado'
    AND deleted_at IS NULL;
  
  RETURN QUERY SELECT 
    v_receitas,
    v_despesas,
    v_receitas - v_despesas AS saldo,
    v_pendentes,
    v_atrasadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_financial_summary(UUID, DATE, DATE) 
  IS 'Retorna resumo financeiro consolidado de uma empresa';

-- =====================================================
-- 6. FUNCTION PARA OBTER OBRAS ATIVAS
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_obras_ativas(p_company_id UUID)
RETURNS TABLE (
  obra_id UUID,
  obra_name TEXT,
  client_name TEXT,
  start_date DATE,
  status status_obra,
  dias_corridos INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id AS obra_id,
    o.name AS obra_name,
    c.name AS client_name,
    o.start_date,
    o.status,
    CASE 
      WHEN o.start_date IS NOT NULL THEN 
        CURRENT_DATE - o.start_date
      ELSE 0
    END AS dias_corridos
  FROM public.obras o
  LEFT JOIN public.clients c ON o.client_id = c.id
  WHERE o.company_id = p_company_id
    AND o.status = 'andamento'
    AND o.deleted_at IS NULL
  ORDER BY o.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_obras_ativas(UUID) 
  IS 'Retorna todas as obras ativas de uma empresa';

-- =====================================================
-- FIM DO SCRIPT FUNCTIONS
-- =====================================================
-- Próximo script: 18_views.sql
-- =====================================================


