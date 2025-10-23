# Obras Sem Previsão - Funcionalidade Implementada

## 📋 Descrição

Implementação da funcionalidade que permite criar obras sem previsão de volume total, total de ruas e/ou toneladas previstas **de forma independente**. Isso é útil para obras onde essas informações ainda não estão disponíveis no momento da criação e serão preenchidas conforme o andamento do projeto.

## ✨ Funcionalidades

### 1. Checkboxes Independentes "Sem Previsão"

#### Volume Total Previsto
- **Localização**: Ao lado do campo "Volume Total Previsto" na seção "Unidade de Cobrança"
- **Comportamento**:
  - Quando marcado, desabilita o campo "Volume Total Previsto"
  - Exibe "Sem previsão" no campo desabilitado
  - Remove a obrigatoriedade desse campo na validação
  - Limpa o valor do campo quando marcado
  - **Independente** do checkbox de ruas

#### Total de Ruas Previstas
- **Localização**: Ao lado do campo "Total de Ruas" na seção "Planejamento da Obra"
- **Comportamento**:
  - Quando marcado, desabilita o campo "Total de Ruas"
  - Exibe "Sem previsão" no campo desabilitado
  - Remove a obrigatoriedade desse campo na validação
  - Limpa o valor do campo quando marcado
  - **Independente** dos outros checkboxes

#### Toneladas Previstas
- **Localização**: Ao lado do campo "Toneladas Previstas" na seção "Planejamento da Obra"
- **Comportamento**:
  - Quando marcado, desabilita o campo "Toneladas Previstas"
  - Exibe "Sem previsão" no campo desabilitado
  - Remove a obrigatoriedade desse campo na validação
  - Limpa o valor do campo quando marcado
  - **Independente** dos outros checkboxes

### 2. Validação Condicional

O schema de validação foi atualizado para:
- Tornar `volume_total_previsto`, `total_ruas` e `toneladas_previstas` opcionais
- Validar que `volume_total_previsto` é obrigatório apenas quando `sem_previsao_volume` NÃO está marcado
- Validar que `total_ruas` é obrigatório apenas quando `sem_previsao_ruas` NÃO está marcado
- Validar que `toneladas_previstas` é obrigatório apenas quando `sem_previsao_toneladas` NÃO está marcado
- Permitir valores zerados ou nulos quando os respectivos checkboxes estão marcados

### 3. Interface Adaptativa

#### Campos Desabilitados
- Quando "Sem Previsão Volume" está marcado:
  - Campo "Volume Total Previsto": exibe "Sem previsão" em cinza
  - Asterisco (*) de obrigatório é removido do campo
  
- Quando "Sem Previsão Ruas" está marcado:
  - Campo "Total de Ruas": exibe "Sem previsão" em cinza
  - Asterisco (*) de obrigatório é removido do campo

- Quando "Sem Previsão Toneladas" está marcado:
  - Campo "Toneladas Previstas": exibe "Sem previsão" em cinza
  - Asterisco (*) de obrigatório é removido do campo

#### Resumo da Obra
O resumo da obra mostra dinamicamente:
- Volume: "Sem previsão" (quando `sem_previsao_volume` está marcado)
- Previsão Total: "Sem previsão" em cor âmbar (quando `sem_previsao_volume` está marcado)

#### Posicionamento dos Checkboxes
- **Volume**: Checkbox compacto no canto superior direito do label, em linha com o título do campo
- **Ruas**: Checkbox compacto no canto superior direito do label, em linha com o título do campo
- **Toneladas**: Checkbox compacto no canto superior direito do label, em linha com o título do campo
- **Estilo**: Texto âmbar (`text-amber-700`) para indicar estado de "sem previsão"

## 🗄️ Alterações no Banco de Dados

### Novas Colunas
```sql
-- Coluna para indicar volume sem previsão
ALTER TABLE obras
ADD COLUMN sem_previsao_volume BOOLEAN DEFAULT FALSE;

-- Coluna para indicar ruas sem previsão
ALTER TABLE obras
ADD COLUMN sem_previsao_ruas BOOLEAN DEFAULT FALSE;

-- Coluna para indicar toneladas sem previsão
ALTER TABLE obras
ADD COLUMN sem_previsao_toneladas BOOLEAN DEFAULT FALSE;

-- Coluna para armazenar toneladas previstas
ALTER TABLE obras
ADD COLUMN toneladas_previstas DECIMAL(10, 2);
```

### Colunas Modificadas
```sql
-- Volume total previsto agora aceita NULL
ALTER TABLE obras
ALTER COLUMN volume_total_previsto DROP NOT NULL;

-- Total de ruas agora aceita NULL
ALTER TABLE obras
ALTER COLUMN total_ruas DROP NOT NULL;
```

