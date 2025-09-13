/**
 * CLIENT SELECTOR COMPONENT - MyImoMatePro
 * Componente para selecionar cliente existente ou criar novo
 * Usado no formulário de oportunidades
 * 
 * Caminho: src/components/ClientSelector.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useClients } from '../contexts/ClientContext';
import {
    MagnifyingGlassIcon,
    UserPlusIcon,
    CheckIcon,
    XMarkIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ClientSelector = ({
    value, // clienteId selecionado
    onChange, // callback quando seleciona cliente
    required = true,
    disabled = false,
    error = null,
    leadData = null // dados da lead para pré-preencher
}) => {
    const { clients, loading, fetchClients, createClient } = useClients();

    // Estados locais
    const [showModal, setShowModal] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [creating, setCreating] = useState(false);

    // Formulário de criação rápida
    const [newClientData, setNewClientData] = useState({
        nome: leadData?.prospect?.name || '',
        telefone: leadData?.prospect?.phone || '',
        email: leadData?.prospect?.email || '',
        nif: '',
        observacoes: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Carregar clientes ao montar
    useEffect(() => {
        if (!clients || clients.length === 0) {
            fetchClients();
        }
    }, []);

    // Carregar cliente selecionado
    useEffect(() => {
        if (value && clients.length > 0) {
            const client = clients.find(c => c.id === value);
            setSelectedClient(client);
        }
    }, [value, clients]);

    // Pré-preencher com dados da lead
    useEffect(() => {
        if (leadData && !value) {
            setNewClientData({
                nome: leadData.prospect?.name || '',
                telefone: leadData.prospect?.phone || '',
                email: leadData.prospect?.email || '',
                nif: '',
                observacoes: `Cliente criado a partir de Lead\nFonte: ${leadData.source?.origin || 'N/A'}`
            });
        }
    }, [leadData]);

    // Filtrar clientes pela busca
    const filteredClients = clients.filter(client => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            client.nome?.toLowerCase().includes(search) ||
            client.telefone?.includes(search) ||
            client.email?.toLowerCase().includes(search) ||
            client.nif?.includes(search)
        );
    });

    // Selecionar cliente
    const handleSelectClient = (client) => {
        setSelectedClient(client);
        onChange(client.id);
        setShowModal(false);
        setSearchTerm('');
    };

    // Validar formulário de criação
    const validateNewClient = () => {
        const errors = {};

        if (!newClientData.nome?.trim()) {
            errors.nome = 'Nome é obrigatório';
        }

        if (!newClientData.telefone?.trim()) {
            errors.telefone = 'Telefone é obrigatório';
        } else if (!/^[0-9+\s-()]+$/.test(newClientData.telefone)) {
            errors.telefone = 'Telefone inválido';
        }

        if (newClientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)) {
            errors.email = 'Email inválido';
        }

        if (newClientData.nif && !/^\d{9}$/.test(newClientData.nif)) {
            errors.nif = 'NIF deve ter 9 dígitos';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Criar novo cliente
    const handleCreateClient = async () => {
        if (!validateNewClient()) return;

        setCreating(true);
        try {
            const result = await createClient(newClientData);

            if (result.success) {
                // Selecionar o cliente criado
                handleSelectClient(result.data);

                // Limpar formulário
                setNewClientData({
                    nome: '',
                    telefone: '',
                    email: '',
                    nif: '',
                    observacoes: ''
                });
                setShowCreateForm(false);

                // Feedback de sucesso
                console.log('Cliente criado com sucesso:', result.data);
            } else {
                setFormErrors({ submit: result.error || 'Erro ao criar cliente' });
            }
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            setFormErrors({ submit: 'Erro ao criar cliente' });
        } finally {
            setCreating(false);
        }
    };

    // Limpar seleção
    const handleClearSelection = () => {
        setSelectedClient(null);
        onChange(null);
    };

    return (
        <>
            {/* Campo de seleção */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente {required && <span className="text-red-500">*</span>}
                </label>

                {selectedClient ? (
                    // Cliente selecionado
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{selectedClient.nome}</p>
                                <p className="text-sm text-gray-500">
                                    {selectedClient.telefone} • {selectedClient.email || 'Sem email'}
                                </p>
                            </div>
                        </div>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    // Botão para selecionar
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        disabled={disabled}
                        className={`w-full p-3 border rounded-lg text-left flex items-center justify-between
                            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-blue-500 cursor-pointer'}
                            ${error ? 'border-red-300' : 'border-gray-300'}`}
                    >
                        <span className="text-gray-500">
                            {leadData ? 'Criar cliente a partir da lead' : 'Selecionar ou criar cliente'}
                        </span>
                        <UserPlusIcon className="w-5 h-5 text-gray-400" />
                    </button>
                )}

                {error && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        {error}
                    </p>
                )}
            </div>

            {/* Modal de seleção/criação */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />

                        <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {showCreateForm ? 'Criar Novo Cliente' : 'Selecionar Cliente'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setShowCreateForm(false);
                                            setSearchTerm('');
                                        }}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="px-6 py-4">
                                {showCreateForm ? (
                                    // Formulário de criação
                                    <div className="space-y-4">
                                        {formErrors.submit && (
                                            <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                                                {formErrors.submit}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nome *
                                            </label>
                                            <input
                                                type="text"
                                                value={newClientData.nome}
                                                onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                                                    ${formErrors.nome ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Nome completo"
                                            />
                                            {formErrors.nome && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Telefone *
                                            </label>
                                            <input
                                                type="tel"
                                                value={newClientData.telefone}
                                                onChange={(e) => setNewClientData({ ...newClientData, telefone: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                                                    ${formErrors.telefone ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="912345678"
                                            />
                                            {formErrors.telefone && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.telefone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={newClientData.email}
                                                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                                                    ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="email@exemplo.com"
                                            />
                                            {formErrors.email && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                NIF
                                            </label>
                                            <input
                                                type="text"
                                                value={newClientData.nif}
                                                onChange={(e) => setNewClientData({ ...newClientData, nif: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                                                    ${formErrors.nif ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="123456789"
                                                maxLength="9"
                                            />
                                            {formErrors.nif && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.nif}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Observações
                                            </label>
                                            <textarea
                                                value={newClientData.observacoes}
                                                onChange={(e) => setNewClientData({ ...newClientData, observacoes: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                rows="3"
                                                placeholder="Notas sobre o cliente..."
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    // Lista de clientes
                                    <div>
                                        {/* Barra de busca */}
                                        <div className="mb-4">
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Buscar por nome, telefone, email ou NIF..."
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {/* Lista de clientes */}
                                        <div className="max-h-96 overflow-y-auto">
                                            {loading.list ? (
                                                <div className="text-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                    <p className="mt-2 text-gray-500">Carregando clientes...</p>
                                                </div>
                                            ) : filteredClients.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Nenhum cliente encontrado' : 'Sem clientes cadastrados'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {filteredClients.map(client => (
                                                        <button
                                                            key={client.id}
                                                            onClick={() => handleSelectClient(client)}
                                                            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                                        <UserIcon className="w-5 h-5 text-gray-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{client.nome}</p>
                                                                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                                                                            <span className="flex items-center">
                                                                                <PhoneIcon className="w-3 h-3 mr-1" />
                                                                                {client.telefone}
                                                                            </span>
                                                                            {client.email && (
                                                                                <span className="flex items-center">
                                                                                    <EnvelopeIcon className="w-3 h-3 mr-1" />
                                                                                    {client.email}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <CheckIcon className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50">
                                <div className="flex justify-between">
                                    {showCreateForm ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateForm(false)}
                                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                            >
                                                Voltar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreateClient}
                                                disabled={creating}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                {creating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Criando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckIcon className="w-5 h-5 mr-2" />
                                                        Criar Cliente
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateForm(true);
                                                    // Pré-preencher com dados da lead se existir
                                                    if (leadData) {
                                                        setNewClientData({
                                                            nome: leadData.prospect?.name || '',
                                                            telefone: leadData.prospect?.phone || '',
                                                            email: leadData.prospect?.email || '',
                                                            nif: '',
                                                            observacoes: `Cliente criado a partir de Lead\nFonte: ${leadData.source?.origin || 'N/A'}`
                                                        });
                                                    }
                                                }}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                            >
                                                <UserPlusIcon className="w-5 h-5 mr-2" />
                                                Criar Novo Cliente
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClientSelector;