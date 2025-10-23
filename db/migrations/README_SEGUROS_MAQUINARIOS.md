# Sistema de Seguros para Maquinários e Veículos

## 📋 Visão Geral

Sistema completo para gerenciamento de seguros de maquinários e veículos da empresa, incluindo controle de apólices, vigências, pagamentos e sinistros.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `seguros_maquinarios`

Armazena todas as informações de seguros dos equipamentos.

**Campos Principais:**
- `seguradora` - Nome da seguradora
- `numero_apolice` - Número único da apólice
- `tipo_cobertura` - Tipo de cobertura contratada
- `valor_segurado` - Valor total segurado do equipamento
- `valor_franquia` - Valor da franquia em caso de sinistro
- `valor_premio` - Custo total do seguro
- `data_inicio_vigencia` / `data_fim_vigencia` - Período de vigência
- `forma_pagamento` - Como o seguro está sendo pago
- `status` - Status atual (ativo, vencido, cancelado, em_renovacao)

**Campos de Corretor (opcionais):**
- `corretor` - Nome do corretor ou corretora
- `telefone_corretor` - Telefone de contato
- `email_corretor` - Email para contato

### Tabela: `sinistros_seguros`

Registra todos os sinistros e acionamentos de seguro.

**Campos Principais:**
- `tipo_sinistro` - Tipo do sinistro (colisão, roubo, etc)
- `descricao` - Descrição detalhada do ocorrido
- `valor_prejuizo` - Valor total do prejuízo
- `valor_franquia_paga` - Valor da franquia que foi pago
- `valor_indenizado` - Valor indenizado pela seguradora
- `numero_sinistro` - Número do processo na seguradora
- `status_sinistro` - Status do sinistro (em_analise, aprovado, pago, etc)

## 🎨 Interface do Usuário

### Aba de Seguro

Localizada nos detalhes de cada maquinário, a aba "Seguro" permite:

1. **Visualizar Seguro Ativo**
   - Card destacado com informações principais
   - Alerta visual se estiver próximo do vencimento
   - Informações de vigência e valor segurado

2. **Adicionar Novo Seguro**
   - Formulário completo com validações
   - Campos organizados por categorias
   - Cálculo automático de parcelas

3. **Histórico de Seguros**
   - Tabela com todos os seguros (ativos, vencidos, cancelados)
   - Filtros e ordenação
   - Ações de editar e excluir

### Campos do Formulário

**Informações da Seguradora:**
- Seguradora (obrigatório)
- Número da Apólice (obrigatório)
- Tipo de Cobertura
- Valor Segurado (obrigatório)
- Valor da Franquia

**Vigência:**
- Data de Início (obrigatório)
- Data de Fim (obrigatório)

**Pagamento:**
- Forma de Pagamento
- Valor Total (Prêmio)
- Valor da Parcela (se parcelado)
- Quantidade de Parcelas (se parcelado)
- Dia do Vencimento (se parcelado)

**Corretor (Opcional):**
- Nome do Corretor
- Telefone
- E-mail

**Outros:**
- Observações
- Upload da Apólice (PDF)

## 📊 Tipos de Cobertura

1. **Compreensiva** - Cobertura total (mais completa)
2. **Colisão** - Apenas danos por colisão
3. **Incêndio e Roubo** - Cobertura para incêndio e roubo
4. **Roubo** - Apenas roubo/furto
5. **Terceiros** - Responsabilidade civil
6. **Outras** - Outros tipos personalizados

## 💰 Formas de Pagamento

- À Vista
- Parcelado Mensal
- Parcelado Trimestral
- Parcelado Semestral
- Parcelado Anual

## ⚠️ Status do Seguro

- **Ativo** - Seguro vigente e em dia
- **Vencido** - Seguro com vigência expirada
- **Cancelado** - Seguro cancelado antes do fim da vigência
- **Em Renovação** - Processo de renovação em andamento

## 🔔 Alertas Automáticos

O sistema exibe alertas visuais quando:
- Nenhum seguro está cadastrado
- Seguro está próximo do vencimento (30 dias ou menos)
- Seguro está vencido

## 🔄 Funcionalidades Automáticas

1. **Cálculo de Status**
   - Status é atualizado automaticamente baseado na data de vigência
   - Trigger no banco de dados mantém os status sincronizados

2. **Validações**
   - Data de fim sempre posterior à data de início
   - Número de apólice único por empresa
   - Valores numéricos positivos

3. **Segurança**
   - RLS (Row Level Security) habilitado
   - Usuários só veem seguros da própria empresa
   - Policies para todas as operações (SELECT, INSERT, UPDATE, DELETE)

## 📝 Dados Mockados

Seguros de exemplo para demonstração:
- **Vibroacabadora CAT** - Porto Seguro, R$ 450.000 segurado
- **Espargidor Volvo** - Bradesco Seguros, R$ 380.000 segurado
- **Rolo Chapa Dynapac** - Itaú Seguros, R$ 180.000 segurado
- **Rolo Pneumático Bomag** - Mapfre Seguros, R$ 250.000 segurado

## 🚀 Próximos Passos

1. Implementar gestão de sinistros na interface
2. Adicionar notificações automáticas de vencimento
3. Relatórios de custos com seguros
4. Dashboard com análise de sinistros
5. Integração com corretoras via API

## 📌 Observações Importantes

- Mantenha sempre o seguro ativo para todos os equipamentos
- Verifique regularmente as datas de vencimento
- Guarde cópias das apólices em formato PDF
- Registre todos os sinistros, mesmo os não acionados
- Mantenha contato atualizado do corretor

---

**Criado em:** 18/10/2025  
**Última atualização:** 18/10/2025  
**Versão:** 1.0


