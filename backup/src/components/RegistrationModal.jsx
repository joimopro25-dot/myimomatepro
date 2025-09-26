import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

export default function RegistrationModal({ isOpen, onClose, selectedPlan }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: data, 2: success

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validations
        if (formData.password.length < 6) {
            setError('A password deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As passwords não coincidem');
            setLoading(false);
            return;
        }

        try {
            await signup(formData.email, formData.password, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                plan: selectedPlan?.name || 'Professional'
            });

            setStep(2); // Show success
        } catch (error) {
            console.error('Registration error:', error);

            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('Este email já está registado');
                    break;
                case 'auth/invalid-email':
                    setError('Email inválido');
                    break;
                case 'auth/weak-password':
                    setError('Password muito fraca');
                    break;
                default:
                    setError('Erro ao criar conta. Tente novamente');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        onClose();
        navigate('/dashboard');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
                {step === 1 ? (
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Criar Conta</h2>
                                <p className="text-gray-400">Plano: {selectedPlan?.name}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors duration-200"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                                    <p className="text-red-400 text-sm text-center">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                        Nome Completo *
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                        Telefone
                                    </label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="+351 9XX XXX XXX"
                                        />
                                    </div>
                                </div>

                                {/* Company */}
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                                        Empresa/Agência
                                    </label>
                                    <div className="relative">
                                        <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Nome da sua empresa"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirmar Password *
                                    </label>
                                    <div className="relative">
                                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-11 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Repita a password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        required
                                        className="w-4 h-4 text-primary-500 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2 mt-1"
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-300">
                                        Aceito os <span className="text-primary-400">Termos de Serviço</span> e a{' '}
                                        <span className="text-primary-400">Política de Privacidade</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 mt-6"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Criando conta...</span>
                                        </div>
                                    ) : (
                                        'Criar Conta'
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    // Step 2: Success
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckIcon className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">
                            Conta criada com sucesso!
                        </h2>

                        <p className="text-gray-400 mb-6">
                            Bem-vindo ao MyImoMatePro! A sua conta foi criada e já pode começar a usar o CRM.
                        </p>

                        <button
                            onClick={handleSuccess}
                            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        >
                            Ir para Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}