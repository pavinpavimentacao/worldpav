# Sistema de Licenças para Maquinários e Veículos

## 📋 Visão Geral

Sistema completo para gerenciamento de licenças e certificações obrigatórias de maquinários e veículos, com foco especial em **Caminhões Espargidor** que possuem requisitos regulatórios específicos.

## 🚛 Licenças Obrigatórias para Caminhão Espargidor

Os caminhões espargidor de emulsão asfáltica **DEVEM** ter as seguintes licenças:

### 1. **ANTT** - Agência Nacional de Transportes Terrestres
- **Obrigatória para:** Transporte de produtos químicos (emulsão asfáltica)
- **Validade:** Anual
- **Órgão Emissor:** ANTT
- **Documento:** Registro RNTRC + Certificação específica

### 2. **Ambipar** - Licença Ambiental
- **Obrigatória para:** Transporte e aplicação de produtos químicos
- **Validade:** Anual
- **Órgão Emissor:** CETESB (SP) ou órgão ambiental estadual
- **Documento:** Licença de Operação ou Autorização Ambiental

### 3. **CIPP** - Certificado de Inspeção para Transporte de Produtos Perigosos
- **Obrigatória para:** Transporte de produtos perigosos
- **Validade:** Anual
- **Órgão Emissor:** INMETRO
- **Documento:** Certificado de Inspeção Técnica Veicular

### 4. **CIV** - Certificado de Inspeção Veicular
- **Obrigatória para:** Todos os veículos comerciais
- **Validade:** Anual
- **Órgão Emissor:** DETRAN
- **Documento:** Certificado de Inspeção Veicular

## 🔧 Licenças para Outros Equipamentos

### Equipamentos Sobre Rodas (com placa):
- **CRLV** - Certificado de Registro e Licenciamento de Veículo (anual)
- **CIV** - Certificado de Inspeção Veicular (anual)

### Equipamentos Pesados (sem placa):
- **Alvará** - Alvará de funcionamento (se aplicável)
- Licenças específicas conforme legislação municipal

## 🎨 Interface do Sistema

### Aba de Licenças

Localizada nos detalhes de cada maquinário, a aba "Licenças" exibe:

#### **1. Alertas Inteligentes** (para Espargidor)

**🔴 Licenças Faltantes:**
```
⚠️ Licenças Obrigatórias Faltantes para Caminhão Espargidor
• ANTT - Agência Nacional de Transportes Terrestres
• CIPP - Certificado de Produtos Perigosos
```

**🟠 Licenças Vencidas:**
```
⏰ Licenças Obrigatórias Vencidas
• CIV - Venceu em 15/10/2024
```

**🟢 Tudo em Dia:**
```
✓ Todas as licenças obrigatórias estão em dia!
Caminhão apto para operação conforme regulamentação.
```

#### **2. Cards de Resumo**
- **Total** - Quantidade total de licenças
- **Válidas** - Licenças dentro da validade
- **Vencem em Breve** - Licenças que vencem em até 30 dias
- **Vencidas** - Licenças com validade expirada

#### **3. Tabela de Licenças**
Colunas:
- Tipo (com ícone)
- Número da Licença
- Órgão Emissor
- Validade (com contagem regressiva)
- Status (badge colorido)
- Arquivo (botão de download)
- Ações (editar/excluir)

### Formulário de Adicionar/Editar Licença

**Campos Obrigatórios:**
- Tipo de Licença *
- Número da Licença *
- Data de Validade *

**Campos Opcionais:**
- Órgão Emissor
- Data de Emissão
- Upload do PDF da licença
- Observações

**Validações:**
- ✅ Apenas arquivos PDF
- ✅ Tamanho máximo de 10MB
- ✅ Data de validade obrigatória
- ✅ Indicação visual de licenças obrigatórias para espargidor

## 🔔 Sistema de Alertas

### Alertas Visuais:
1. **Licença não cadastrada** - Banner vermelho
2. **Licença vence em ≤ 30 dias** - Badge amarelo "Vence em Breve"
3. **Licença vencida** - Badge vermelho + contador de dias vencido
4. **Todas OK** - Banner verde de confirmação

### Cálculo Automático de Status:
- **Válida** - Mais de 30 dias para vencer
- **Vence em Breve** - 30 dias ou menos para vencer
- **Vencida** - Data de validade ultrapassada
- **Pendente** - Ainda não emitida

## 📊 Dados Mockados

