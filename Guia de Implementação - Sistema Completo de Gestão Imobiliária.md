# 🏗️ Guia de Implementação - Sistema Completo de Gestão Imobiliária

## 📂 Estrutura de Ficheiros Necessários

```
src/
├── models/
│   ├── opportunityModel.js ✅ (existente)
│   ├── visitModel.js ✅ (criado)
│   ├── offerModel.js ✅ (criado)
│   ├── pipelineModel.js ✅ (criado)
│   └── taskModel.js ⏳ (a criar)
│
├── services/
│   ├── opportunityService.js ✅ (existente)
│   ├── visitService.js ⏳ (a criar)
│   ├── offerService.js ⏳ (a criar)
│   └── taskService.js ⏳ (a criar)
│
├── pages/
│   ├── OpportunityForm.jsx ✅ (substituir pelo CompleteForm)
│   └── OpportunityFormComplete.jsx ✅ (criado)
│
└── components/
    └── opportunities/
        ├── OpportunityBadges.jsx ✅ (existente)
        └── tabs/
            ├── BasicInfoTab.jsx ✅ (criado)
            ├── PipelineTab.jsx ⏳ (a criar)
            ├── VisitsTab.jsx ⏳ (a criar)
            ├── OffersTab.jsx ⏳ (a criar)
            ├── TasksTab.jsx ⏳ (a criar)
            ├── DocumentsTab.jsx ⏳ (a criar)
            └── TimelineTab.jsx ⏳ (a criar)
```

## 🛠️ Próximos Passos de Implementação

### 1️⃣ **Criar os Tabs Restantes**

#### **PipelineTab.jsx**
```jsx
// Estrutura básica
const PipelineTab = ({ data, onChange, opportunityType }) => {
    const pipeline = getPipelineByType(opportunityType);
    
    return (
        <div>
            {/* Visual do pipeline com stages */}
            {/* Botões para avançar/retroceder stage */}
            {/* Checklist de requisitos por stage */}
        </div>
    );
};
```

#### **VisitsTab.jsx**
```jsx
// Funcionalidades principais:
- Lista de visitas agendadas
- Formulário para agendar nova visita
- Modal de feedback pós-visita
- Calendário de visitas
- Lembretes automáticos
```

#### **OffersTab.jsx**
```jsx
// Funcionalidades principais:
- Lista de ofertas/propostas
- Formulário de nova oferta
- Timeline de negociação
- Cálculos automáticos (sinal, CPCV, escritura)
- Gestão de contrapropostas
```

#### **TasksTab.jsx**
```jsx
// Funcionalidades principais:
- Lista de tarefas por categoria
- Marcação de serviços (fotógrafo, certificados, etc)
- Checklist de documentos
- Integração com calendar
- Notificações de prazos
```

### 2️⃣ **Criar os Serviços (Services)**

#### **visitService.js**
```javascript
export const visitService = {
    // CRUD de visitas
    createVisit: async (opportunityId, visitData) => {},
    updateVisit: async (visitId, updates) => {},
    
    // Feedback
    addFeedback: async (visitId, feedback) => {},
    
    // Lembretes
    scheduleReminders: async (visitId) => {},
    
    // Estatísticas
    getVisitStats: async (opportunityId) => {}
};
```

#### **offerService.js**
```javascript
export const offerService = {
    // CRUD de ofertas
    createOffer: async (opportunityId, offerData) => {},
    updateOffer: async (offerId, updates) => {},
    
    // Negociação
    addCounterOffer: async (offerId, counterData) => {},
    acceptOffer: async (offerId) => {},
    rejectOffer: async (offerId, reason) => {},
    
    // Documentos
    generateCPCV: async (offerId) => {},
    calculateCommissions: async (offerId) => {}
};
```

### 3️⃣ **Atualizar o Router (App.jsx)**

```javascript
// Substituir a rota antiga pelo novo formulário
<Route path="/clients/:clientId/opportunities/new" element={
    <ProtectedRoute>
        <OpportunityFormComplete /> {/* Em vez de OpportunityForm */}
    </ProtectedRoute>
} />
```

### 4️⃣ **Integração Firebase - Estrutura de Dados**

