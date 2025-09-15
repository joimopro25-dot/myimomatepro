/**
 * PIPELINE MODEL - MyImoMatePro
 * Funil de vendas específico por tipo de oportunidade
 * 
 * Caminho: src/models/pipelineModel.js
 */

// ===== PIPELINE STAGES POR TIPO =====

export const BUYER_PIPELINE = {
    LEAD: {
        id: 'lead',
        name: 'Lead',
        order: 1,
        description: 'Contacto inicial',
        actions: ['Qualificar cliente', 'Agendar reunião'],
        requiredFields: ['name', 'phone', 'email'],
        nextStages: ['qualification']
    },
    QUALIFICATION: {
        id: 'qualification',
        name: 'Qualificação',
        order: 2,
        description: 'Entender necessidades e capacidade',
        actions: ['Definir critérios', 'Verificar financiamento', 'Estabelecer orçamento'],
        requiredFields: ['budget', 'requirements', 'timeline'],
        documents: ['Pre-aprovação crédito', 'Comprovativo rendimentos'],
        nextStages: ['search']
    },
    SEARCH: {
        id: 'search',
        name: 'Pesquisa',
        order: 3,
        description: 'Procura de imóveis adequados',
        actions: ['Enviar listagens', 'Agendar visitas'],
        requiredFields: ['propertyPreferences'],
        nextStages: ['visits']
    },
    VISITS: {
        id: 'visits',
        name: 'Visitas',
        order: 4,
        description: 'Visitas a imóveis selecionados',
        actions: ['Agendar visitas', 'Recolher feedback', 'Segunda visita'],
        requiredFields: ['visitScheduled'],
        metrics: ['numeroVisitas', 'taxaInteresse'],
        nextStages: ['offer']
    },
    OFFER: {
        id: 'offer',
        name: 'Proposta',
        order: 5,
        description: 'Submissão de proposta',
        actions: ['Preparar proposta', 'Negociar termos', 'Contraproposta'],
        requiredFields: ['offerValue', 'paymentTerms'],
        documents: ['Proposta assinada', 'Comprovativo sinal'],
        nextStages: ['negotiation', 'cpcv']
    },
    NEGOTIATION: {
        id: 'negotiation',
        name: 'Negociação',
        order: 6,
        description: 'Negociação de termos',
        actions: ['Ajustar valor', 'Negociar condições', 'Mediação'],
        nextStages: ['cpcv', 'offer']
    },
    CPCV: {
        id: 'cpcv',
        name: 'CPCV',
        order: 7,
        description: 'Contrato Promessa Compra e Venda',
        actions: ['Preparar CPCV', 'Marcar assinatura', 'Pagamento sinal'],
        requiredFields: ['cpcvDate', 'deposit'],
        documents: ['CPCV assinado', 'Comprovativo pagamento'],
        nextStages: ['deed']
    },
    DEED: {
        id: 'deed',
        name: 'Escritura',
        order: 8,
        description: 'Escritura definitiva',
        actions: ['Agendar escritura', 'Preparar documentos', 'Vistoria final'],
        requiredFields: ['deedDate', 'notary'],
        documents: ['Certidões', 'Licenças', 'Caderneta predial'],
        nextStages: ['closed']
    },
    CLOSED: {
        id: 'closed',
        name: 'Concluído',
        order: 9,
        description: 'Negócio fechado',
        actions: ['Entrega de chaves', 'Pós-venda'],
        isFinal: true
    }
};

