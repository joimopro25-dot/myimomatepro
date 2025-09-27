/**
 * CLIENT DETAIL - RealEstateCRM Pro
 * Complete client profile view with tabs, timeline, and actions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, MoreVertical, Share2, Download, Archive,
  User, Phone, Mail, MapPin, Calendar, Clock, Tag, Star,
  Briefcase, Heart, Home, Target, FileText, Activity,
  ChevronRight, Plus, Send, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Euro, Globe, CreditCard, Users, Building,
  MessageSquare, Eye, Link, Copy, ExternalLink
} from 'lucide-react';
import { useClients } from '../../contexts/ClientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatPhoneNumber, formatAddress } from '../../utils/portugalAddress';
import { calculateAge } from '../../utils/dateHelpers';

// Tab configuration
const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'qualifications', label: 'Qualifications', icon: Target },
  { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Notes', icon: MessageSquare }
];

// Category badge colors
const categoryColors = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-gray-100 text-gray-800 border-gray-300'
};

// Qualification type colors
const qualificationColors = {
  buyer: 'bg-blue-100 text-blue-800',
  seller: 'bg-green-100 text-green-800',
  tenant: 'bg-purple-100 text-purple-800',
  landlord: 'bg-yellow-100 text-yellow-800',
  investor: 'bg-indigo-100 text-indigo-800',
  developer: 'bg-red-100 text-red-800',
  propertyManager: 'bg-gray-100 text-gray-800'
};

export function ClientDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    getClientById,
    updateClient,
    deleteClient,
    addQualification,
    removeQualification,
    linkSpouseAsClient,
    recordContact,
    setFollowUp
  } = useClients();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);

  // Load client data
  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const clientData = await getClientById(id);
      setClient(clientData);
      
      // Load related data (opportunities, timeline, etc.)
      // This would normally come from services
      loadRelatedData(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async (clientData) => {
    // Mock data - replace with actual service calls
    setOpportunities([
      {
        id: '1',
        title: 'Looking for 3BR Apartment',
        type: 'buyer_search',
        stage: 'viewing',
        value: 350000,
        probability: 60,
        createdAt: new Date('2024-01-15')
      }
    ]);

    setTimeline([
      {
        id: '1',
        type: 'created',
        description: 'Client profile created',
        date: clientData.createdAt,
        icon: UserPlus
      },
      {
        id: '2',
        type: 'contact',
        description: 'Phone call - Initial consultation',
        date: new Date('2024-01-16'),
        icon: Phone
      }
    ]);

    setNotes(clientData.notes || []);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const success = await deleteClient(id);
      if (success) {
        navigate('/clients');
      }
    }
  };

  const handleRecordContact = async (type = 'phone') => {
    await recordContact(id, type);
    await loadClientData();
  };

  const handleSetFollowUp = async () => {
    const date = prompt('Set follow-up date (YYYY-MM-DD):');
    const notes = prompt('Follow-up notes:');
    if (date) {
      await setFollowUp(id, new Date(date), notes);
      await loadClientData();
    }
  };

  const handleCopyInfo = (text) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const handleCreateSpouseClient = async () => {
    if (client.spouse?.name) {
      const spouseClient = await linkSpouseAsClient(id);
      if (spouseClient) {
        navigate(`/clients/${spouseClient.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Client not found</h3>
        <button
          onClick={() => navigate('/clients')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const renderHeader = () => {
    const category = client.clientScore?.category || 'C';
    const score = client.clientScore?.overall || 0;

    return (
      <div className="bg-white border-b">
        <div className="px-4 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Clients
          </button>

          {/* Client header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-600" />
              </div>
              
              <div className="ml-6">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                  {client.isQuickAdd && (
                    <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      Quick Add
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${categoryColors[category]}`}>
                    Category {category}
                  </span>
                  <span className="text-sm text-gray-600">
                    Score: {score}%
                  </span>
                  <span className="text-sm text-gray-600">
                    ID: #{client.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm">
                  {client.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {formatPhoneNumber(client.phone)}
                      <button
                        onClick={() => handleCopyInfo(client.phone)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {client.email}
                      <button
                        onClick={() => handleCopyInfo(client.email)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {client.address?.city && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {client.address.city}, {client.address.district}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleRecordContact('phone')}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm"
                  >
                    <Phone className="w-4 h-4 inline mr-1" />
                    Record Call
                  </button>
                  <button
                    onClick={() => handleRecordContact('email')}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm"
                  >
                    <Mail className="w-4 h-4 inline mr-1" />
                    Record Email
                  </button>
                  <button
                    onClick={handleSetFollowUp}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Set Follow-up
                  </button>
                </div>
              </div>
            </div>

            {/* Action menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      navigate(`/clients/${id}/edit`);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Client
                  </button>
                  <button
                    onClick={() => {
                      // Handle share
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </button>
                  <button
                    onClick={() => {
                      // Handle export
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                  <button
                    onClick={() => {
                      // Handle archive
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Client
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Client
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex space-x-8 border-b">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="text-gray-900">
                {client.dateOfBirth ? 
                  `${new Date(client.dateOfBirth).toLocaleDateString('pt-PT')} (${calculateAge(client.dateOfBirth)} years)` 
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nationality</p>
              <p className="text-gray-900">{client.nationality || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NIF</p>
              <p className="text-gray-900">{client.nif || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CC Number</p>
              <p className="text-gray-900">{client.ccNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Occupation</p>
              <p className="text-gray-900">{client.occupation || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="text-gray-900">{client.company || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Annual Income</p>
              <p className="text-gray-900">
                {client.annualIncome ? 
                  `€${client.annualIncome.toLocaleString('pt-PT')}` 
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Income Category</p>
              <p className="text-gray-900">
                {client.annualIncome ? 
                  (client.annualIncome > 80000 ? 'High' :
                   client.annualIncome > 40000 ? 'Upper Middle' :
                   client.annualIncome > 20000 ? 'Middle' : 'Entry')
                  : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Spouse Information */}
        {client.spouse?.name && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Spouse/Partner Information</h2>
              {!client.spouse.isAlsoClient && (
                <button
                  onClick={handleCreateSpouseClient}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Create as Client
                </button>
              )}
              {client.spouse.linkedClientId && (
                <button
                  onClick={() => navigate(`/clients/${client.spouse.linkedClientId}`)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="w-4 h-4 inline mr-1" />
                  View Profile
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900">{client.spouse.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NIF</p>
                <p className="text-gray-900">{client.spouse.nif || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">
                  {client.spouse.phone ? formatPhoneNumber(client.spouse.phone) : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{client.spouse.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Qualifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Qualifications</h2>
            <button
              onClick={() => {/* Add qualification modal */}}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Qualification
            </button>
          </div>
          
          {client.qualifications && client.qualifications.length > 0 ? (
            <div className="space-y-3">
              {client.qualifications.map(qual => (
                <div key={qual.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${qualificationColors[qual.type]}`}>
                      {qual.type}
                    </span>
                    {qual.active && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                    )}
                  </div>
                  {qual.opportunityId && (
                    <button
                      onClick={() => navigate(`/opportunities/${qual.opportunityId}`)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View Opportunity
                      <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No qualifications added yet</p>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Client Since</span>
              <span className="text-sm text-gray-900">
                {new Date(client.createdAt?.seconds * 1000).toLocaleDateString('pt-PT')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Last Contact</span>
              <span className="text-sm text-gray-900">
                {client.metadata?.lastContactedAt ? 
                  new Date(client.metadata.lastContactedAt.seconds * 1000).toLocaleDateString('pt-PT')
                  : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Deals</span>
              <span className="text-sm text-gray-900">{client.metadata?.totalDeals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Value</span>
              <span className="text-sm text-gray-900">
                €{(client.metadata?.totalValue || 0).toLocaleString('pt-PT')}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <button
              onClick={() => {/* Add tag modal */}}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {client.tags && client.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {client.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tags added</p>
          )}
        </div>

        {/* Follow-up */}
        {client.metadata?.nextFollowUp && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <h2 className="text-lg font-semibold text-yellow-900">Follow-up Scheduled</h2>
            </div>
            <p className="text-yellow-800">
              {new Date(client.metadata.nextFollowUp).toLocaleDateString('pt-PT')}
            </p>
            {client.metadata.followUpNotes && (
              <p className="text-sm text-yellow-700 mt-2">
                {client.metadata.followUpNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
        
        <div className="space-y-6">
          {timeline.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-full bg-gray-300 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {event.description}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleString('pt-PT')}
                    </span>
                  </div>
                  {event.details && (
                    <p className="text-sm text-gray-600 mt-1">
                      {event.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'timeline':
        return renderTimelineTab();
      // Add other tabs as needed
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Tab content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <div className="px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
}