```javascript
// Estrutura no Firestore
consultores/
  {consultorId}/
    clientes/
      {clienteId}/
        oportunidades/
          {oportunidadeId}/
            // Dados principais
            visitas/        // Subcoleção
              {visitaId}
            ofertas/        // Subcoleção
              {ofertaId}
            tarefas/        // Subcoleção
              {tarefaId}
            documentos/     // Subcoleção
              {documentoId}
```

## 🎯 Funcionalidades Avançadas a Implementar

### 📊 **Dashboard de Oportunidades**
- Pipeline visual (Kanban board)
- Métricas e KPIs
- Previsão de fecho
- Taxa de conversão

### 📅 **Calendário Integrado**
- Visitas agendadas
- Prazos importantes
- Lembretes automáticos
- Sincronização com Google Calendar

### 📱 **Notificações**
- Email automático
- SMS para clientes
- Push notifications
- WhatsApp Business API

### 📄 **Geração de Documentos**
- Proposta PDF
- CPCV automático
- Relatórios de visita
- Fichas de imóvel

### 🤝 **Gestão de Parcerias**
- Sistema de partilha entre agências
- Cálculo automático de comissões partilhadas
- Portal para parceiros

## 💡 Dicas de Implementação

1. **Começar simples**: Implementar primeiro as funcionalidades básicas
2. **Testar incrementalmente**: Testar cada tab antes de avançar
3. **Usar componentes reutilizáveis**: Criar componentes genéricos
4. **Documentar o código**: Adicionar comentários explicativos
5. **Validação robusta**: Validar dados em todos os níveis

## 🚀 Ordem Recomendada de Implementação

1. **Fase 1 - Core** (1 semana)
   - ✅ BasicInfoTab
   - ⏳ PipelineTab
   - ⏳ TimelineTab

2. **Fase 2 - Gestão** (1 semana)
   - ⏳ VisitsTab + visitService
   - ⏳ OffersTab + offerService

3. **Fase 3 - Produtividade** (1 semana)
   - ⏳ TasksTab + taskService
   - ⏳ DocumentsTab
   - ⏳ Notificações

4. **Fase 4 - Analytics** (1 semana)
   - ⏳ Dashboard
   - ⏳ Relatórios
   - ⏳ Métricas

## 📝 Exemplo de Código para os Tabs Restantes

### PipelineTab Básico
```jsx
import React from 'react';
import { getPipelineByType, STAGE_COLORS } from '../../../models/pipelineModel';

const PipelineTab = ({ data, onChange, opportunityType }) => {
    const pipeline = getPipelineByType(opportunityType);
    const stages = Object.values(pipeline);
    const currentStage = data.stage || 'lead';
    
    return (
        <div className="space-y-6">
            {/* Pipeline Visual */}
            <div className="flex justify-between items-center">
                {stages.map((stage, index) => (
                    <div key={stage.id} className="flex-1">
                        {/* Stage item */}
                    </div>
                ))}
            </div>
            
            {/* Stage Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3>Ações da Fase Atual</h3>
                {/* Lista de ações */}
            </div>
        </div>
    );
};
```

### VisitsTab Básico
```jsx
import React, { useState } from 'react';
import { VISIT_STATUS_LABELS } from '../../../models/visitModel';

const VisitsTab = ({ data = [], onChange }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between">
                <h3>Visitas Agendadas</h3>
                <button onClick={() => setShowAddForm(true)}>
                    + Nova Visita
                </button>
            </div>
            
            {/* Lista de Visitas */}
            <div className="space-y-3">
                {data.map(visit => (
                    <VisitCard key={visit.id} visit={visit} />
                ))}
            </div>
        </div>
    );
};
```

## 🔧 Configurações Necessárias

### Firebase Rules
```javascript
// Adicionar às regras do Firestore
match /consultores/{consultorId}/clientes/{clienteId}/oportunidades/{opportunityId} {
  allow read, write: if request.auth.uid == consultorId;
  
  match /visitas/{visitaId} {
    allow read, write: if request.auth.uid == consultorId;
  }
  
  match /ofertas/{ofertaId} {
    allow read, write: if request.auth.uid == consultorId;
  }
}
```

## 📚 Recursos Adicionais

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Headless UI](https://headlessui.com)

---

**Nota**: Este é um sistema profissional completo. A implementação total pode levar 3-4 semanas. Recomenda-se começar pelas funcionalidades core e ir expandindo gradualmente.