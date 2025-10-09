# Regras de Cálculo para Obras de Pavimentação

## 📊 Métricas Técnicas de Obras

Este documento descreve as regras de negócio para cálculo de métricas técnicas em obras de pavimentação.

---

## 🔢 Regra de Conversão: Metragem → Toneladas

### Fórmula Base
```
Toneladas = Metragem (m²) ÷ 10
```

### Exemplos:
- **1.000 m²** = 100 toneladas
- **5.000 m²** = 500 toneladas
- **3.250 m²** = 325 toneladas

### Justificativa
Esta é uma estimativa baseada na experiência prática da empresa. A relação 10:1 (m² para toneladas) serve como **base de cálculo para previsões**.

---

## 📏 Espessura Média Base

### Valor Padrão
```
Espessura Média Base = 3,5 cm
```

### Observações
- Este é um valor de referência usado para **estimativas iniciais**
- A espessura real pode variar conforme:
  - Condições do terreno
  - Especificações do cliente
  - Tipo de pavimentação (novo ou recapeamento)
  - Normas técnicas aplicáveis

---

## ⚠️ Importante: Valores de Previsão

### Natureza das Estimativas
Todos os valores planejados (metragem, toneladas, espessura) são **estimativas iniciais** que:

✅ **Podem ser maiores** que o previsto
- Terreno requer mais material que estimado
- Área real é maior que medida inicialmente
- Necessidade de camadas adicionais

❌ **Podem ser menores** que o previsto
- Obra reduzida ou cancelada parcialmente
- Condições favoráveis reduzem necessidade de material
- Ajustes no escopo durante execução

### Impacto no Faturamento
O faturamento final será baseado no **volume real executado**, não no valor previsto. Por isso:

1. Os valores planejados servem como **referência e planejamento**
2. O faturamento deve ser registrado com base nos **relatórios diários** de execução
3. As métricas de progresso mostram a execução **em relação à previsão inicial**

---

## 💻 Implementação no Sistema

### Arquivos Relacionados
- `src/pages/obras/ObraDetails.tsx` - Exibição de detalhes e progresso
- `src/pages/obras/ObrasList.tsx` - Listagem com métricas resumidas
- `src/pages/obras/NovaObra.tsx` - Formulário de criação (aplicar fórmulas)

### Cálculo Automático
Quando implementar a criação/edição de obras com banco de dados:

```typescript
// Ao cadastrar ou editar uma obra
function calcularToneladasPrevistas(metragemPlanejada: number): number {
  return metragemPlanejada / 10
}

// Valores padrão
const ESPESSURA_MEDIA_BASE = 3.5 // em cm
```

### Exemplo de Uso
```typescript
const obra = {
  metragemPlanejada: 5000,
  toneladasPlanejadas: calcularToneladasPrevistas(5000), // 500
  espessuraMedia: ESPESSURA_MEDIA_BASE, // 3.5
  // ... outros campos
}
```

---

## 📝 Histórico de Alterações

| Data | Descrição |
|------|-----------|
| 2025-01-09 | Documentação inicial das regras de cálculo |

---

## 🔗 Referências

- Baseado na experiência prática da WorldPav/Pavin
- Sujeito a ajustes conforme evolução dos projetos
- Consultar equipe técnica para validação em casos específicos


