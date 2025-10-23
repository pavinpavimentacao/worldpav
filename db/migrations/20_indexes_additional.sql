-- =====================================================
-- WORLDPAV - ÍNDICES ADICIONAIS
-- =====================================================
-- Índices compostos e otimizações extras para performance
-- 
-- Nota: Índices básicos já foram criados em cada script
-- Este script adiciona índices compostos avançados
--
-- DEPENDÊNCIAS: Todas as tabelas criadas
-- =====================================================

-- =====================================================
-- ÍNDICES COMPOSTOS - PERFORMANCE AVANÇADA
-- =====================================================

-- Obras: busca por empresa, status e cliente
CREATE INDEX IF NOT EXISTS idx_obras_company_status_client 
  ON public.obras(company_id, status, client_id) 
  WHERE deleted_at IS NULL;

-- Colaboradores: busca por empresa, status e tipo de equipe
CREATE INDEX IF NOT EXISTS idx_colaboradores_company_status_tipo 
  ON public.colaboradores(company_id, status, tipo_equipe) 
  WHERE deleted_at IS NULL;

-- Maquinários: busca por empresa e tipo
CREATE INDEX IF NOT EXISTS idx_maquinarios_company_type 
  ON public.maquinarios(company_id, type) 
  WHERE deleted_at IS NULL;

-- Financial transactions: busca por empresa, tipo e categoria
CREATE INDEX IF NOT EXISTS idx_financial_company_type_category 
  ON public.financial_transactions(company_id, type, category) 
  WHERE deleted_at IS NULL;

-- Programação: busca por empresa, data e status
CREATE INDEX IF NOT EXISTS idx_programacao_company_date_status 
  ON public.programacao_pavimentacao(company_id, date, status) 
  WHERE deleted_at IS NULL;

-- Relatórios diários: busca por empresa, obra e data
CREATE INDEX IF NOT EXISTS idx_relatorios_company_obra_date 
  ON public.relatorios_diarios(company_id, obra_id, date DESC) 
  WHERE deleted_at IS NULL;

-- Contas a pagar: busca por empresa, status e vencimento
CREATE INDEX IF NOT EXISTS idx_contas_pagar_company_status_due 
  ON public.contas_pagar(company_id, status, due_date) 
  WHERE deleted_at IS NULL;

-- =====================================================
-- ÍNDICES PARA FULL TEXT SEARCH (já criados, mas documentados aqui)
-- =====================================================

-- Os seguintes índices GIN para busca textual já foram criados:
-- - idx_clients_name (clients.name)
-- - idx_obras_name (obras.name)
-- - idx_colaboradores_name (colaboradores.name)
-- - idx_parceiros_name (parceiros.name)
-- - idx_servicos_name (servicos.name)
-- - idx_notes_content (notes.content)

-- =====================================================
-- ÍNDICES PARA OTIMIZAR JOINS
-- =====================================================

-- Otimizar join entre obras e relatórios diários
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_obra_date 
  ON public.relatorios_diarios(obra_id, date DESC);

-- Otimizar join entre obras e financeiro
CREATE INDEX IF NOT EXISTS idx_obras_financeiro_obra_date 
  ON public.obras_financeiro(obra_id, date DESC);

-- Otimizar join entre maquinários e diesel
CREATE INDEX IF NOT EXISTS idx_maquinarios_diesel_maq_date 
  ON public.maquinarios_diesel(maquinario_id, date DESC);

-- Otimizar join entre parceiros e carregamentos
CREATE INDEX IF NOT EXISTS idx_carregamentos_parceiro_date 
  ON public.carregamentos_rr2c(parceiro_id, date DESC);

-- =====================================================
-- ÍNDICES PARA AGREGAÇÕES
-- =====================================================

-- Otimizar SUM de valores financeiros por obra
CREATE INDEX IF NOT EXISTS idx_obras_financeiro_obra_type_amount 
  ON public.obras_financeiro(obra_id, type, amount) 
  WHERE deleted_at IS NULL;

-- Otimizar COUNT de programações por obra
CREATE INDEX IF NOT EXISTS idx_programacao_obra_status 
  ON public.programacao_pavimentacao(obra_id, status) 
  WHERE deleted_at IS NULL;

-- Otimizar SUM de diárias por colaborador
CREATE INDEX IF NOT EXISTS idx_controle_diarias_colaborador_date 
  ON public.controle_diario_diarias(colaborador_id, date DESC);

-- =====================================================
-- ÍNDICES PARCIAIS (FILTERED INDEXES)
-- =====================================================

-- Apenas obras ativas
CREATE INDEX IF NOT EXISTS idx_obras_active_only 
  ON public.obras(company_id, status) 
  WHERE deleted_at IS NULL AND status = 'andamento';

-- Apenas colaboradores ativos
CREATE INDEX IF NOT EXISTS idx_colaboradores_active_only 
  ON public.colaboradores(company_id) 
  WHERE deleted_at IS NULL AND status = 'ativo';

-- Apenas maquinários operacionais
CREATE INDEX IF NOT EXISTS idx_maquinarios_operational 
  ON public.maquinarios(company_id) 
  WHERE deleted_at IS NULL AND status IN ('ativo', 'manutencao');

-- Apenas contas a pagar em aberto
CREATE INDEX IF NOT EXISTS idx_contas_pagar_open 
  ON public.contas_pagar(company_id, due_date) 
  WHERE deleted_at IS NULL AND status IN ('pendente', 'atrasado');

-- =====================================================
-- ANÁLISE DE PERFORMANCE
-- =====================================================

-- Comando para analisar todas as tabelas (executar após inserir dados)
-- ANALYZE public.companies;
-- ANALYZE public.profiles;
-- ANALYZE public.clients;
-- ANALYZE public.obras;
-- ANALYZE public.colaboradores;
-- ANALYZE public.maquinarios;
-- ... etc

-- =====================================================
-- FIM DO SCRIPT INDEXES ADICIONAIS
-- =====================================================
-- Próximo script: 21_seed_data.sql
-- =====================================================


