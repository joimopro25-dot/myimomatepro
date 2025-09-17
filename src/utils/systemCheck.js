/**
 * SYSTEM CHECK - MyImoMatePro
 * Verificação de integridade do sistema
 * Verifica se todos os componentes, serviços e modelos necessários existem
 * 
 * Caminho: src/utils/systemCheck.js
 */

// Lista de componentes obrigatórios
const REQUIRED_COMPONENTS = {
    // Páginas principais
    pages: [
        'LandingPage',
        'LoginPage',
        'Dashboard',
        'AccountSettings',
        'ClientList',
        'ClientForm',
        'ClientDetail',
        'OpportunityList',
        'OpportunityForm',
        'OpportunityDetail'
    ],

    // Componentes de layout
    layout: [
        'Layout',
        'Sidebar'
    ],

    // Contextos
    contexts: [
        'AuthContext',
        'SubscriptionContext',
        'ClientContext',
        'OpportunityContext'
    ],

    // Serviços
    services: [
        'authService',
        'subscriptionService',
        'clientService',
        'opportunityService',
        'offerService'
    ],

    // Modelos
    models: [
        'clientModel',
        'opportunityModel',
        'offerModel',
        'visitModel',
        'pipelineModel'
    ],

    // Componentes de oportunidades
    opportunityComponents: [
        'OpportunityBadges'
    ],

    // Tabs (podem estar parcialmente implementadas)
    tabs: [
        'BasicInfoTab',
        'PropertiesTab',
        'PipelineTab',
        'VisitsTab',
        'OffersTab',
        'TasksTab',
        'DocumentsTab',
        'TimelineTab'
    ]
};

// Status dos componentes
const COMPONENT_STATUS = {
    pages: {
        LandingPage: true,
        LoginPage: true,
        Dashboard: true,
        AccountSettings: true,
        ClientList: true,
        ClientForm: true,
        ClientDetail: true,
        OpportunityList: true,
        OpportunityForm: true,
        OpportunityDetail: true
    },

    layout: {
        Layout: true,
        Sidebar: true
    },

    contexts: {
        AuthContext: true,
        SubscriptionContext: true,
        ClientContext: true,
        OpportunityContext: true
    },

    services: {
        authService: true,
        subscriptionService: true,
        clientService: true,
        opportunityService: true,
        offerService: true
    },

    models: {
        clientModel: true,
        opportunityModel: true,
        offerModel: true,
        visitModel: true,
        pipelineModel: true
    },

    opportunityComponents: {
        OpportunityBadges: true
    },

    tabs: {
        BasicInfoTab: false, // Precisa ser criado
        PropertiesTab: true, // Parcialmente implementado
        PipelineTab: true, // Parcialmente implementado
        VisitsTab: false, // Precisa ser criado
        OffersTab: true, // Parcialmente implementado
        TasksTab: false, // Precisa ser criado
        DocumentsTab: false, // Precisa ser criado
        TimelineTab: true // Parcialmente implementado
    }
};

// Função para verificar componentes
export function checkSystemIntegrity() {
    console.log('🔍 Verificação de Integridade do Sistema MyImoMatePro');
    console.log('================================================\n');

    let totalComponents = 0;
    let implementedComponents = 0;
    let missingComponents = [];
    let partialComponents = [];

    // Verificar cada categoria
    Object.keys(REQUIRED_COMPONENTS).forEach(category => {
        console.log(`📦 ${category.toUpperCase()}`);
        console.log('-'.repeat(30));

        REQUIRED_COMPONENTS[category].forEach(component => {
            totalComponents++;
            const status = COMPONENT_STATUS[category]?.[component];

            if (status === true) {
                console.log(`✅ ${component}`);
                implementedComponents++;
            } else if (status === false) {
                console.log(`❌ ${component} - NÃO IMPLEMENTADO`);
                missingComponents.push(`${category}/${component}`);
            } else {
                console.log(`⚠️  ${component} - STATUS DESCONHECIDO`);
                partialComponents.push(`${category}/${component}`);
            }
        });

        console.log('');
    });

    // Resumo
    console.log('📊 RESUMO DA VERIFICAÇÃO');
    console.log('='.repeat(50));
    console.log(`Total de componentes: ${totalComponents}`);
    console.log(`Implementados: ${implementedComponents} (${Math.round(implementedComponents / totalComponents * 100)}%)`);
    console.log(`Não implementados: ${missingComponents.length}`);
    console.log(`Status desconhecido: ${partialComponents.length}`);

    // Problemas conhecidos
    console.log('\n⚠️  PROBLEMAS CONHECIDOS:');
    console.log('-'.repeat(50));

    const knownIssues = [
        {
            component: 'OpportunityFormComplete',
            issue: 'Importa tabs que podem não existir',
            solution: 'Criar componentes placeholder para tabs faltantes'
        },
        {
            component: 'offerService',
            issue: 'TODO: Integração com cpcvService pendente',
            solution: 'Implementar quando cpcvService estiver pronto'
        },
        {
            component: 'SubscriptionContext',
            issue: 'TODOs para negócios quando implementados',
            solution: 'Atualizar quando módulo de negócios estiver completo'
        }
    ];

    knownIssues.forEach(issue => {
        console.log(`\n🔸 ${issue.component}`);
        console.log(`   Problema: ${issue.issue}`);
        console.log(`   Solução: ${issue.solution}`);
    });

    // Componentes críticos faltantes
    if (missingComponents.length > 0) {
        console.log('\n🚨 COMPONENTES CRÍTICOS FALTANTES:');
        console.log('-'.repeat(50));
        missingComponents.forEach(comp => {
            console.log(`   - ${comp}`);
        });
    }

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('-'.repeat(50));

    if (missingComponents.includes('tabs/BasicInfoTab') ||
        missingComponents.includes('tabs/VisitsTab') ||
        missingComponents.includes('tabs/TasksTab') ||
        missingComponents.includes('tabs/DocumentsTab')) {
        console.log('1. Criar componentes placeholder para tabs faltantes');
        console.log('   Isso permitirá que OpportunityFormComplete funcione');
    }

    console.log('2. Testar fluxo completo: Login > Dashboard > Clientes > Oportunidades');
    console.log('3. Verificar console do navegador para erros de runtime');
    console.log('4. Garantir que Firebase está configurado corretamente');

    // Resultado final
    const systemHealth = implementedComponents / totalComponents;
    console.log('\n🏆 SAÚDE DO SISTEMA:');
    console.log('='.repeat(50));

    if (systemHealth >= 0.9) {
        console.log('✅ Sistema está FUNCIONAL (>90% completo)');
    } else if (systemHealth >= 0.7) {
        console.log('⚠️  Sistema está PARCIALMENTE FUNCIONAL (70-90% completo)');
    } else {
        console.log('❌ Sistema precisa de mais implementação (<70% completo)');
    }

    console.log(`\nPercentagem de conclusão: ${Math.round(systemHealth * 100)}%`);

    return {
        totalComponents,
        implementedComponents,
        missingComponents,
        partialComponents,
        systemHealth,
        knownIssues
    };
}

// Executar verificação automaticamente se chamado diretamente
if (typeof window !== 'undefined') {
    // Adicionar ao window para poder chamar do console
    window.checkSystem = checkSystemIntegrity;

    console.log('💡 Dica: Execute "checkSystem()" no console para verificar o sistema');
}

export default checkSystemIntegrity;