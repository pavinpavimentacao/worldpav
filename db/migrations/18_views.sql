-- =====================================================
-- WORLDPAV - VIEWS PARA DASHBOARDS
-- =====================================================
-- Views otimizadas para consultas de dashboard
--
-- DEPENDÊNCIAS: Todas as tabelas devem estar criadas
-- =====================================================

-- =====================================================
-- 1. VIEW: OBRAS DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW public.v_obras_dashboard AS
SELECT 
  o.id,
  o.company_id,
  o.name AS obra_name,
  o.status,
  o.start_date,
  o.expected_end_date,
  o.end_date,
  o.contract_value,
  o.executed_value,
  c.name AS client_name,
  c.id AS client_id,
  -- Cálculos
  CASE 
    WHEN o.start_date IS NOT NULL THEN CURRENT_DATE - o.start_date
    ELSE 0
  END AS dias_corridos,
  -- Contagens relacionadas
  (SELECT COUNT(*) FROM public.obras_ruas r WHERE r.obra_id = o.id AND r.deleted_at IS NULL) AS total_ruas,
  (SELECT COUNT(*) FROM public.programacao_pavimentacao p WHERE p.obra_id = o.id AND p.deleted_at IS NULL) AS total_programacoes,
  (SELECT COUNT(*) FROM public.relatorios_diarios rd WHERE rd.obra_id = o.id AND rd.deleted_at IS NULL) AS total_relatorios
FROM public.obras o
LEFT JOIN public.clients c ON o.client_id = c.id
WHERE o.deleted_at IS NULL;

COMMENT ON VIEW public.v_obras_dashboard IS 'View otimizada para dashboard de obras';