### Espargidor Volvo FMX (ID: 2)
- ✅ ANTT - Válida até 09/01/2025
- ✅ Ambipar - Válida até 31/01/2025
- ✅ CIPP - Válida até 14/01/2025
- ✅ CIV - Válida até 28/02/2025
**Status:** ✅ Todas licenças OK

### Vibroacabadora CAT (ID: 1)
- ✅ CRLV - Válida até 04/01/2025

### Rolo Chapa Dynapac (ID: 3)
- ❌ CIV - Vencida em 31/10/2024
**Status:** ⚠️ Precisa renovação

### Rolo Pneumático Bomag (ID: 4)
- ✅ CRLV - Válida até 31/05/2025
- 🟡 CIV - Vence em 15/11/2024
**Status:** ⚠️ Renovar em breve

## 💾 Estrutura do Banco de Dados

### Tabela: `licencas_maquinarios`

```sql
CREATE TABLE licencas_maquinarios (
  id UUID PRIMARY KEY,
  maquinario_id UUID NOT NULL,
  company_id UUID NOT NULL,
  tipo_licenca VARCHAR(50) NOT NULL,
  numero_licenca VARCHAR(100) NOT NULL,
  orgao_emissor VARCHAR(200),
  data_emissao DATE,
  data_validade DATE NOT NULL,
  arquivo_url TEXT,
  observacoes TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Triggers Automáticos:
- Atualização de status baseado na data de validade
- Timestamp automático em atualizações

### Views Auxiliares:
- `licencas_vencendo` - Licenças que vencem em até 30 dias
- `licencas_vencidas` - Licenças com validade expirada

## 🔒 Segurança

- **RLS (Row Level Security)** habilitado
- Usuários só veem licenças da própria empresa
- Policies para todas operações (SELECT, INSERT, UPDATE, DELETE)
- Validações em nível de banco de dados

## 📱 Como Usar

### Adicionar Nova Licença:

1. Acesse **Maquinários** → Clique no equipamento
2. Vá para a aba **"Licenças"**
3. Clique em **"+ Adicionar Licença"**
4. Selecione o **Tipo de Licença**
   - Se for espargidor, veja indicação de obrigatórias
5. Preencha **Número da Licença**
6. Defina a **Data de Validade**
7. **Faça upload do PDF** da licença
8. Adicione observações se necessário
9. Clique em **"Adicionar Licença"**

### Renovar Licença Vencida:

1. Na tabela, clique em **Editar** (ícone lápis)
2. Atualize a **Data de Validade**
3. **Faça upload da nova licença** (PDF)
4. Salve as alterações
5. Status é atualizado automaticamente

### Verificar Conformidade (Espargidor):

O sistema mostra automaticamente se:
- ✅ Todas as 4 licenças obrigatórias estão presentes
- ✅ Todas estão dentro da validade
- ❌ Quais licenças estão faltando
- ❌ Quais estão vencidas

## 🚨 Penalidades por Não Conformidade

**Caminhão sem licenças obrigatórias NÃO PODE:**
- Circular em vias públicas
- Transportar emulsão asfáltica
- Operar em obras

**Multas e Sanções:**
- Multa de trânsito pesada
- Apreensão do veículo
- Processo administrativo
- Responsabilização da empresa

## 📅 Cronograma de Renovações

Recomendamos renovar as licenças **com 60 dias de antecedência** para evitar:
- Correria de última hora
- Equipamento parado
- Multas e penalidades
- Perda de prazos de obra

## 🎯 Checklist de Licenças - Espargidor

Antes de colocar o caminhão espargidor em operação, verifique:

- [ ] ANTT válida
- [ ] Ambipar válida
- [ ] CIPP válida
- [ ] CIV válida
- [ ] PDFs de todas licenças anexados no sistema
- [ ] Datas de vencimento cadastradas
- [ ] Cópias físicas no veículo

## 🔄 Processo de Renovação

1. **60 dias antes:** Sistema alerta sobre vencimento próximo
2. **45 dias antes:** Iniciar processo de renovação
3. **30 dias antes:** Status muda para "Vence em Breve"
4. **Após vencimento:** Status muda para "Vencida" automaticamente
5. **Após renovação:** Atualizar no sistema com nova data e PDF

## 📞 Contatos Úteis

**ANTT:** 0800-887-0588  
**CETESB:** 0800-113-560 (SP)  
**DETRAN-SP:** 0800-055-5510  
**INMETRO:** 0800-285-1818

---

**Criado em:** 18/10/2025  
**Última atualização:** 18/10/2025  
**Versão:** 1.0


