# 🚀 Instruções para Executar Migration de Turno Diurno/Noturno

## ⚠️ IMPORTANTE
A migration `04f_add_turno_diurno_noturno_horas_extras.sql` **DEVE** ser executada no Supabase antes de usar os turnos "Diurno" e "Noturno".

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- Acesse: https://supabase.com/dashboard
- Selecione seu projeto

### 2. Abra o SQL Editor
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### 3. Execute a Migration
Copie e cole o conteúdo do arquivo:
```
worldpav/db/migrations/04f_add_turno_diurno_noturno_horas_extras.sql
```

Ou execute diretamente este SQL:

```sql
-- Adicionar novos valores ao ENUM (se não existirem)
DO $$ 
BEGIN
  -- Adicionar 'diurno' se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'diurno' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_dia_hora_extra')
  ) THEN
    ALTER TYPE tipo_dia_hora_extra ADD VALUE 'diurno';
  END IF;

  -- Adicionar 'noturno' se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'noturno' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_dia_hora_extra')
  ) THEN
    ALTER TYPE tipo_dia_hora_extra ADD VALUE 'noturno';
  END IF;
END $$;

-- Atualizar comentário da coluna
COMMENT ON COLUMN public.colaboradores_horas_extras.tipo_dia IS 
  'Tipo de dia/turno: normal (50%), sabado (50%), domingo (100%), feriado (100%), diurno (50%), noturno (50% - turno 20h às 05h)';
```

### 4. Execute o SQL
- Clique no botão **"Run"** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
- Aguarde a confirmação de sucesso

### 5. Verificar se Funcionou
Execute esta query para verificar:

```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_dia_hora_extra')
ORDER BY enumsortorder;
```

Você deve ver:
- `normal`
- `sabado`
- `domingo`
- `feriado`
- `diurno` ✅
- `noturno` ✅

## ✅ Após Executar
Após executar a migration, o sistema estará pronto para usar os turnos "Diurno" e "Noturno" nas horas extras.

## 🔍 Sobre o Problema de Data (UTC)
Se ainda houver problema com a data sendo salva um dia antes:

1. **Verifique os logs no console do navegador** quando salvar uma hora extra
2. Procure por: `📅 Data antes de salvar` e `📅 Data salva no banco`
3. Compare os valores - eles devem ser iguais

Se os valores forem diferentes, pode ser um problema de configuração do Supabase. Nesse caso, verifique:
- Configuração de timezone do banco de dados
- Se há alguma trigger ou função que está alterando a data

