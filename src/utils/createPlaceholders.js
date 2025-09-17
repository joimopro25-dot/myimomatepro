/**
 * CREATE PLACEHOLDERS - MyImoMatePro
 * Script para criar automaticamente componentes placeholder faltantes
 * 
 * COMO USAR:
 * 1. Execute este arquivo no terminal: node src/utils/createPlaceholders.js
 * 2. Ou importe e execute no console: import('./src/utils/createPlaceholders.js')
 * 3. Os arquivos serão criados automaticamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '../..');

// Componentes placeholder necessários
const PLACEHOLDER_COMPONENTS = {
    'BasicInfoTab': {
        path: 'src/components/opportunities/tabs/BasicInfoTab.jsx',
        content: `/**
 * BASIC INFO TAB - MyImoMatePro
 * Tab de informações básicas da oportunidade - Versão simplificada
 * 
 * Caminho: src/components/opportunities/tabs/BasicInfoTab.jsx
 */

import React from 'react';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS
} from '../../../models/opportunityModel';
import { InformationCircleIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

const BasicInfoTab = ({ data = {}, onChange, isEditing = false, clientData = {} }) => {
    const handleChange = (field, value) => {
        const newData = { ...data, [field]: value };
        onChange(newData);
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    Informações do Cliente: {clientData.nome || 'Cliente'}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Oportunidade
                    </label>
                    <select
                        value={data.tipo || ''}
                        onChange={(e) => handleChange('tipo', e.target.value)}
                        disabled={isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Selecione...</option>
                        {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                    </label>
                    <select
                        value={data.estado || OPPORTUNITY_STATES.LEAD}
                        onChange={(e) => handleChange('estado', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        {Object.entries(OPPORTUNITY_STATE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Oportunidade
                </label>
                <input
                    type="text"
                    value={data.titulo || ''}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Compra de T3 em Lisboa"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                </label>
                <textarea
                    value={data.descricao || ''}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Descreva os requisitos do cliente..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyEuroIcon className="w-4 h-4 inline mr-1" />
                    Valor Estimado
                </label>
                <input
                    type="number"
                    value={data.valorEstimado || ''}
                    onChange={(e) => handleChange('valorEstimado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                />
            </div>
        </div>
    );
};

export default BasicInfoTab;`
    },

    'VisitsTab': {
        path: 'src/components/opportunities/tabs/VisitsTab.jsx',
        content: `/**
 * VISITS TAB - MyImoMatePro
 * Tab de gestão de visitas - Versão placeholder
 * 
 * Caminho: src/components/opportunities/tabs/VisitsTab.jsx
 */

import React from 'react';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

const VisitsTab = ({ data = [], onChange, properties = [] }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" />
                        Gestão de Visitas
                    </h3>
                    <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agendar Visita
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">0</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <div className="text-xs text-gray-500">Agendadas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-xs text-gray-500">Realizadas</div>
                    </div>
                </div>

                <div className="text-center text-gray-500 py-12">
                    <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg mb-2">Sem visitas agendadas</p>
                    <p className="text-sm">Clique em "Agendar Visita" para começar</p>
                </div>
            </div>
        </div>
    );
};

export default VisitsTab;`
    },

    'TasksTab': {
        path: 'src/components/opportunities/tabs/TasksTab.jsx',
        content: `/**
 * TASKS TAB - MyImoMatePro
 * Tab de gestão de tarefas - Versão placeholder
 * 
 * Caminho: src/components/opportunities/tabs/TasksTab.jsx
 */

import React from 'react';
import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';

const TasksTab = ({ data = [], onChange }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                        Gestão de Tarefas
                    </h3>
                    <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Nova Tarefa
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">0</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <div className="text-xs text-gray-500">Pendentes</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-xs text-gray-500">Em Progresso</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-xs text-gray-500">Concluídas</div>
                    </div>
                </div>

                <div className="text-center text-gray-500 py-12">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg mb-2">Sem tarefas criadas</p>
                    <p className="text-sm">Clique em "Nova Tarefa" para começar</p>
                </div>
            </div>
        </div>
    );
};

export default TasksTab;`
    }
};

// Função para criar os arquivos
function createPlaceholders() {
    console.log('🚀 Criando componentes placeholder...\n');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    Object.entries(PLACEHOLDER_COMPONENTS).forEach(([name, config]) => {
        const fullPath = path.join(projectRoot, config.path);
        const dir = path.dirname(fullPath);

        try {
            // Verificar se o arquivo já existe
            if (fs.existsSync(fullPath)) {
                console.log(`⏭️  ${name} já existe - pulando`);
                skipped++;
                return;
            }

            // Criar diretório se não existir
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Diretório criado: ${dir}`);
            }

            // Criar arquivo
            fs.writeFileSync(fullPath, config.content);
            console.log(`✅ ${name} criado com sucesso`);
            created++;

        } catch (error) {
            console.error(`❌ Erro ao criar ${name}: ${error.message}`);
            errors++;
        }
    });

    // Resumo
    console.log('\n📊 RESUMO');
    console.log('=========');
    console.log(`✅ Criados: ${created}`);
    console.log(`⏭️  Pulados: ${skipped}`);
    console.log(`❌ Erros: ${errors}`);

    if (created > 0) {
        console.log('\n🎉 Placeholders criados com sucesso!');
        console.log('Agora você pode executar: npm run dev');
    }

    return { created, skipped, errors };
}

// Executar se chamado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    createPlaceholders();
}

export { createPlaceholders, PLACEHOLDER_COMPONENTS };