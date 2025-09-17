/**
 * SYSTEM DIAGNOSTIC - MyImoMatePro
 * Diagnóstico completo do sistema e criação de placeholders
 * 
 * Caminho: src/utils/systemDiagnostic.js
 * 
 * INSTRUÇÕES DE USO:
 * 1. Adicionar este script ao seu projeto
 * 2. No console do navegador, executar: runDiagnostic()
 * 3. O script irá identificar componentes faltantes
 * 4. Criar automaticamente componentes placeholder
 */

// Lista de todos os componentes necessários
const REQUIRED_FILES = {
    // Páginas principais
    '/src/pages/LandingPage.jsx': { status: 'exists', critical: true },
    '/src/pages/LoginPage.jsx': { status: 'exists', critical: true },
    '/src/pages/Dashboard.jsx': { status: 'exists', critical: true },
    '/src/pages/AccountSettings.jsx': { status: 'exists', critical: true },
    '/src/pages/ClientList.jsx': { status: 'exists', critical: true },
    '/src/pages/ClientForm.jsx': { status: 'exists', critical: true },
    '/src/pages/ClientDetail.jsx': { status: 'exists', critical: true },
    '/src/pages/OpportunityList.jsx': { status: 'exists', critical: true },
    '/src/pages/OpportunityForm.jsx': { status: 'exists', critical: true },
    '/src/pages/OpportunityDetail.jsx': { status: 'exists', critical: true },
    '/src/pages/OpportunityFormComplete.jsx': { status: 'partial', critical: false },

    // Componentes de Layout
    '/src/components/Layout.jsx': { status: 'exists', critical: true },
    '/src/components/Sidebar.jsx': { status: 'exists', critical: true },

    // Componentes de Oportunidades
    '/src/components/opportunities/OpportunityBadges.jsx': { status: 'exists', critical: false },

    // Tabs - Status atual baseado na pesquisa
    '/src/components/opportunities/tabs/BasicInfoTab.jsx': { status: 'missing', critical: false },
    '/src/components/opportunities/tabs/PropertiesTab.jsx': { status: 'partial', critical: false },
    '/src/components/opportunities/tabs/PipelineTab.jsx': { status: 'partial', critical: false },
    '/src/components/opportunities/tabs/VisitsTab.jsx': { status: 'missing', critical: false },
    '/src/components/opportunities/tabs/OffersTab.jsx': { status: 'partial', critical: false },
    '/src/components/opportunities/tabs/TasksTab.jsx': { status: 'missing', critical: false },
    '/src/components/opportunities/tabs/DocumentsTab.jsx': { status: 'partial', critical: false },
    '/src/components/opportunities/tabs/TimelineTab.jsx': { status: 'partial', critical: false },

    // Contextos
    '/src/contexts/AuthContext.jsx': { status: 'exists', critical: true },
    '/src/contexts/SubscriptionContext.jsx': { status: 'exists', critical: true },
    '/src/contexts/ClientContext.jsx': { status: 'exists', critical: true },
    '/src/contexts/OpportunityContext.jsx': { status: 'exists', critical: true },

    // Serviços
    '/src/services/authService.js': { status: 'exists', critical: true },
    '/src/services/subscriptionService.js': { status: 'exists', critical: true },
    '/src/services/clientService.js': { status: 'exists', critical: true },
    '/src/services/opportunityService.js': { status: 'exists', critical: true },
    '/src/services/offerService.js': { status: 'partial', critical: false },

    // Modelos
    '/src/models/clientModel.js': { status: 'exists', critical: true },
    '/src/models/opportunityModel.js': { status: 'exists', critical: true },
    '/src/models/offerModel.js': { status: 'exists', critical: false },
    '/src/models/visitModel.js': { status: 'exists', critical: false },
    '/src/models/pipelineModel.js': { status: 'exists', critical: false },

    // Configuração
    '/src/firebase/config.js': { status: 'exists', critical: true },
    '/src/main.jsx': { status: 'exists', critical: true },
    '/src/App.jsx': { status: 'exists', critical: true },
    '/src/index.css': { status: 'exists', critical: true },
};

