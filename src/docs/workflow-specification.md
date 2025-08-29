# MyImoMatePro - Especificação Completa de Workflows

**Fonte:** Documento original de planeamento estratégico  
**Data:** Janeiro 2025  
**Status:** Especificação aprovada e validada  

---

## 📋 CONCEITO CENTRAL VALIDADO

### **Cliente como Centro**
- Todos os dados gravitam em torno do cliente
- 5 tipos de oportunidades por cliente
- Deals infinitos por oportunidade
- Timeline unificada de todas as interações

### **Fluxo Principal**
Landing Page → Login → Dashboard → Cliente → Leads → Oportunidades → Deals → Sucesso/Fracasso

---

## 🎯 ENTIDADES PRINCIPAIS

### **CLIENTE (Centro do Sistema)**

#### **Campos Obrigatórios:**
- Nome
- Telefone  
- Email

#### **Tab 1: Dados Pessoais**
- Preferência de Contacto
- Melhor Horário de Contacto
- Número do Cartão de Cidadão + Validade
- NIF
- Data nascimento
- Naturalidade (Freguesia, Concelho, Distrito)
- Profissão
- Estado civil
- **Se casado/união de facto:** Dados completos do cônjuge
- **Morada de Residência** (integração CEP Portugal)
- Notas
- Documentos anexos

#### **Tab 2: Informações Financeiras**
- Rendimento Mensal (próprio + cônjuge)
- Capital Disponível
- **Situação de Crédito:**
  - Sem Crédito
  - Crédito Habitação Atual
  - Crédito Pessoal
  - Crédito Automóvel
  - Múltiplos Créditos
- Banco de Relacionamento
- Pré-aprovação bancária (Sim/Não + detalhes)

#### **Tab 3: Documentação e Observações**
- **Documentos Disponíveis:** CC Frente/Verso, Comprovativo IBAN, Declaração IRS, Recibos Vencimento, Certidões, Caderneta Predial, Contrato Trabalho
- **Tags:** VIP, Urgente, Investidor, Primeira habitação, Financiamento aprovado, Sem pressa, Exigente, Flexível localização, Budget alto, Recomendação
- **Como nos conheceu:** Website, Google, Facebook, Instagram, Recomendação, Portal Imobiliário, Publicidade Exterior, Rádio, Jornal, Outro
- Data do Próximo Contacto
- **Consentimentos GDPR** (tratamento dados + marketing)
- Observações do Consultor

---

## 🔄 SISTEMA DE LEADS

### **Função:** 
Qualificar clientes com formulário rápido antes de virar oportunidade

### **Campos:**
- **Origem:** Website, escala, recomendação, prospeção, redes sociais, cold call
- **Status:** Novo, contactado, frio, qualificado, convertido, perdido
- **Sistema de Nutrição:** Calendário de tarefas (ligar, email, WhatsApp)
- **Timeline de Interações:** Chamadas, reuniões, nutrição

---

## 💼 5 TIPOS DE OPORTUNIDADES

### **1. COMPRADOR (6 Fases)**

1. **Qualificação**
   - Orçamento disponível
   - Zona pretendida
   - Tipologia (T0, T1, T2, etc.)
   - Finalidade (habitação própria/investimento)
   - Timeline desejada

2. **Pesquisa de Imóveis**
   - Filtros aplicados
   - Imóveis selecionados (referência externa)
   - Contacto vendedores/imobiliárias + comissões

3. **Visitas**
   - Agendamento + acompanhamento
   - Feedback pós-visita
   - Classificação imóvel

4. **Proposta**
   - Valor proposto + condições especiais
   - Prazo de resposta
   - Status (pendente/aceite/rejeitada/contra-proposta)

5. **Negociação**
   - Histórico propostas/contra-propostas
   - Condições finais + documentação

6. **Processo de Compra**
   - CPCV → Financiamento → Escritura → Chaves

**Automações:**
- Lembrete follow-up pós-visita
- Notificação prazo proposta
- Checklist processo compra

### **2. VENDEDOR (5 Fases)**

1. **Avaliação do Imóvel**
   - Visita técnica + análise mercado
   - Preço sugerido + estratégia marketing

2. **Preparação Marketing**
   - Fotos profissionais (referência externa + data)
   - Descrição comercial + plano divulgação
   - Disponibilização portais

3. **Visitas Múltiplas**
   - Agendamento centralizado
   - Gestão de interessados + feedback
   - Relatório semanal

4. **Propostas Múltiplas**
   - Receção + análise comparativa
   - Negociação simultânea + decisão

5. **Processo de Venda**
   - CPCV → Acompanhamento comprador → Escritura → Chaves

**Funcionalidades Especiais:**
- Dashboard propostas ativas
- Comparador de ofertas
- Sistema de leilão (se aplicável)

### **3. INVESTIDOR (3 Estratégias)**

#### **3.1 Buy to Hold**
1. Qualificação (orçamento, objetivos, timeline, tolerância risco)
2. Análise Investimento (ROI, cash flow, mercado, due diligence)
3. Processo Compra
4. **HOLD - Gestão Carteira** (valorização, custos, impostos, decisão venda)

#### **3.2 Buy to Rent**
1-3. Igual ao Buy to Hold
4. **HOLD - Gestão Arrendamento** (preparação, marketing, seleção inquilinos, contratos)

#### **3.3 Fix and Flip**
1. Qualificação (orçamento compra + renovação, experiência obras, timeline)
2. Análise Renovação (orçamentos, licenças, valor pós-renovação, margem)
3. Processo Compra
4. Gestão Renovação
5. Processo Venda Rápida

