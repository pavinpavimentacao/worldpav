# 📋 Formatação de CNPJ - Campo CNPJ da Obra

## ✅ Implementado

### 🎯 Objetivo
Formatar o campo "CNPJ da Obra" para seguir o padrão brasileiro: **XX.XXX.XXX/XXXX-XX**

### 🔧 Solução Implementada

#### 1. **Novo Componente: CnpjInput**
- **Arquivo**: `src/components/ui/cnpj-input.tsx`
- **Funcionalidades**:
  - ✅ Formatação automática para padrão brasileiro
  - ✅ Validação de entrada (apenas números)
  - ✅ Limite de 14 dígitos
  - ✅ Máscara aplicada em tempo real
  - ✅ Bloqueio de caracteres inválidos
  - ✅ Suporte a teclas de navegação

#### 2. **Formatação Brasileira**
```typescript
// Entrada: 98765432000110
// Exibição: "98.765.432/0001-10"

// Entrada: 12345678000123
// Exibição: "12.345.678/0001-23"

// Entrada: 11111111000111
// Exibição: "11.111.111/0001-11"
```

#### 3. **Comportamento do Campo**

**Ao digitar:**
- ✅ Aceita apenas números
- ✅ Formata automaticamente conforme digita
- ✅ Limita a 14 dígitos
- ✅ Bloqueia caracteres especiais

**Formatação progressiva:**
```
1     → "1"
12    → "12"
123   → "12.3"
1234  → "12.34"
12345 → "12.345"
123456 → "12.345.6"
1234567 → "12.345.67"
12345678 → "12.345.678"
123456789 → "12.345.678/9"
1234567890 → "12.345.678/90"
12345678901 → "12.345.678/901"
123456789012 → "12.345.678/9012"
1234567890123 → "12.345.678/9012-3"
12345678901234 → "12.345.678/9012-34"
```

**Teclas permitidas:**
- ✅ Números (0-9)
- ✅ Backspace, Delete
- ✅ Tab, Escape, Enter
- ✅ Setas de navegação
- ✅ Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X

### 📝 Campo Atualizado

#### **CNPJ da Obra**
```tsx
<CnpjInput
  value={field.value || ''}
  onChange={field.onChange}
  onBlur={field.onBlur}
  placeholder="Ex: 98.765.432/0001-10"
/>
```

### 🎨 Exemplos de Uso

#### **Entrada do Usuário:**
```
98765432000110  → Exibe: 98.765.432/0001-10
12345678000123  → Exibe: 12.345.678/0001-23
11111111000111  → Exibe: 11.111.111/0001-11
```

#### **Placeholder:**
```
"Ex: 98.765.432/0001-10"
```

### 🔧 Configurações do Componente

```typescript
interface CnpjInputProps {
  value: string                    // Valor do CNPJ (apenas números)
  onChange: (value: string) => void // Callback de mudança
  onBlur?: () => void              // Callback ao sair
  placeholder?: string            // Texto de exemplo
  className?: string              // Classes CSS
  disabled?: boolean              // Desabilitado
}
```

### 🚀 Benefícios

1. **✅ UX Melhorada**: Formatação automática e intuitiva
2. **✅ Padrão Brasileiro**: Pontos, barra e hífen nos lugares corretos
3. **✅ Validação**: Previne entrada de caracteres inválidos
4. **✅ Limite de Dígitos**: Máximo 14 dígitos (padrão CNPJ)
5. **✅ Navegação**: Suporte completo a teclas de navegação
6. **✅ Acessibilidade**: Placeholder informativo

### 🎯 Validação de CNPJ

O componente formata visualmente, mas para validação completa de CNPJ (dígitos verificadores), recomenda-se usar uma biblioteca como:

```typescript
// Exemplo de validação completa
import { validateCNPJ } from 'cnpj-validator'

const isValid = validateCNPJ('98.765.432/0001-10') // true/false
```

### 📋 Teste

**Para testar:**
1. Acesse: http://localhost:5173
2. Vá em: Obras → Nova Obra
3. Marque: "Esta obra tem um CNPJ separado?"
4. Digite no campo CNPJ: `98765432000110`
5. **Resultado esperado**: `98.765.432/0001-10`

### 🔄 Reutilização

O componente `CnpjInput` pode ser usado em outros formulários:

- **Cadastro de clientes**
- **Cadastro de fornecedores**
- **Cadastro de empresas**
- **Qualquer campo que precise de CNPJ**

---

## ✅ Status: IMPLEMENTADO E FUNCIONANDO

**Desenvolvido com ❤️ por WorldPav Team**