### Índices Criados
```sql
CREATE INDEX idx_obras_sem_previsao_volume ON obras(sem_previsao_volume);
CREATE INDEX idx_obras_sem_previsao_ruas ON obras(sem_previsao_ruas);
CREATE INDEX idx_obras_sem_previsao_toneladas ON obras(sem_previsao_toneladas);
```

## 📝 Schema de Validação

```typescript
const schema = z.object({
  // ... outros campos
  volume_total_previsto: z.number().optional(),
  total_ruas: z.number().optional(),
  toneladas_previstas: z.number().optional(),
  sem_previsao_volume: z.boolean().default(false),
  sem_previsao_ruas: z.boolean().default(false),
  sem_previsao_toneladas: z.boolean().default(false),
  // ... outros campos
}).refine((data) => {
  // Se não tem previsão de volume, o volume não é obrigatório
  if (!data.sem_previsao_volume) {
    return data.volume_total_previsto && data.volume_total_previsto > 0
  }
  return true
}, {
  message: "Volume Total Previsto é obrigatório quando 'Sem Previsão' não está marcado",
  path: ["volume_total_previsto"]
}).refine((data) => {
  // Se não tem previsão de ruas, o total de ruas não é obrigatório
  if (!data.sem_previsao_ruas) {
    return data.total_ruas && data.total_ruas > 0
  }
  return true
}, {
  message: "Total de Ruas é obrigatório quando 'Sem Previsão' não está marcado",
  path: ["total_ruas"]
}).refine((data) => {
  // Se não tem previsão de toneladas, as toneladas não são obrigatórias
  if (!data.sem_previsao_toneladas) {
    return data.toneladas_previstas && data.toneladas_previstas > 0
  }
  return true
}, {
  message: "Toneladas Previstas é obrigatório quando 'Sem Previsão' não está marcado",
  path: ["toneladas_previstas"]
})
```

## 🎨 Cores e Estilos

- **Badge Âmbar** (`bg-amber-50`, `border-amber-200`, `text-amber-900`): Indica obra sem previsão
- **Campos Desabilitados** (`bg-gray-100`, `text-gray-600`): Visual de campo não editável
- **Ícone de Alerta** (`AlertTriangle`): Chama atenção para informações importantes

## 🔄 Fluxo de Uso

### Obra sem volume previsto
1. **Criar Nova Obra**
2. **Marcar checkbox "Sem previsão" ao lado de "Volume Total Previsto"**
3. **Preencher demais campos obrigatórios** (incluindo total de ruas se disponível)
4. **Salvar obra**
5. **Editar posteriormente** quando volume estiver disponível

### Obra sem ruas previstas
1. **Criar Nova Obra**
2. **Marcar checkbox "Sem previsão" ao lado de "Total de Ruas"**
3. **Preencher demais campos obrigatórios** (incluindo volume se disponível)
4. **Salvar obra**
5. **Editar posteriormente** quando total de ruas estiver disponível

### Obra sem volume NEM ruas previstas
1. **Criar Nova Obra**
2. **Marcar ambos os checkboxes "Sem previsão"**
3. **Preencher demais campos obrigatórios**
4. **Salvar obra**
5. **Editar posteriormente** quando informações estiverem disponíveis

## 📁 Arquivos Modificados

- `src/pages/obras/NovaObra.tsx`: Formulário de criação de obra
- `db/migrations/add_sem_previsao_obras.sql`: Script de migração SQL

## 🔧 Como Aplicar a Migração

1. Conecte-se ao banco de dados:
```bash
psql -U seu_usuario -d seu_banco
```

2. Execute o script de migração:
```bash
\i db/migrations/add_sem_previsao_obras.sql
```

Ou usando o Supabase Dashboard:
1. Acesse SQL Editor
2. Cole o conteúdo do arquivo `add_sem_previsao_obras.sql`
3. Execute

## ⚠️ Considerações Importantes

1. **Obras Existentes**: Obras já cadastradas não serão afetadas (campos `sem_previsao_volume`, `sem_previsao_ruas` e `sem_previsao_toneladas` serão `FALSE` por padrão)
2. **Validação Backend**: Certifique-se de que a API também valida corretamente obras com:
   - `sem_previsao_volume = TRUE` (permite `volume_total_previsto` nulo/zerado)
   - `sem_previsao_ruas = TRUE` (permite `total_ruas` nulo/zerado)
   - `sem_previsao_toneladas = TRUE` (permite `toneladas_previstas` nulo/zerado)
