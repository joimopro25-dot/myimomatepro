/**
 * LANDING PAGE - MyImoMatePro
 * Página inicial com planos de subscrição
 * ✅ TEMA CORPORATE GLAMOUR APLICADO
 * 
 * Caminho: src/pages/LandingPage.jsx
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegistoModal from '../components/RegistoModal';
import {
    BuildingOfficeIcon,
    CheckIcon,
    ArrowRightIcon,
    ChartBarIcon,
    UserGroupIcon,
    CurrencyEuroIcon,
    SparklesIcon,
    RocketLaunchIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
    const [modalRegistoAberto, setModalRegistoAberto] = useState(false);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);

    const planos = [
        {
            nome: 'Rookie',
            preco: '5',
            precoAnual: '50',
            limiteClientes: 50,
            features: [
                'Até 50 clientes',
                'Gestão básica de leads',
                '3 tipos de oportunidades',
                'Relatórios básicos',
                'Suporte por email'
            ]
        },
        {
            nome: 'Professional',
            preco: '9',
            precoAnual: '90',
            limiteClientes: 200,
            features: [
                'Até 200 clientes',
                'Todos os tipos de oportunidades',
                'Deals plenos',
                'Automações avançadas',
                'Relatórios completos',
                'Suporte prioritário'
            ]
        },
        {
            nome: 'Shark',
            preco: '25',
            precoAnual: '250',
            limiteClientes: 'unlimited',
            features: [
                'Clientes ilimitados',
                'Tudo do Professional',
                'Multi-utilizador',
                'API personalizada',
                'Suporte dedicado',
                'Formação personalizada'
            ]
        }
    ];

    const selecionarPlano = (plano) => {
        setPlanoSelecionado(plano);
        setModalRegistoAberto(true);
    };

    const fecharModalRegisto = () => {
        setModalRegistoAberto(false);
        setPlanoSelecionado(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Header */}
            <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                                <BuildingOfficeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                MyImoMatePro
                            </span>
                        </div>
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-primary-50"
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
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            O CRM que
                            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                                {" "}revoluciona
                            </span>
                            <br />
                            o seu negócio imobiliário
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
                            Gerir clientes, leads, oportunidades e deals nunca foi tão simples e poderoso.
                            Transforme cada contacto numa oportunidade de sucesso.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => selecionarPlano(planos[1])}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                                Começar Agora
                            </button>
                            <a
                                href="#planos"
                                className="inline-flex items-center px-8 py-4 border-2 border-primary-400 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-200"
                            >
                                Ver Planos
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <UserGroupIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Clientes</h3>
                        <p className="text-gray-600">
                            Centralize toda a informação dos seus clientes num só lugar, acessível a qualquer momento.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pipeline de Vendas</h3>
                        <p className="text-gray-600">
                            Acompanhe cada oportunidade desde o primeiro contacto até ao fecho do negócio.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                            <ShieldCheckIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Segurança Total</h3>
                        <p className="text-gray-600">
                            Os seus dados estão protegidos com encriptação de ponta e conformidade GDPR.
                        </p>
                    </div>
                </div>
            </section>

            {/* Planos Section */}
            <section id="planos" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Escolha o plano ideal para si
                        </h2>
                        <p className="text-lg text-gray-600">
                            Comece gratuitamente e evolua conforme o seu negócio cresce
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {planos.map((plano) => (
                            <div
                                key={plano.nome}
                                className={`relative rounded-2xl border-2 p-8 ${plano.nome === 'Professional'
                                    ? 'border-primary-500 shadow-2xl transform scale-105 bg-gradient-to-br from-primary-50 to-secondary-50'
                                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg transition-all'
                                    }`}
                            >
                                {plano.nome === 'Professional' && (
                                    <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Mais Popular
                                    </span>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plano.nome}</h3>
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                            €{plano.preco}
                                        </span>
                                        <span className="text-gray-600 ml-2">/mês</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        ou €{plano.precoAnual}/ano (2 meses grátis)
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plano.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <CheckIcon className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => selecionarPlano(plano)}
                                        className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${plano.nome === 'Professional'
                                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg'
                                            : 'border-2 border-primary-400 hover:border-primary-500 text-primary-600 hover:bg-primary-50'
                                            }`}
                                    >
                                        <span>Escolher {plano.nome}</span>
                                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-secondary-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Pronto para transformar o seu negócio?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Junte-se a centenas de consultores que já revolucionaram a sua forma de trabalhar
                    </p>
                    <button
                        onClick={() => selecionarPlano(planos[1])}
                        className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Começar Teste Gratuito
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-primary-600 to-secondary-600 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">MyImoMatePro</span>
                    </div>
                    <p className="text-white/80">
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