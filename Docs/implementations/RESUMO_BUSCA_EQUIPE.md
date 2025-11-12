# Correção - Busca de Informações de Equipe

## ✅ Correção Aplicada

**Arquivo:** `worldpav/src/lib/relatoriosDiariosApi.ts`

**Linhas 221-237:** Corrigida a busca de informações da equipe na listagem de relatórios.

### O que foi feito:

1. **Correção da tabela:** A tabela `equipes` não existe no sistema. As equipes são representadas por colaboradores com campo `tipo_equipe`.

2. **Busca ajustada:** 
   - Busca na tabela `colaboradores` onde `id = equipe_id`
   - Filtra apenas colaboradores ativos
   - Usa `.limit(1)` para retornar apenas o primeiro resultado

### Observação Importante:

O campo `equipe_id` nos relatórios está provavelmente NULL ou vazio na maioria dos casos, pois:
- Na programação de pavimentação, usamos apenas `prefixo_equipe` (ex: "A", "B")
- Não salvamos o UUID da equipe ao criar o relatório
- A estrutura não possui uma tabela separada de "equipes"

## 🎯 Resultado

A função agora busca corretamente na tabela `colaboradores` quando `equipe_id` existir. Para a maioria dos relatórios existentes, continuará mostrando "Equipe não informada" pois não há `equipe_id` salvo.

## 📝 Próximos Passos (Opcional)

Se desejar exibir informações de equipe:
1. Alterar a criação de relatórios para buscar e salvar o UUID da equipe
2. Criar uma tabela `equipes` separada
3. Usar o `prefixo_equipe` como informação de exibição


