/**
 * CLIENT LIST - RealEstateCRM Pro
 * Main page for managing clients with filters, search, and bulk operations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Filter, Download, Upload, MoreVertical,
  User, Phone, Mail, Calendar, Tag, Star, AlertCircle,
  ChevronLeft, ChevronRight, Users, UserPlus, Grid, List,
  Trash2, Edit, Eye, Archive, Send, CheckSquare, Square,
  TrendingUp, Clock, MapPin, Euro, Heart, Target
} from 'lucide-react';
import { useClients } from '../../contexts/ClientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { QuickAddModal, useQuickAdd } from '../../components/clients/QuickAddModal';
import { formatPhoneNumber, formatAddress } from '../../utils/portugalAddress';

// Client category colors
const categoryColors = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-gray-100 text-gray-800 border-gray-300'
};

// Client source icons
const sourceIcons = {
  website: '🌐',
  referral: '🤝',
  social: '📱',
  coldcall: '☎️',
  walkin: '🚶',
  advertisement: '📢',
  other: '📌'
};

export function ClientList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    clients,
    clientStats,
    filters,
    sortBy,
    sortOrder,
    searchTerm,
    isLoadingClients,
    followUpClients,
    pagination,
    setFilters,
    setSortBy,
    setSortOrder,
    setSearchTerm,
    loadClients,
    deleteClient,
    bulkUpdateTags,
    exportToCSV,
    recordContact
  } = useClients();

  const { isQuickAddOpen, openQuickAdd, closeQuickAdd } = useQuickAdd();

  // Local state
  const [viewMode, setViewMode] = useState('list'); // list or grid
  const [selectedClients, setSelectedClients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Filter state
  const [tempFilters, setTempFilters] = useState({
    category: '',
    qualification: '',
    profileComplete: '',
    source: '',
    hasSpouse: '',
    tags: []
  });

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          !== document.documentElement.offsetHeight) {
        return;
      }
      if (pagination.hasMore && !isLoadingClients) {
        loadClients(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination.hasMore, isLoadingClients]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedClients.length > 0);
  }, [selectedClients]);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    
    const search = searchTerm.toLowerCase();
    return clients.filter(client => {
      return (
        client.name.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phone?.includes(search) ||
        client.nif?.includes(search)
      );
    });
  }, [clients, searchTerm]);

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempFilters({
      category: '',
      qualification: '',
      profileComplete: '',
      source: '',
      hasSpouse: '',
      tags: []
    });
    setFilters({});
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedClients.length} clients?`)) {
      for (const clientId of selectedClients) {
        await deleteClient(clientId);
      }
      setSelectedClients([]);
    }
  };

  const handleBulkTag = async (tags) => {
    await bulkUpdateTags(selectedClients, tags.split(',').map(t => t.trim()));
    setSelectedClients([]);
  };

  const renderClientCard = (client) => {
    const isSelected = selectedClients.includes(client.id);
    const category = client.clientScore?.category || 'C';
    const score = client.clientScore?.overall || 0;

    return (
      <div
        key={client.id}
        className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all ${
          isSelected ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectClient(client.id)}
              className="mr-3 rounded text-primary-600 focus:ring-primary-500"
            />
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <h3 
                  className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  {client.name}
                  {client.isQuickAdd && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Quick Add
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[category]}`}>
                    Cat. {category}
                  </span>
                  <span className="text-xs text-gray-500">
                    Score: {score}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === client.id ? null : client.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {activeDropdown === client.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    navigate(`/clients/${client.id}`);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    navigate(`/clients/${client.id}/edit`);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={async () => {
                    await recordContact(client.id);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Record Contact
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    if (window.confirm('Delete this client?')) {
                      deleteClient(client.id);
                    }
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-3">
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 mr-2" />
              {formatPhoneNumber(client.phone)}
            </div>
          )}
          {client.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 mr-2" />
              {client.email}
            </div>
          )}
          {client.address?.city && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 mr-2" />
              {client.address.city}, {client.address.district}
            </div>
          )}
        </div>

        {/* Qualifications */}
        {client.qualifications && client.qualifications.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {client.qualifications.map(qual => (
                <span
                  key={qual.id}
                  className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded"
                >
                  {qual.type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {client.tags.map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {new Date(client.createdAt?.seconds * 1000).toLocaleDateString('pt-PT')}
          </div>
          {client.source && (
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">{sourceIcons[client.source]}</span>
              {client.source}
            </div>
          )}
        </div>

        {/* Follow-up indicator */}
        {client.metadata?.nextFollowUp && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center text-xs text-yellow-800">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Follow-up: {new Date(client.metadata.nextFollowUp).toLocaleDateString('pt-PT')}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedClients.length === filteredClients.length}
                onChange={handleSelectAll}
                className="rounded text-primary-600"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('name')}
            >
              Name
              {sortBy === 'name' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('clientScore.category')}
            >
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Qualifications
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('createdAt')}
            >
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredClients.map(client => {
            const isSelected = selectedClients.includes(client.id);
            const category = client.clientScore?.category || 'C';
            
            return (
              <tr 
                key={client.id}
                className={`hover:bg-gray-50 ${isSelected ? 'bg-primary-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectClient(client.id)}
                    className="rounded text-primary-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div 
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        {client.name}
                      </div>
                      {client.spouse?.name && (
                        <div className="text-xs text-gray-500">
                          <Heart className="w-3 h-3 inline mr-1" />
                          {client.spouse.name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {client.phone && formatPhoneNumber(client.phone)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {client.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.address?.city && (
                    <div>
                      {client.address.city}
                      {client.address.district && `, ${client.address.district}`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex text-xs px-2 py-1 rounded-full border ${categoryColors[category]}`}>
                    {category} ({client.clientScore?.overall || 0}%)
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {client.qualifications?.map(qual => (
                      <span
                        key={qual.id}
                        className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded"
                      >
                        {qual.type}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {client.tags?.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {client.tags?.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{client.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.createdAt?.seconds * 1000).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">
          Manage your client database and relationships
        </p>
      </div>

      {/* Stats Cards */}
      {clientStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clientStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Category A</p>
                <p className="text-2xl font-bold text-green-600">{clientStats.byCategory.A}</p>
              </div>
              <Star className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quick Add</p>
                <p className="text-2xl font-bold text-yellow-600">{clientStats.quickAdd}</p>
              </div>
              <UserPlus className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complete</p>
                <p className="text-2xl font-bold text-primary-600">{clientStats.complete}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-primary-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-ups</p>
                <p className="text-2xl font-bold text-orange-600">{followUpClients.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, or NIF..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            {/* Export */}
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>

            {/* Quick Add */}
            <button
              onClick={openQuickAdd}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Quick Add
            </button>

            {/* New Client */}
            <button
              onClick={() => navigate('/clients/new')}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              New Client
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={tempFilters.category}
                  onChange={(e) => setTempFilters({...tempFilters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  <option value="A">Category A</option>
                  <option value="B">Category B</option>
                  <option value="C">Category C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Status
                </label>
                <select
                  value={tempFilters.profileComplete}
                  onChange={(e) => setTempFilters({...tempFilters, profileComplete: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Profiles</option>
                  <option value="true">Complete</option>
                  <option value="false">Incomplete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={tempFilters.source}
                  onChange={(e) => setTempFilters({...tempFilters, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="coldcall">Cold Call</option>
                  <option value="walkin">Walk-in</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckSquare className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-900 font-medium">
                {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const tags = prompt('Enter tags (comma separated):');
                  if (tags) handleBulkTag(tags);
                }}
                className="px-3 py-1 text-blue-700 hover:bg-blue-100 rounded"
              >
                <Tag className="w-4 h-4 inline mr-1" />
                Add Tags
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-red-700 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
              <button
                onClick={() => setSelectedClients([])}
                className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List/Grid */}
      {isLoadingClients ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding your first client'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={openQuickAdd}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Quick Add
            </button>
            <button
              onClick={() => navigate('/clients/new')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              New Client
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => renderClientCard(client))}
        </div>
      ) : (
        renderListView()
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => loadClients(true)}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoadingClients}
          >
            {isLoadingClients ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={closeQuickAdd}
        onSuccess={(client) => {
          closeQuickAdd();
          navigate(`/clients/${client.id}`);
        }}
      />
    </div>
  );
}