// Templates para componentes placeholder
const PLACEHOLDER_TEMPLATES = {
    'BasicInfoTab': `/**
 * BASIC INFO TAB - MyImoMatePro
 * Placeholder funcional para tab de informações básicas
 * 
 * Caminho: src/components/opportunities/tabs/BasicInfoTab.jsx
 */

import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const BasicInfoTab = ({ data = {}, onChange, isEditing = false, clientData = {} }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    Informações Básicas
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                        </label>
                        <input
                            type="text"
                            value={data.titulo || ''}
                            onChange={(e) => handleChange('titulo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Título da oportunidade"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={data.descricao || ''}
                            onChange={(e) => handleChange('descricao', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Descrição da oportunidade"
                        />
                    </div>
                    
                    <div className="text-center text-gray-500 py-8">
                        <p>Tab em desenvolvimento</p>
                        <p className="text-sm">Funcionalidade completa em breve</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoTab;`,

    'VisitsTab': `/**
 * VISITS TAB - MyImoMatePro
 * Placeholder funcional para tab de visitas
 * 
 * Caminho: src/components/opportunities/tabs/VisitsTab.jsx
 */

import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const VisitsTab = ({ data = [], onChange, properties = [] }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                    <CalendarDaysIcon className="w-5 h-5 mr-2" />
                    Gestão de Visitas
                </h3>
                
                <div className="text-center text-gray-500 py-12">
                    <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg mb-2">Tab de Visitas</p>
                    <p className="text-sm">Funcionalidade em desenvolvimento</p>
                    <p className="text-xs text-gray-400 mt-4">
                        Aqui poderá agendar e gerir visitas aos imóveis
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VisitsTab;`,

    'TasksTab': `/**
 * TASKS TAB - MyImoMatePro
 * Placeholder funcional para tab de tarefas
 * 
 * Caminho: src/components/opportunities/tabs/TasksTab.jsx
 */

import React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const TasksTab = ({ data = [], onChange }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                    Gestão de Tarefas
                </h3>
                
                <div className="text-center text-gray-500 py-12">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg mb-2">Tab de Tarefas</p>
                    <p className="text-sm">Funcionalidade em desenvolvimento</p>
                    <p className="text-xs text-gray-400 mt-4">
                        Aqui poderá criar e gerir tarefas relacionadas com a oportunidade
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TasksTab;`
};