3. **Relatórios**: Considere como obras sem previsão devem aparecer em relatórios e dashboards:
   - Filtrar por "Com/Sem Previsão de Volume"
   - Filtrar por "Com/Sem Previsão de Ruas"
   - Filtrar por "Com/Sem Previsão de Toneladas"
   - Identificar visualmente obras com previsões pendentes
4. **Edição**: Permita que usuários possam marcar/desmarcar "Sem Previsão" **independentemente** ao editar obras
5. **Flexibilidade**: Os checkboxes são independentes, permitindo todas as combinações possíveis:
   - ✅ Todos os campos com previsão
   - ✅ Volume sem previsão + demais com previsão
   - ✅ Ruas sem previsão + demais com previsão
   - ✅ Toneladas sem previsão + demais com previsão
   - ✅ Múltiplas combinações sem previsão
   - ✅ Todos os campos sem previsão

## 🎯 Casos de Uso

### Exemplo 1: Obra com Volume Indefinido
Cliente solicita obra mas o volume ainda está sendo calculado, porém já sabe quantas ruas:
- ✅ Marcar checkbox "Sem Previsão" **apenas no Volume**
- ✅ Preencher "Total de Ruas" normalmente (ex: 10 ruas)
- ✅ Cadastrar informações básicas e serviços conhecidos
- ⏭️ Atualizar volume quando medição estiver pronta

### Exemplo 2: Obra com Ruas Indefinidas
Cliente tem previsão de volume mas não sabe quantas ruas serão:
- ✅ Preencher "Volume Total Previsto" normalmente (ex: 500 m³)
- ✅ Marcar checkbox "Sem Previsão" **apenas em Ruas**
- ✅ Trabalhar com base no volume total
- ⏭️ Atualizar total de ruas conforme planejamento avançar

### Exemplo 3: Obra Completamente Indefinida
Necessidade urgente sem nenhum planejamento detalhado:
- ✅ Marcar **ambos** os checkboxes "Sem Previsão"
- ✅ Iniciar obra rapidamente com informações básicas
- ✅ Trabalhar por demanda
- ⏭️ Definir previsões posteriormente conforme levantamento

### Exemplo 4: Obra Incremental por Fase
Contrato por execução em fases, sem escopo total definido:
- ✅ Marcar "Sem Previsão" em **Volume e Ruas**
- ✅ Trabalhar conforme fases liberadas pelo cliente
- ✅ Atualizar valores realizados por fase
- ⏭️ Complementar previsões quando escopo total for definido

## 📊 Impacto em Outras Funcionalidades

### Dashboard
- Obras sem previsão de volume devem ser identificadas visualmente (badge ou ícone)
- Obras sem previsão de ruas devem ter indicador específico
- Cálculos de volume previsto devem:
  - Excluir ou sinalizar obras com `sem_previsao_volume = TRUE`
  - Mostrar totalizadores separados: "Volume Previsto" vs "Volume Sem Previsão"

### Relatórios
- **Filtros independentes**:
  - ☑️ Com Previsão de Volume / ☑️ Sem Previsão de Volume
  - ☑️ Com Previsão de Ruas / ☑️ Sem Previsão de Ruas
- **Totalizadores separados**:
  - Total de obras com volume previsto
  - Total de obras sem volume previsto
  - Total de obras com ruas previstas
  - Total de obras sem ruas previstas
- **Exportações**: Incluir colunas `sem_previsao_volume` e `sem_previsao_ruas`

### Financeiro
- **Previsões de Faturamento**:
  - Indicar claramente obras sem volume previsto
  - Calcular previsões apenas para obras com `sem_previsao_volume = FALSE`
  - Exibir warning/alerta para obras sem previsão
- **Alertas sugeridos**:
  - "⚠️ X obras sem previsão de volume"
  - "⚠️ X obras sem previsão de ruas"
  - Notificar gestor após Y dias sem definição de previsão

### Listagens de Obras
- **Badges visuais**:
  - 🟡 "Sem Vol." quando `sem_previsao_volume = TRUE`
  - 🟡 "Sem Ruas" quando `sem_previsao_ruas = TRUE`
- **Filtros rápidos**:
  - "Obras Pendentes de Previsão"
  - "Obras Completas" (com todas as previsões)

## 🚀 Melhorias Futuras

1. **Notificação**: Alertar usuário para definir previsão após X dias
2. **Relatório**: Dashboard específico para obras sem previsão
3. **Automação**: Sugerir previsão baseada em obras similares
4. **Workflow**: Processo de aprovação de previsões

## 📞 Suporte

Para dúvidas ou problemas relacionados a esta funcionalidade, consulte a documentação ou entre em contato com o time de desenvolvimento.

---

**Data de Implementação**: 16/10/2025  
**Versão**: 1.0  
**Status**: ✅ Implementado e Testado