**Calculadora ROI Integrada:**
Preço compra + custos renovação + despesas + comissões + impostos + margem = **Preço venda objetivo**

### **4. SENHORIO (6 Fases)**

1. **Avaliação Propriedade** (estado, renda mercado, despesas, rentabilidade)
2. **Preparação Arrendamento** (obras, certificações, seguro, contrato)
3. **Marketing** (anúncio portais, visitas, triagem interessados)
4. **Seleção Inquilino** (candidaturas, referências, análise financeira)
5. **Contrato** (assinatura, cauções, inventário, chaves)
6. **Gestão Contínua** (cobranças, manutenção, renovações, conflitos)

### **5. INQUILINO (5 Fases)**

1. **Qualificação** (orçamento, zona, tipologia, data entrada)
2. **Pesquisa** (filtros, propriedades, contacto senhorios)
3. **Visitas** (agendamento, acompanhamento, avaliação)
4. **Candidatura** (dados, comprovativo rendimentos, referências, documentos)
5. **Processo Arrendamento** (aprovação, negociação, contrato, entrada)

---

## 🔗 DEALS PLENOS (LIGADOS)

### **Vendedor ↔ Comprador**
- Deal único com 2 clientes
- Timeline partilhada
- Coordenação visitas + negociação facilitada
- Comissão dupla ou partilhada
- **Fases:** Matching automático → Visita conjunta → Negociação direta → Processo simultâneo

### **Senhorio ↔ Inquilino**
- Deal arrendamento completo
- Processo otimizado + controlo total

---

## ⏱️ SISTEMA DE TIMELINE E ATIVIDADES

### **Tipos de Atividades:**
- **Contactos:** chamadas, emails, mensagens
- **Reuniões:** presenciais ou virtuais  
- **Visitas:** propriedades
- **Tarefas:** follow-ups, documentação
- **Marcos:** propostas, contratos, fechos

### **Sistema de Notificações:**
- Lembretes automáticos + alertas prazo
- Follow-ups sugeridos + relatórios progresso

---

## 🏗️ ARQUITETURA TÉCNICA

### **Estrutura Base de Dados:**
\\\
tenants/{tenantId}/
├── clients/
│   ├── {clientId}/
│   │   ├── profile
│   │   ├── opportunities/
│   │   └── activities/
├── leads/
├── deals/
│   ├── {dealId}/
│   │   ├── type
│   │   ├── clientIds[] (1 ou 2 para plenos)
│   │   ├── phases/
│   │   ├── timeline/
│   │   ├── tasks/
│   │   └── documents/
└── properties/ (referências externas)
\\\

### **Estados Deal:**
- Ativo, Pausado, Ganho, Perdido, Cancelado

### **Transições Automáticas:**
- Lead → Cliente (qualificado)
- Oportunidade → Deal (ativado)  
- Deal Individual → Deal Pleno (ligado)

---

## 🚀 FUNCIONALIDADES AVANÇADAS

### **Dashboard Inteligente:**
- KPIs por tipo oportunidade
- Pipeline visual + alertas prioritários
- Tarefas do dia

### **Relatórios Automáticos:**
- Performance por consultor
- Conversão por fonte lead
- Tempo médio por fase + comissões projetadas

### **Integrações Obrigatórias:**
- **API CEP Portugal** (moradas)
- **Portais imobiliários** (referências)
- **Calendar** (agendamentos)
- **Sistema WhatsApp próprio** (histórico mensagens + automações)
- **Sistema Email próprio** (campanhas + automações)

### **Lembretes Automáticos:**
- Pagamentos tranches (1,2,3)
- Aproximação escritura + obrigações
- Aniversários clientes + escrituras
- Dados residem no cliente e conectam onde necessário

### **Templates Inteligentes:**
- **CPCV pré-preenchidos** com dados clientes
- **Editáveis antes de imprimir**
- Auto-preenchimento baseado em field-definitions

---

## 🎨 ESPECIFICAÇÕES DE DESIGN

### **Tema Corporativo Futurista:**
- **Estilo:** Corporate harmony profissional
- **Icons:** Hero Icons ou Lucide React
- **Layout:** Pages + Modals
- **Cores:** Tema mais usado no mundo (corporativo azul/cinza)
- **Typography:** Moderna e clean

---

## 📈 ROADMAP DE IMPLEMENTAÇÃO

### **Fase 1: Core System**
- Estrutura base dados + CRUD clientes
- Sistema leads básico + Dashboard inicial

### **Fase 2: Workflows Básicos**  
- Comprador workflow + Vendedor workflow + Timeline

### **Fase 3: Investidores**
- 3 sub-tipos investidor + Calculadora ROI + Sistema HOLD

### **Fase 4: Deals Plenos**
- Sistema linking + Coordenação workflows + Dashboard avançado

### **Fase 5: Otimizações**
- Relatórios avançados + Automações + Integrações externas

---

## 🔧 CONSIDERAÇÕES TÉCNICAS

### **Performance:**
- Firestore listeners real-time
- Paginação listas grandes + cache local

### **Segurança:**
- Firestore rules por tenant
- Dados encriptados sensíveis + audit trail

### **Escalabilidade:**
- Componentização modular
- Lazy loading + otimização bundle

---

**Status:** Especificação completa aprovada  
**Próximo Passo:** Implementação seguindo esta documentação  
**Atualização:** Este documento é referência fixa do projeto
