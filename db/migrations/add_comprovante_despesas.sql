-- Migration: Adicionar campo de comprovante/nota fiscal nas despesas de obras
-- Data: 2025-10-18
-- Descrição: Permite anexar imagens ou PDFs de notas fiscais e comprovantes às despesas

-- ============================================================================
-- Adicionar coluna comprovante_url se não existir
-- ============================================================================

-- Verificar e adicionar coluna em obras_despesas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_despesas' 
        AND column_name = 'comprovante_url'
    ) THEN
        ALTER TABLE obras_despesas 
        ADD COLUMN comprovante_url TEXT;
        
        COMMENT ON COLUMN obras_despesas.comprovante_url IS 'URL da imagem ou PDF da nota fiscal/comprovante da despesa';
    END IF;
END $$;

-- ============================================================================
-- Atualizar comentário da tabela
-- ============================================================================
COMMENT ON TABLE obras_despesas IS 'Tabela de despesas de obras - inclui suporte para anexar comprovantes';

-- ============================================================================
-- Criar índice para pesquisa de despesas com comprovante
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_obras_despesas_com_comprovante 
ON obras_despesas(obra_id) 
WHERE comprovante_url IS NOT NULL;

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
/*
O campo comprovante_url permite armazenar:
- Imagens de notas fiscais (JPG, PNG)
- PDFs de comprovantes
- Links para documentos no storage (Supabase Storage, S3, etc)

Tipos de arquivo recomendados:
- image/jpeg
- image/png  
- application/pdf

Tamanho máximo recomendado: 5MB

Exemplo de uso:
UPDATE obras_despesas 
SET comprovante_url = 'https://storage.exemplo.com/notas/nota-123.pdf'
WHERE id = 'despesa-id-aqui';

Para buscar despesas sem comprovante:
SELECT * FROM obras_despesas WHERE comprovante_url IS NULL;

Para buscar despesas com comprovante:
SELECT * FROM obras_despesas WHERE comprovante_url IS NOT NULL;
*/


