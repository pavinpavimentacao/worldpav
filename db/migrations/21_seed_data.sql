-- =====================================================
-- WORLDPAV - SEED DATA (DADOS INICIAIS)
-- =====================================================
-- Dados iniciais para teste e desenvolvimento
-- 
-- ATENÇÃO: Este script é OPCIONAL e deve ser usado 
-- apenas em ambientes de desenvolvimento/teste
--
-- NÃO EXECUTAR EM PRODUÇÃO!
-- =====================================================

-- =====================================================
-- 1. EMPRESAS WORLDPAV E PAVIN
-- =====================================================

-- Inserir empresa WorldPav (apenas se não existir)
INSERT INTO public.companies (
  name,
  cnpj,
  email,
  phone,
  city,
  state
) 
SELECT 
  'WorldPav',
  '12.345.678/0001-90',
  'contato@worldpav.com.br',
  '(11) 99999-9999',
  'São Paulo',
  'SP'
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies WHERE name = 'WorldPav'
);

-- Inserir empresa Pavin (apenas se não existir)
INSERT INTO public.companies (
  name,
  cnpj,
  email,
  phone,
  city,
  state
) 
SELECT 
  'Pavin',
  '98.765.432/0001-11',
  'contato@pavin.com.br',
  '(11) 88888-8888',
  'São Paulo',
  'SP'
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies WHERE name = 'Pavin'
);

-- Armazenar os IDs das empresas para uso posterior
-- (Em ambiente real, você precisará capturar estes IDs)

-- =====================================================
-- 2. USUÁRIO ADMIN DE TESTE
-- =====================================================

-- Nota: O usuário deve ser criado primeiro via Supabase Auth
-- Este script apenas cria o profile
-- 
-- Para criar o usuário, use o Supabase Dashboard:
-- Authentication > Users > Add User
-- Email: admin@worldpav-teste.com.br
-- Password: (defina uma senha forte)
--
-- Depois, execute este INSERT substituindo o UUID:

/*
INSERT INTO public.profiles (
  id, -- UUID do auth.users
  company_id, -- UUID da empresa criada acima
  name,
  role,
  phone
) VALUES (
  'UUID_DO_AUTH_USERS_AQUI',
  'UUID_DA_EMPRESA_AQUI',
  'Administrador Teste',
  'admin',
  '(11) 98765-4321'
);
*/

-- =====================================================
-- 3. CLIENTES DE TESTE
-- =====================================================

-- Clientes para WorldPav (apenas se não existir)
INSERT INTO public.clients (
  company_id,
  name,
  cpf_cnpj,
  email,
  phone,
  city,
  state
) 
SELECT 
  c.id,
  'Prefeitura Municipal de São Paulo',
  '12.345.678/0001-00',
  'contato@prefeitura.sp.gov.br',
  '(11) 3333-4444',
  'São Paulo',
  'SP'
FROM public.companies c 
WHERE c.name = 'WorldPav'
  AND NOT EXISTS (
    SELECT 1 FROM public.clients cl 
    WHERE cl.company_id = c.id 
      AND cl.name = 'Prefeitura Municipal de São Paulo'
  );

-- Clientes para Pavin (apenas se não existir)
INSERT INTO public.clients (
  company_id,
  name,
  cpf_cnpj,
  email,
  phone,
  city,
  state
) 
SELECT 
  c.id,
  'Construtora ABC Ltda',
  '98.765.432/0001-11',
  'obras@construtorabc.com.br',
  '(11) 9999-8888',
  'São Paulo',
  'SP'
FROM public.companies c 
WHERE c.name = 'Pavin'
  AND NOT EXISTS (
    SELECT 1 FROM public.clients cl 
    WHERE cl.company_id = c.id 
      AND cl.name = 'Construtora ABC Ltda'
  );

-- =====================================================
-- 4. CATEGORIAS PADRÃO PARA FINANCEIRO
-- =====================================================

-- As categorias são armazenadas como TEXT, não como tabela separada
-- Sugestões de categorias:
-- 
-- Receitas:
-- - Faturamento de Obra
-- - Medição
-- - Serviços Prestados
-- 
-- Despesas:
-- - Folha de Pagamento
-- - Combustível
-- - Manutenção
-- - Materiais
-- - Aluguel de Equipamentos
-- - Impostos
-- - Administrativo

-- =====================================================
-- 5. SERVIÇOS PADRÃO
-- =====================================================