export const SELLER_PIPELINE = {
    LEAD: {
        id: 'lead',
        name: 'Angariação',
        order: 1,
        description: 'Contacto inicial do vendedor',
        actions: ['Contactar proprietário', 'Agendar visita avaliação'],
        requiredFields: ['ownerName', 'propertyAddress'],
        nextStages: ['evaluation']
    },
    EVALUATION: {
        id: 'evaluation',
        name: 'Avaliação',
        order: 2,
        description: 'Avaliação do imóvel',
        actions: ['Visita técnica', 'Análise mercado', 'Relatório avaliação'],
        requiredFields: ['propertyDetails', 'marketValue'],
        documents: ['Caderneta predial', 'Certidão permanente'],
        nextStages: ['listing']
    },
    LISTING: {
        id: 'listing',
        name: 'Captação',
        order: 3,
        description: 'Contrato de mediação',
        actions: ['Preparar contrato', 'Definir comissão', 'Assinar AMI'],
        requiredFields: ['listingPrice', 'commission', 'exclusivity'],
        documents: ['Contrato mediação', 'Documentação imóvel'],
        nextStages: ['marketing']
    },
    MARKETING: {
        id: 'marketing',
        name: 'Marketing',
        order: 4,
        description: 'Promoção do imóvel',
        actions: ['Sessão fotos', 'Tour virtual', 'Publicar anúncios', 'Open house'],
        requiredFields: ['photos', 'description', 'marketingPlan'],
        metrics: ['visualizacoes', 'contactos', 'visitas'],
        nextStages: ['showings']
    },
    SHOWINGS: {
        id: 'showings',
        name: 'Visitas',
        order: 5,
        description: 'Mostrar o imóvel',
        actions: ['Agendar visitas', 'Open house', 'Feedback compradores'],
        metrics: ['numeroVisitas', 'taxaInteresse'],
        nextStages: ['offers']
    },
    OFFERS: {
        id: 'offers',
        name: 'Propostas',
        order: 6,
        description: 'Recepção e análise de propostas',
        actions: ['Receber propostas', 'Analisar condições', 'Apresentar ao vendedor'],
        requiredFields: ['offerReceived'],
        nextStages: ['negotiation', 'acceptance']
    },
    NEGOTIATION: {
        id: 'negotiation',
        name: 'Negociação',
        order: 7,
        description: 'Negociação de termos',
        actions: ['Contraproposta', 'Mediação', 'Ajustar condições'],
        nextStages: ['acceptance', 'offers']
    },
    ACCEPTANCE: {
        id: 'acceptance',
        name: 'Aceitação',
        order: 8,
        description: 'Proposta aceite',
        actions: ['Confirmar termos', 'Preparar CPCV'],
        documents: ['Proposta aceite'],
        nextStages: ['cpcv']
    },
    CPCV: {
        id: 'cpcv',
        name: 'CPCV',
        order: 9,
        description: 'Contrato Promessa',
        actions: ['Preparar CPCV', 'Receber sinal', 'Assinar contrato'],
        documents: ['CPCV', 'Comprovativo sinal'],
        nextStages: ['deed']
    },
    DEED: {
        id: 'deed',
        name: 'Escritura',
        order: 10,
        description: 'Escritura definitiva',
        actions: ['Preparar documentos', 'Agendar escritura', 'Liquidar encargos'],
        documents: ['Todos os documentos legais'],
        nextStages: ['closed']
    },
    CLOSED: {
        id: 'closed',
        name: 'Vendido',
        order: 11,
        description: 'Venda concluída',
        actions: ['Entrega chaves', 'Pagamento comissão'],
        isFinal: true
    }
};

export const LANDLORD_PIPELINE = {
    LEAD: {
        id: 'lead',
        name: 'Angariação',
        order: 1,
        description: 'Proprietário interessado em arrendar',
        actions: ['Contactar proprietário', 'Agendar avaliação'],
        nextStages: ['evaluation']
    },
    EVALUATION: {
        id: 'evaluation',
        name: 'Avaliação',
        order: 2,
        description: 'Avaliação para arrendamento',
        actions: ['Definir renda', 'Avaliar condições', 'Necessidades manutenção'],
        requiredFields: ['rentValue', 'availability'],
        nextStages: ['listing']
    },
    LISTING: {
        id: 'listing',
        name: 'Captação',
        order: 3,
        description: 'Contrato gestão arrendamento',
        actions: ['Contrato mediação', 'Definir termos'],
        documents: ['Contrato gestão', 'Documentação imóvel'],
        nextStages: ['marketing']
    },
    MARKETING: {
        id: 'marketing',
        name: 'Marketing',
        order: 4,
        description: 'Promoção para arrendamento',
        actions: ['Fotos', 'Anúncios', 'Screening inquilinos'],
        nextStages: ['showings']
    },
    SHOWINGS: {
        id: 'showings',
        name: 'Visitas',
        order: 5,
        description: 'Mostrar a potenciais inquilinos',
        actions: ['Agendar visitas', 'Verificar requisitos'],
        nextStages: ['applications']
    },
    APPLICATIONS: {
        id: 'applications',
        name: 'Candidaturas',
        order: 6,
        description: 'Análise de candidatos',
        actions: ['Receber candidaturas', 'Verificar referências', 'Análise financeira'],
        documents: ['Comprovativos rendimento', 'Fiador'],
        nextStages: ['selection']
    },
    SELECTION: {
        id: 'selection',
        name: 'Seleção',
        order: 7,
        description: 'Escolha do inquilino',
        actions: ['Aprovar inquilino', 'Negociar condições'],
        nextStages: ['contract']
    },
    CONTRACT: {
        id: 'contract',
        name: 'Contrato',
        order: 8,
        description: 'Contrato de arrendamento',
        actions: ['Preparar contrato', 'Receber caução', 'Assinar contrato'],
        documents: ['Contrato arrendamento', 'Inventário'],
        requiredFields: ['contractStartDate', 'deposit'],
        nextStages: ['active']
    },
    ACTIVE: {
        id: 'active',
        name: 'Ativo',
        order: 9,
        description: 'Arrendamento ativo',
        actions: ['Gestão mensal', 'Cobranças', 'Manutenção'],
        isRecurring: true
    }
};

