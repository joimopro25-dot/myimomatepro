import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegistoModal from '../components/RegistoModal';
import {
    BuildingOfficeIcon,
    CheckIcon,
    StarIcon,
    ChartBarIcon,
    UsersIcon,
    CogIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const planos = [
    {
        nome: 'Rookie',
        preco: '5',
        precoAnual: '50',
        periodo: 'mês',
        descricao: 'Perfeito para consultores iniciantes',
        limiteClientes: 50,
        limiteVolumeNegocios: 25000,
        features: [
            'Todas as funcionalidades',
            'Até 50 clientes',
            'Volume máximo: €25.000',
            'Suporte por email',
            'Dashboard completo',
            'Todos os tipos de oportunidades',
            'Deals plenos'
        ],
        popular: false,
        cor: 'from-gray-500 to-gray-600'
    },
    {
        nome: 'Professional',
        preco: '9',
        precoAnual: '90',
        periodo: 'mês',
        descricao: 'Ideal para consultores experientes',
        limiteClientes: 200,
        limiteVolumeNegocios: 100000,
        features: [
            'Todas as funcionalidades',
            'Até 200 clientes',
            'Volume máximo: €100.000',
            'Suporte prioritário',
            'Relatórios avançados',
            'Automações completas',
            'Integrações incluídas'
        ],
        popular: true,
        cor: 'from-primary-500 to-primary-600'
    },
    {
        nome: 'Shark',
        preco: '25',
        precoAnual: '250',
        periodo: 'mês',
        descricao: 'Para consultores de elite sem limites',
        limiteClientes: 'unlimited',
        limiteVolumeNegocios: 'unlimited',
        features: [
            'Todas as funcionalidades',
            'Clientes ilimitados',
            'Volume ilimitado',
            'Suporte dedicado',
            'API personalizada',
            'Formação personalizada',
            'Integrações custom'
        ],
        popular: false,
        cor: 'from-secondary-500 to-secondary-600'
    }
];

export default function LandingPage() {
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [modalRegistoAberto, setModalRegistoAberto] = useState(false);

    const handleEscolherPlano = (plano) => {
        setPlanoSelecionado(plano);
        setModalRegistoAberto(true);
    };

    const fecharModalRegisto = () => {
        setModalRegistoAberto(false);
        setPlanoSelecionado(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">MyImoMatePro</span>
                        </div>
                        <Link
                            to="/login"
                            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                        >
                            Já tem conta? Entrar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            O CRM que
                            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                {" "}revoluciona
                            </span>
                            <br />
                            o seu negócio imobiliário
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                            Gerir clientes, leads, oportunidades e deals nunca foi tão simples e poderoso.
                            Transforme cada contacto numa oportunidade de sucesso.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <button
                                onClick={() => handleEscolherPlano(planos.find(p => p.popular))}
                                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
                            >
                                Começar Gratuitamente
                            </button>
                            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
                                Ver Demonstração
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Tudo o que precisa num só lugar
                        </h2>
                        <p className="text-xl text-gray-300">
                            Funcionalidades pensadas especificamente para consultores imobiliários
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-6">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Gestão de Clientes</h3>
                            <p className="text-gray-400">
                                Cliente no centro de tudo. Gerir compradores, vendedores, investidores, senhorios e inquilinos numa plataforma única.
                            </p>
                        </div>

                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center mb-6">
                                <ChartBarIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Deals Inteligentes</h3>
                            <p className="text-gray-400">
                                Sistema único de "deals plenos" - conecte vendedores e compradores automaticamente para maximizar comissões.
                            </p>
                        </div>

                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-6">
                                <CogIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Automação Total</h3>
                            <p className="text-gray-400">
                                Lembretes automáticos, follow-ups inteligentes e pipelines personalizados para cada tipo de negócio.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Escolha o seu plano
                        </h2>
                        <p className="text-xl text-gray-300">
                            Planos desenhados para crescer consigo
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {planos.map((plano) => (
                            <div
                                key={plano.nome}
                                className={`bg-gray-800 rounded-2xl border-2 transition-all duration-200 relative ${plano.popular
                                    ? 'border-primary-500 transform scale-105'
                                    : 'border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                {plano.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                                            Mais Popular
                                        </div>
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${plano.cor} rounded-lg flex items-center justify-center mb-6`}>
                                        <StarIcon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2">{plano.nome}</h3>
                                    <p className="text-gray-400 mb-6">{plano.descricao}</p>

                                    <div className="flex items-baseline mb-8">
                                        <span className="text-5xl font-bold text-white">€{plano.preco}</span>
                                        <span className="text-gray-400 ml-2">/{plano.periodo}</span>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plano.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-300">
                                                <CheckIcon className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleEscolherPlano(plano)}
                                        className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${plano.popular
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                                            : 'border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                                            }`}
                                    >
                                        <span>Escolher {plano.nome}</span>
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">MyImoMatePro</span>
                    </div>
                    <p className="text-gray-400">
                        © 2025 MyImoMatePro. Desenvolvido para consultores imobiliários de excelência.
                    </p>
                </div>
            </footer>

            {/* Modal de Registo */}
            <RegistoModal
                isOpen={modalRegistoAberto}
                onClose={fecharModalRegisto}
                planoSelecionado={planoSelecionado}
            />
        </div>
    );
}