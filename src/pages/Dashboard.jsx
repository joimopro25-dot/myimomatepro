/**
 * DASHBOARD - RealEstateCRM Pro
 * Main dashboard with client module integration
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const { subscription } = useSubscription();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Quick stats (mock data for now)
  const stats = {
    totalClients: 0,
    activeDeals: 0,
    monthlyRevenue: 0,
    pendingTasks: 0
  };

  // Quick actions
  const quickActions = [
    {
      title: 'Add Client',
      description: 'Quick add a new client',
      icon: PlusIcon,
      action: () => navigate('/clients/new'),
      color: 'bg-blue-500'
    },
    {
      title: 'View Clients',
      description: 'Manage your client database',
      icon: UserGroupIcon,
      action: () => navigate('/clients'),
      color: 'bg-green-500'
    },
    {
      title: 'Schedule',
      description: 'View your calendar',
      icon: CalendarIcon,
      action: () => {}, // Coming soon
      color: 'bg-purple-500'
    },
    {
      title: 'Tasks',
      description: 'Check pending tasks',
      icon: ClockIcon,
      action: () => {}, // Coming soon
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                RealEstate<span className="text-primary-600">CRM</span>
              </span>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/clients"
                className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium flex items-center"
              >
                Clients
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  NEW
                </span>
              </Link>
              <button
                disabled
                className="text-gray-400 px-3 py-2 text-sm font-medium cursor-not-allowed"
              >
                Properties
              </button>
              <button
                disabled
                className="text-gray-400 px-3 py-2 text-sm font-medium cursor-not-allowed"
              >
                Deals
              </button>
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <Link
                to="/account"
                className="text-gray-500 hover:text-gray-700"
              >
                <UserCircleIcon className="h-6 w-6" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.displayName || currentUser?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your real estate business today.
          </p>
        </div>

        {/* Subscription Alert */}
        {subscription?.plan === 'rookie' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Rookie Plan - Limited Features
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You're on the Rookie plan with {subscription.clientLimit} client limit.
                  Upgrade to Professional for unlimited clients and advanced features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Deals</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeDeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">€{stats.monthlyRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
                >
                  <div className={`inline-flex p-2 rounded-lg ${action.color} bg-opacity-10 mb-2`}>
                    <Icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client Module Promo */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                🎉 New Client Module Available!
              </h2>
              <p className="text-primary-100 mb-4">
                Complete client management system with Portuguese-specific features:
              </p>
              <ul className="space-y-1 text-primary-100 mb-4">
                <li>✓ Quick Add for rapid client capture</li>
                <li>✓ Complete profiles with NIF, CC, and Portuguese addresses</li>
                <li>✓ Qualification system with auto-created opportunities</li>
                <li>✓ Spouse management with separate profiles</li>
                <li>✓ Client scoring and categorization (A/B/C)</li>
              </ul>
              <div className="flex space-x-4">
                <Link
                  to="/clients"
                  className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  View Clients
                </Link>
                <Link
                  to="/clients/new"
                  className="inline-flex items-center px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Client
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <UserGroupIcon className="h-32 w-32 text-primary-300 opacity-20" />
            </div>
          </div>
        </div>

        {/* Recent Activity (placeholder) */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 text-center text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Start by adding your first client!</p>
              <Link
                to="/clients/new"
                className="inline-flex items-center px-4 py-2 mt-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Client
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}