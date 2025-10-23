-- =====================================================
-- MIGRAÇÃO: Adicionar Tipo de Equipe e Novas Funções
-- Data: 2025-10-09
-- Descrição: Adiciona campo tipo_equipe e atualiza enum de funções
--            para suportar Equipe de Massa e Equipe Administrativa
-- =====================================================

-- PASSO 1: Criar o novo ENUM para tipo de equipe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_equipe_enum') THEN
        CREATE TYPE tipo_equipe_enum AS ENUM ('massa', 'administrativa');
    END IF;
END $$;

-- PASSO 2: Remover o ENUM antigo e criar o novo com todas as funções
-- Primeiro, precisamos alterar temporariamente a coluna para text
ALTER TABLE colaboradores 
ALTER COLUMN funcao TYPE text;

-- Remover o enum antigo se existir
DROP TYPE IF EXISTS funcao_colaborador_enum CASCADE;

-- Criar o novo ENUM com todas as funções
CREATE TYPE funcao_colaborador_enum AS ENUM (
    -- Equipe de Massa (Operacional)
    'Ajudante',
    'Rasteleiro',
    'Operador de Rolo Chapa Chapa',
    'Operador de Rolo Pneu Pneu',
    'Operador de VibroAcabadora',
    'Operador de Mesa da VibroAcabadora',
    'Motorista de Caminhão Espargidor',
    'Mangueirista',
    'Encarregado',
    -- Equipe Administrativa
    'Financeiro',
    'RH',
    'Programador',
    'Admin',
    -- Funções adicionais
    'Administrador Financeiro',
    'Fiscal de Obras',
    'Mecânico'
);

-- PASSO 3: Adicionar a coluna tipo_equipe (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'colaboradores' 
        AND column_name = 'tipo_equipe'
    ) THEN
        ALTER TABLE colaboradores 
        ADD COLUMN tipo_equipe tipo_equipe_enum;
    END IF;
END $$;

-- PASSO 4: Atualizar dados existentes com valores padrão baseado na função antiga
UPDATE colaboradores
SET tipo_equipe = CASE
    WHEN funcao IN ('Programador', 'Administrador Financeiro', 'Admin') THEN 'administrativa'::tipo_equipe_enum
    ELSE 'massa'::tipo_equipe_enum
END
WHERE tipo_equipe IS NULL;

-- PASSO 5: Converter a coluna funcao de volta para o novo ENUM
-- Primeiro atualizar os valores antigos para os novos (mapeamento)
UPDATE colaboradores
SET funcao = CASE
    WHEN funcao = 'Administrador Financeiro' THEN 'Financeiro'
    ELSE funcao
END;

-- Agora converter a coluna para o novo ENUM
ALTER TABLE colaboradores 
ALTER COLUMN funcao TYPE funcao_colaborador_enum 
USING funcao::funcao_colaborador_enum;

-- PASSO 6: Tornar o campo tipo_equipe obrigatório
ALTER TABLE colaboradores 
ALTER COLUMN tipo_equipe SET NOT NULL;

-- PASSO 7: Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_tipo_equipe 
ON colaboradores(tipo_equipe);

CREATE INDEX IF NOT EXISTS idx_colaboradores_funcao 
ON colaboradores(funcao);

CREATE INDEX IF NOT EXISTS idx_colaboradores_tipo_equipe_funcao 
ON colaboradores(tipo_equipe, funcao);

-- PASSO 8: Adicionar comentários para documentação
COMMENT ON COLUMN colaboradores.tipo_equipe IS 
'Tipo de equipe do colaborador: massa (operacional) ou administrativa';

COMMENT ON COLUMN colaboradores.funcao IS 
'Função específica do colaborador dentro da sua equipe';

-- PASSO 9: Criar função para validar tipo_equipe baseado na função
CREATE OR REPLACE FUNCTION validate_tipo_equipe_funcao()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar se a função está de acordo com o tipo de equipe
    IF NEW.tipo_equipe = 'massa' THEN
        IF NEW.funcao NOT IN (
            'Ajudante',
            'Rasteleiro',
            'Operador de Rolo Chapa Chapa',
            'Operador de Rolo Pneu Pneu',
            'Operador de VibroAcabadora',
            'Operador de Mesa da VibroAcabadora',
            'Motorista de Caminhão Espargidor',
            'Mangueirista',
            'Encarregado',
            'Fiscal de Obras',
            'Mecânico'
        ) THEN
            RAISE EXCEPTION 'Função % não é válida para equipe de massa', NEW.funcao;
        END IF;
    ELSIF NEW.tipo_equipe = 'administrativa' THEN
        IF NEW.funcao NOT IN (
            'Financeiro',
            'RH',
            'Programador',
            'Admin',
            'Administrador Financeiro'
        ) THEN
            RAISE EXCEPTION 'Função % não é válida para equipe administrativa', NEW.funcao;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 10: Criar trigger para validação
DROP TRIGGER IF EXISTS trg_validate_tipo_equipe_funcao ON colaboradores;
CREATE TRIGGER trg_validate_tipo_equipe_funcao
    BEFORE INSERT OR UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION validate_tipo_equipe_funcao();

-- PASSO 11: Atualizar políticas RLS (se necessário)
-- As políticas RLS existentes devem continuar funcionando
-- Mas vamos garantir que estão ativas

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

-- Recriar políticas básicas caso não existam
DO $$ 
BEGIN
    -- Política de SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'colaboradores' 
        AND policyname = 'Users can view colaboradores from their company'
    ) THEN
        CREATE POLICY "Users can view colaboradores from their company"
            ON colaboradores FOR SELECT
            USING (
                company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            );
    END IF;

    -- Política de INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'colaboradores' 
        AND policyname = 'Users can insert colaboradores for their company'
    ) THEN
        CREATE POLICY "Users can insert colaboradores for their company"
            ON colaboradores FOR INSERT
            WITH CHECK (
                company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            );
    END IF;

    -- Política de UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'colaboradores' 
        AND policyname = 'Users can update colaboradores from their company'
    ) THEN
        CREATE POLICY "Users can update colaboradores from their company"
            ON colaboradores FOR UPDATE
            USING (
                company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            );
    END IF;

    -- Política de DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'colaboradores' 
        AND policyname = 'Users can delete colaboradores from their company'
    ) THEN
        CREATE POLICY "Users can delete colaboradores from their company"
            ON colaboradores FOR DELETE
            USING (
                company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            );
    END IF;
END $$;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

-- VERIFICAÇÕES FINAIS
SELECT 
    'Migração concluída com sucesso!' as status,
    COUNT(*) as total_colaboradores,
    COUNT(*) FILTER (WHERE tipo_equipe = 'massa') as equipe_massa,
    COUNT(*) FILTER (WHERE tipo_equipe = 'administrativa') as equipe_administrativa
FROM colaboradores;

-- Listar funções por tipo de equipe
SELECT 
    tipo_equipe,
    funcao,
    COUNT(*) as quantidade
FROM colaboradores
GROUP BY tipo_equipe, funcao
ORDER BY tipo_equipe, funcao;