export const TENANT_PIPELINE = {
    LEAD: {
        id: 'lead',
        name: 'Procura',
        order: 1,
        description: 'Cliente procura arrendamento',
        actions: ['Definir requisitos', 'Estabelecer orçamento'],
        nextStages: ['qualification']
    },
    QUALIFICATION: {
        id: 'qualification',
        name: 'Qualificação',
        order: 2,
        description: 'Verificar capacidade',
        actions: ['Comprovativos rendimento', 'Referências', 'Fiador'],
        documents: ['IRS', 'Recibos vencimento'],
        nextStages: ['search']
    },
    SEARCH: {
        id: 'search',
        name: 'Pesquisa',
        order: 3,
        description: 'Procura de imóveis',
        actions: ['Enviar opções', 'Filtrar por critérios'],
        nextStages: ['visits']
    },
    VISITS: {
        id: 'visits',
        name: 'Visitas',
        order: 4,
        description: 'Visitar imóveis',
        actions: ['Agendar visitas', 'Recolher feedback'],
        nextStages: ['application']
    },
    APPLICATION: {
        id: 'application',
        name: 'Candidatura',
        order: 5,
        description: 'Submeter candidatura',
        actions: ['Preencher formulário', 'Enviar documentos'],
        documents: ['Todos os comprovativos'],
        nextStages: ['approval']
    },
    APPROVAL: {
        id: 'approval',
        name: 'Aprovação',
        order: 6,
        description: 'Aguardar decisão',
        actions: ['Negociar termos', 'Confirmar condições'],
        nextStages: ['contract']
    },
    CONTRACT: {
        id: 'contract',
        name: 'Contrato',
        order: 7,
        description: 'Assinar contrato',
        actions: ['Pagar caução', 'Assinar contrato', 'Vistoria inicial'],
        documents: ['Contrato assinado'],
        nextStages: ['active']
    },
    ACTIVE: {
        id: 'active',
        name: 'Inquilino',
        order: 8,
        description: 'Arrendamento ativo',
        isRecurring: true
    }
};

// ===== HELPERS =====

export const getPipelineByType = (opportunityType) => {
    const pipelines = {
        'comprador': BUYER_PIPELINE,
        'vendedor': SELLER_PIPELINE,
        'senhorio': LANDLORD_PIPELINE,
        'inquilino': TENANT_PIPELINE,
        'investidor': BUYER_PIPELINE // Investidor segue pipeline similar ao comprador
    };
    return pipelines[opportunityType] || BUYER_PIPELINE;
};

export const getStageById = (pipeline, stageId) => {
    return Object.values(pipeline).find(stage => stage.id === stageId);
};

export const getNextStages = (pipeline, currentStageId) => {
    const currentStage = getStageById(pipeline, currentStageId);
    if (!currentStage || !currentStage.nextStages) return [];

    return currentStage.nextStages.map(stageId => getStageById(pipeline, stageId));
};

export const canMoveToStage = (opportunity, targetStageId) => {
    const pipeline = getPipelineByType(opportunity.tipo);
    const currentStage = getStageById(pipeline, opportunity.pipelineStage);

    if (!currentStage) return false;
    if (currentStage.isFinal) return false;

    return currentStage.nextStages.includes(targetStageId);
};

export const getRequiredFieldsForStage = (pipeline, stageId) => {
    const stage = getStageById(pipeline, stageId);
    return stage?.requiredFields || [];
};

export const getStageProgress = (pipeline, currentStageId) => {
    const stages = Object.values(pipeline).filter(s => !s.isRecurring);
    const currentStage = getStageById(pipeline, currentStageId);

    if (!currentStage) return 0;

    return Math.round((currentStage.order / stages.length) * 100);
};

// ===== STAGE COLORS =====

export const STAGE_COLORS = {
    lead: 'gray',
    qualification: 'blue',
    search: 'indigo',
    evaluation: 'purple',
    listing: 'pink',
    marketing: 'orange',
    visits: 'yellow',
    showings: 'amber',
    offers: 'lime',
    offer: 'green',
    applications: 'emerald',
    negotiation: 'teal',
    acceptance: 'cyan',
    selection: 'sky',
    approval: 'blue',
    cpcv: 'violet',
    contract: 'purple',
    deed: 'fuchsia',
    active: 'green',
    closed: 'gray'
};

// ===== AUTOMATION TRIGGERS =====

export const STAGE_AUTOMATIONS = {
    onEnter: {
        visits: ['sendVisitReminder', 'prepareVisitChecklist'],
        offer: ['generateOfferTemplate', 'notifyLegalTeam'],
        cpcv: ['scheduleCPCVMeeting', 'prepareDocuments'],
        deed: ['scheduleNotary', 'finalDocumentCheck'],
        marketing: ['createListing', 'schedulePhotographer']
    },

    onExit: {
        visits: ['collectFeedback', 'updateClientProfile'],
        negotiation: ['logNegotiationHistory', 'updateOfferTerms'],
        showings: ['compileShowingReport', 'rankInterest']
    },

    timeBasedActions: {
        lead: { after: 48, action: 'followUpReminder' },
        offer: { after: 72, action: 'checkOfferStatus' },
        applications: { after: 24, action: 'reviewApplications' }
    }
};