-- =====================================================
-- 2. VIEW: FINANCIAL DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW public.v_financial_dashboard AS
SELECT 
  ft.company_id,
  DATE_TRUNC('month', ft.date) AS month,
  ft.type,
  SUM(ft.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  AVG(ft.amount) AS average_amount
FROM public.financial_transactions ft
WHERE ft.deleted_at IS NULL
GROUP BY ft.company_id, DATE_TRUNC('month', ft.date), ft.type;

COMMENT ON VIEW public.v_financial_dashboard IS 'Resumo financeiro por mês e tipo';

-- =====================================================
-- 3. VIEW: COLABORADORES ATIVOS
-- =====================================================

CREATE OR REPLACE VIEW public.v_colaboradores_active AS
SELECT 
  col.id,
  col.company_id,
  col.name,
  col.cpf,
  col.position,
  col.tipo_equipe,
  col.status,
  col.hire_date,
  col.photo_url,
  -- Tempo de empresa em dias
  CASE 
    WHEN col.hire_date IS NOT NULL THEN CURRENT_DATE - col.hire_date
    ELSE 0
  END AS dias_empresa,
  -- Contagem de documentos
  (SELECT COUNT(*) FROM public.colaboradores_documentos cd 
   WHERE cd.colaborador_id = col.id AND cd.deleted_at IS NULL) AS total_documentos
FROM public.colaboradores col
WHERE col.deleted_at IS NULL 
  AND col.status = 'ativo';

COMMENT ON VIEW public.v_colaboradores_active IS 'Colaboradores ativos com informações agregadas';

-- =====================================================
-- 4. VIEW: MAQUINÁRIOS ATIVOS
-- =====================================================

CREATE OR REPLACE VIEW public.v_maquinarios_active AS
SELECT 
  m.id,
  m.company_id,
  m.name,
  m.type,
  m.brand,
  m.model,
  m.plate,
  m.year,
  m.status,
  -- Seguros ativos
  (SELECT COUNT(*) FROM public.maquinarios_seguros ms 
   WHERE ms.maquinario_id = m.id 
     AND ms.status = 'ativo' 
     AND ms.deleted_at IS NULL) AS seguros_ativos,
  -- Licenças ativas
  (SELECT COUNT(*) FROM public.maquinarios_licencas ml 
   WHERE ml.maquinario_id = m.id 
     AND ml.status = 'ativo' 
     AND ml.deleted_at IS NULL) AS licencas_ativas,
  -- Total de abastecimentos no mês atual
  (SELECT COUNT(*) FROM public.maquinarios_diesel md 
   WHERE md.maquinario_id = m.id 
     AND DATE_TRUNC('month', md.date) = DATE_TRUNC('month', CURRENT_DATE)) AS abastecimentos_mes
FROM public.maquinarios m
WHERE m.deleted_at IS NULL 
  AND m.status IN ('ativo', 'manutencao');

COMMENT ON VIEW public.v_maquinarios_active IS 'Maquinários ativos com informações agregadas';

-- =====================================================
-- 5. VIEW: PROGRAMAÇÃO CALENDAR
-- =====================================================

CREATE OR REPLACE VIEW public.v_programacao_calendar AS
SELECT 
  pp.id,
  pp.company_id,
  pp.date,
  pp.shift,
  pp.status,
  pp.team,
  pp.equipment,
  o.name AS obra_name,
  o.id AS obra_id,
  c.name AS client_name
FROM public.programacao_pavimentacao pp
INNER JOIN public.obras o ON pp.obra_id = o.id
LEFT JOIN public.clients c ON o.client_id = c.id
WHERE pp.deleted_at IS NULL
  AND o.deleted_at IS NULL;

COMMENT ON VIEW public.v_programacao_calendar IS 'Programação formatada para calendário';

-- =====================================================
-- 6. VIEW: CONTAS A PAGAR PENDENTES
-- =====================================================

CREATE OR REPLACE VIEW public.v_contas_pagar_pending AS
SELECT 
  cp.id,
  cp.company_id,
  cp.description,
  cp.supplier,
  cp.amount,
  cp.due_date,
  cp.status,
  o.name AS obra_name,
  -- Dias para vencimento (negativo se atrasado)
  cp.due_date - CURRENT_DATE AS dias_vencimento,
  -- Alerta
  CASE 
    WHEN cp.due_date < CURRENT_DATE THEN 'atrasado'
    WHEN cp.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'vence_em_breve'
    ELSE 'no_prazo'
  END AS alerta
FROM public.contas_pagar cp
LEFT JOIN public.obras o ON cp.obra_id = o.id
WHERE cp.deleted_at IS NULL
  AND cp.status IN ('pendente', 'atrasado')
ORDER BY cp.due_date ASC;

COMMENT ON VIEW public.v_contas_pagar_pending IS 'Contas a pagar pendentes com alertas';

-- =====================================================
-- 7. VIEW: RELATÓRIO DE CONSUMO DE DIESEL
-- =====================================================

CREATE OR REPLACE VIEW public.v_diesel_consumption_report AS
SELECT 
  md.maquinario_id,
  m.name AS maquinario_name,
  m.type AS maquinario_type,
  m.company_id,
  DATE_TRUNC('month', md.date) AS month,
  SUM(md.liters) AS total_liters,
  SUM(md.total_amount) AS total_amount,
  AVG(md.price_per_liter) AS avg_price_per_liter,
  COUNT(*) AS abastecimentos_count
FROM public.maquinarios_diesel md
INNER JOIN public.maquinarios m ON md.maquinario_id = m.id
WHERE m.deleted_at IS NULL
GROUP BY md.maquinario_id, m.name, m.type, m.company_id, DATE_TRUNC('month', md.date)
ORDER BY month DESC, total_amount DESC;

COMMENT ON VIEW public.v_diesel_consumption_report IS 'Relatório de consumo de diesel por maquinário/mês';

-- =====================================================
-- 8. VIEW: DOCUMENTOS VENCIDOS/PRÓXIMOS DO VENCIMENTO
-- =====================================================

CREATE OR REPLACE VIEW public.v_documentos_vencimento AS
SELECT 
  'colaborador' AS entity_type,
  cd.colaborador_id AS entity_id,
  col.name AS entity_name,
  cd.document_type,
  cd.expiry_date,
  cd.status::TEXT AS status,
  cd.expiry_date - CURRENT_DATE AS dias_vencimento,
  col.company_id
FROM public.colaboradores_documentos cd
INNER JOIN public.colaboradores col ON cd.colaborador_id = col.id
WHERE cd.deleted_at IS NULL
  AND cd.expiry_date IS NOT NULL
  AND cd.expiry_date <= CURRENT_DATE + INTERVAL '60 days'

UNION ALL

SELECT 
  'maquinario' AS entity_type,
  ml.maquinario_id AS entity_id,
  m.name AS entity_name,
  ml.license_type::TEXT AS document_type,
  ml.expiry_date,
  ml.status::TEXT AS status,
  ml.expiry_date - CURRENT_DATE AS dias_vencimento,
  m.company_id
FROM public.maquinarios_licencas ml
INNER JOIN public.maquinarios m ON ml.maquinario_id = m.id
WHERE ml.deleted_at IS NULL
  AND ml.expiry_date IS NOT NULL
  AND ml.expiry_date <= CURRENT_DATE + INTERVAL '60 days'

ORDER BY expiry_date ASC;

COMMENT ON VIEW public.v_documentos_vencimento IS 'Documentos vencidos ou próximos do vencimento';

-- =====================================================
-- FIM DO SCRIPT VIEWS
-- =====================================================
-- Próximo script: 20_indexes.sql (19 já tem triggers nos scripts)
-- =====================================================