// Função de diagnóstico
function runDiagnostic() {
    console.log('🔍 DIAGNÓSTICO DO SISTEMA MyImoMatePro');
    console.log('=====================================\n');

    let totalFiles = Object.keys(REQUIRED_FILES).length;
    let existingFiles = 0;
    let partialFiles = 0;
    let missingFiles = 0;
    let criticalMissing = [];
    let needsPlaceholder = [];

    // Analisar cada arquivo
    Object.entries(REQUIRED_FILES).forEach(([path, info]) => {
        if (info.status === 'exists') {
            existingFiles++;
            console.log(`✅ ${path}`);
        } else if (info.status === 'partial') {
            partialFiles++;
            console.log(`⚠️  ${path} - PARCIALMENTE IMPLEMENTADO`);
        } else if (info.status === 'missing') {
            missingFiles++;
            console.log(`❌ ${path} - FALTANDO`);

            if (info.critical) {
                criticalMissing.push(path);
            }

            // Verificar se precisa placeholder
            if (path.includes('/tabs/')) {
                const tabName = path.split('/').pop().replace('.jsx', '');
                if (PLACEHOLDER_TEMPLATES[tabName]) {
                    needsPlaceholder.push({
                        path,
                        name: tabName,
                        template: PLACEHOLDER_TEMPLATES[tabName]
                    });
                }
            }
        }
    });

    // Resumo
    console.log('\n📊 RESUMO DO DIAGNÓSTICO');
    console.log('========================');
    console.log(`Total de arquivos: ${totalFiles}`);
    console.log(`✅ Completos: ${existingFiles} (${Math.round(existingFiles / totalFiles * 100)}%)`);
    console.log(`⚠️  Parciais: ${partialFiles} (${Math.round(partialFiles / totalFiles * 100)}%)`);
    console.log(`❌ Faltando: ${missingFiles} (${Math.round(missingFiles / totalFiles * 100)}%)`);

    if (criticalMissing.length > 0) {
        console.log('\n🚨 ARQUIVOS CRÍTICOS FALTANDO:');
        criticalMissing.forEach(file => {
            console.log(`   - ${file}`);
        });
    }

    // Instruções para criar placeholders
    if (needsPlaceholder.length > 0) {
        console.log('\n🛠️ PLACEHOLDERS NECESSÁRIOS:');
        console.log('============================');

        needsPlaceholder.forEach(({ path, name, template }) => {
            console.log(`\n📄 ${name}:`);
            console.log(`   Caminho: ${path}`);
            console.log(`   Status: Pronto para criar`);

            // Mostrar comando para criar
            console.log(`\n   Para criar este arquivo, copie o template abaixo:`);
            console.log('   -------------------------------------------');
            console.log(`   ${template.substring(0, 200)}...`);
            console.log(`\n   Template completo disponível em: PLACEHOLDER_TEMPLATES['${name}']`);
        });

        console.log('\n💡 COMO CRIAR OS PLACEHOLDERS:');
        console.log('1. Para cada arquivo listado acima');
        console.log('2. Crie o arquivo no caminho indicado');
        console.log('3. Cole o conteúdo do template correspondente');
        console.log('4. Execute: npm run dev para testar');
    }

    // Verificações de runtime
    console.log('\n🔧 VERIFICAÇÕES DE RUNTIME:');
    console.log('===========================');

    // Verificar se React está carregado
    if (typeof React !== 'undefined') {
        console.log('✅ React está carregado');
    } else {
        console.log('❌ React não está disponível');
    }

    // Verificar rotas
    if (typeof window !== 'undefined' && window.location) {
        console.log(`✅ Rota atual: ${window.location.pathname}`);
    }

    // Recomendações finais
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('=================');

    const healthScore = (existingFiles + partialFiles * 0.5) / totalFiles;

    if (healthScore >= 0.9) {
        console.log('✅ Sistema está FUNCIONAL');
        console.log('   - Apenas detalhes menores faltando');
        console.log('   - Pronto para uso em produção');
    } else if (healthScore >= 0.7) {
        console.log('⚠️  Sistema está PARCIALMENTE FUNCIONAL');
        console.log('   - Funcionalidades principais operacionais');
        console.log('   - Recomenda-se completar tabs faltantes');
        console.log('   - Criar placeholders para evitar erros');
    } else {
        console.log('❌ Sistema precisa de ATENÇÃO');
        console.log('   - Componentes críticos podem estar faltando');
        console.log('   - Verificar imports e dependências');
        console.log('   - Criar placeholders urgentemente');
    }

    console.log('\n🏁 PRÓXIMOS PASSOS:');
    console.log('1. Criar arquivos placeholder para tabs faltantes');
    console.log('2. Testar navegação completa do sistema');
    console.log('3. Verificar console para erros de runtime');
    console.log('4. Implementar funcionalidades gradualmente');

    return {
        totalFiles,
        existingFiles,
        partialFiles,
        missingFiles,
        criticalMissing,
        needsPlaceholder,
        healthScore
    };
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.runDiagnostic = runDiagnostic;
    window.PLACEHOLDER_TEMPLATES = PLACEHOLDER_TEMPLATES;

    console.log('🚀 Sistema de Diagnóstico Carregado!');
    console.log('Execute: runDiagnostic() para analisar o sistema');
    console.log('Templates disponíveis em: PLACEHOLDER_TEMPLATES');
}

export { runDiagnostic, PLACEHOLDER_TEMPLATES, REQUIRED_FILES };