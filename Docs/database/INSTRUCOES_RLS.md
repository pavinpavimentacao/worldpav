# 🔧 INSTRUÇÕES PARA CORRIGIR PROBLEMA DE RLS E FOREIGN KEY

## ❌ Problemas Identificados
1. **RLS (Row Level Security)** bloqueando leitura e inserção
2. **Foreign Key Constraint** - company_id não existe na tabela companies

## ✅ Solução Completa

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/project/ztcwsztsiuevwmgyfyzh
- Navegue para: **SQL Editor**

### 2. Execute estes comandos SQL:

```sql
-- 1. Limpar empresas existentes e criar apenas Worldpav e Pavin
DELETE FROM public.companies WHERE id IN (
  '39cf8b61-6737-4aa5-af3f-51fba9f12345',
  '48cf8b61-6737-4aa5-af3f-51fba9f12346'
);

-- Inserir Worldpav
INSERT INTO public.companies (id, name, created_at, updated_at) 
VALUES ('39cf8b61-6737-4aa5-af3f-51fba9f12345', 'Worldpav', NOW(), NOW());

-- Inserir Pavin
INSERT INTO public.companies (id, name, created_at, updated_at) 
VALUES ('48cf8b61-6737-4aa5-af3f-51fba9f12346', 'Pavin', NOW(), NOW());

-- 2. Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE public.colaboradores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se foi criada a empresa
SELECT id, name, cnpj, created_at 
FROM public.companies 
WHERE id = '39cf8b61-6737-4aa5-af3f-51fba9f12345';

-- 4. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('colaboradores', 'companies') AND schemaname = 'public';
```

### 3. Verificar se funcionou
- A empresa deve aparecer na consulta
- O RLS deve mostrar `rowsecurity = false`
- Agora tente criar um novo colaborador no frontend

## ⚠️ IMPORTANTE
- **Esta é uma solução temporária para desenvolvimento**
- **NÃO usar em produção sem configurar RLS adequadamente**
- **Em produção, configure RLS com políticas corretas**

## 🔄 Para Reabilitar RLS (quando necessário)
```sql
-- Reabilitar RLS
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
```

## 📋 Próximos Passos
1. Execute o SQL acima
2. Teste criar um colaborador
3. Verifique se aparece na listagem
4. Configure RLS adequadamente para produção

## ❌ Problemas Identificados
1. **RLS (Row Level Security)** bloqueando leitura e inserção
2. **Foreign Key Constraint** - company_id não existe na tabela companies

## ✅ Solução Completa

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/project/ztcwsztsiuevwmgyfyzh
- Navegue para: **SQL Editor**

### 2. Execute estes comandos SQL:

```sql
-- 1. Limpar empresas existentes e criar apenas Worldpav e Pavin
DELETE FROM public.companies WHERE id IN (
  '39cf8b61-6737-4aa5-af3f-51fba9f12345',
  '48cf8b61-6737-4aa5-af3f-51fba9f12346'
);

-- Inserir Worldpav
INSERT INTO public.companies (id, name, created_at, updated_at) 
VALUES ('39cf8b61-6737-4aa5-af3f-51fba9f12345', 'Worldpav', NOW(), NOW());

-- Inserir Pavin
INSERT INTO public.companies (id, name, created_at, updated_at) 
VALUES ('48cf8b61-6737-4aa5-af3f-51fba9f12346', 'Pavin', NOW(), NOW());

-- 2. Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE public.colaboradores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se foi criada a empresa
SELECT id, name, cnpj, created_at 
FROM public.companies 
WHERE id = '39cf8b61-6737-4aa5-af3f-51fba9f12345';

-- 4. Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('colaboradores', 'companies') AND schemaname = 'public';
```

### 3. Verificar se funcionou
- A empresa deve aparecer na consulta
- O RLS deve mostrar `rowsecurity = false`
- Agora tente criar um novo colaborador no frontend

## ⚠️ IMPORTANTE
- **Esta é uma solução temporária para desenvolvimento**
- **NÃO usar em produção sem configurar RLS adequadamente**
- **Em produção, configure RLS com políticas corretas**

## 🔄 Para Reabilitar RLS (quando necessário)
```sql
-- Reabilitar RLS
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
```

## 📋 Próximos Passos
1. Execute o SQL acima
2. Teste criar um colaborador
3. Verifique se aparece na listagem
4. Configure RLS adequadamente para produção