-- Serviços para WorldPav (apenas se não existir)
INSERT INTO public.servicos (
  company_id,
  name,
  description,
  unit,
  unit_price,
  category,
  status
) 
SELECT 
  c.id,
  'Pavimentação CBUQ',
  'Pavimentação com Concreto Betuminoso Usinado a Quente',
  'm²',
  85.00,
  'Pavimentação',
  'ativo'
FROM public.companies c 
WHERE c.name = 'WorldPav'
  AND NOT EXISTS (
    SELECT 1 FROM public.servicos s 
    WHERE s.company_id = c.id 
      AND s.name = 'Pavimentação CBUQ'
  );

INSERT INTO public.servicos (
  company_id,
  name,
  description,
  unit,
  unit_price,
  category,
  status
) 
SELECT 
  c.id,
  'Fresagem de Pavimento',
  'Fresagem de pavimento asfáltico existente',
  'm²',
  45.00,
  'Preparação',
  'ativo'
FROM public.companies c 
WHERE c.name = 'WorldPav'
  AND NOT EXISTS (
    SELECT 1 FROM public.servicos s 
    WHERE s.company_id = c.id 
      AND s.name = 'Fresagem de Pavimento'
  );

-- Serviços para Pavin (apenas se não existir)
INSERT INTO public.servicos (
  company_id,
  name,
  description,
  unit,
  unit_price,
  category,
  status
) 
SELECT 
  c.id,
  'Pavimentação CBUQ',
  'Pavimentação com Concreto Betuminoso Usinado a Quente',
  'm²',
  90.00,
  'Pavimentação',
  'ativo'
FROM public.companies c 
WHERE c.name = 'Pavin'
  AND NOT EXISTS (
    SELECT 1 FROM public.servicos s 
    WHERE s.company_id = c.id 
      AND s.name = 'Pavimentação CBUQ'
  );

INSERT INTO public.servicos (
  company_id,
  name,
  description,
  unit,
  unit_price,
  category,
  status
) 
SELECT 
  c.id,
  'Imprimação',
  'Aplicação de imprimação betuminosa',
  'm²',
  12.00,
  'Preparação',
  'ativo'
FROM public.companies c 
WHERE c.name = 'Pavin'
  AND NOT EXISTS (
    SELECT 1 FROM public.servicos s 
    WHERE s.company_id = c.id 
      AND s.name = 'Imprimação'
  );

-- =====================================================
-- 6. ENUMS - VALORES ESPERADOS
-- =====================================================

-- Documentação dos valores válidos para enums:
--
-- status_obra: 'planejamento', 'andamento', 'concluida', 'cancelada'
-- status_rua: 'planejada', 'em_execucao', 'concluida'
-- tipo_equipe: 'pavimentacao', 'maquinas', 'apoio'
-- status_colaborador: 'ativo', 'inativo', 'ferias', 'afastado'
-- status_maquinario: 'ativo', 'manutencao', 'inativo'
-- tipo_licenca: 'cnh', 'alvara', 'crlv', 'outros'
-- status_documento: 'ativo', 'vencido', 'proximo_vencimento'
-- status_seguro: 'ativo', 'vencido', 'cancelado'
-- status_medicao: 'pendente', 'aprovada', 'faturada'
-- status_nota_fiscal: 'emitida', 'enviada', 'paga'
-- status_conta_pagar: 'pendente', 'pago', 'atrasado', 'cancelado'
-- tipo_transacao: 'receita', 'despesa'
-- status_transacao: 'pendente', 'confirmado', 'cancelado'
-- turno: 'manha', 'tarde', 'noite'
-- status_programacao: 'programado', 'andamento', 'concluido', 'cancelado'
-- status_relatorio: 'rascunho', 'finalizado'
-- nicho_parceiro: 'asfalto', 'brita', 'areia', 'frete', 'outros'
-- status_guarda: 'agendado', 'realizado', 'cancelado'
-- status_note: 'ativa', 'resolvida', 'arquivada'
-- prioridade_note: 'baixa', 'media', 'alta'
-- user_role: 'admin', 'manager', 'user'
-- status_controle_diario: 'rascunho', 'finalizada'
-- status_servico: 'ativo', 'inativo'

-- =====================================================
-- FIM DO SCRIPT SEED DATA
-- =====================================================
-- IMPORTANTE: Descomente e preencha os UUIDs conforme necessário
-- =====================================================

