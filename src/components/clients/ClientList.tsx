// src/components/clients/ClientList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SearchIcon, 
  FilterIcon, 
  PlusIcon, 
  UserIcon,
  PhoneIcon,
  MailIcon,
  TagIcon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useClientTranslation } from '../../hooks/useTranslation';
import { useTenant } from '../../hooks/useTenant';
import { clientService, Client, ClientListOptions } from '../../services/clientService';
import { LoadingSpinner, InlineLoader } from '../common/LoadingSpinner';

export const ClientList: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useClientTranslation();
  const { tenant } = useTenant();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Partial<ClientListOptions>>({
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load clients
  useEffect(() => {
    if (!tenant) return;
    loadClients();
  }, [tenant, filters]);

  const loadClients = async (page = 1, append = false) => {
    if (!tenant) return;
    
    setLoading(!append);
    
    try {
      const result = await clientService.getClients(tenant.id, {
        ...filters,
        search: searchTerm,
        page,
        limit: 20
      });
      
      if (append) {
        setClients(prev => [...prev, ...result.clients]);
      } else {
        setClients(result.clients);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients(1);
  };

  const handleLoadMore = () => {
    loadClients(currentPage + 1, true);
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      vip: theme.colors.warning,
      urgent: theme.colors.error,
      investor: theme.colors.info,
      first_home: theme.colors.success,
      high_budget: theme.colors.primary[600]
    };
    return colors[tag] || theme.colors.text.muted;
  };

  if (loading && clients.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
            {t('nav.clients')}
          </h1>
        </div>
        <InlineLoader text="A carregar clientes..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
          {t('nav.clients')} ({clients.length})
        </h1>
        
        <Link
          to="/clients/new"
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: theme.colors.primary[600],
            color: 'white'
          }}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Novo Cliente
        </Link>
      </div>

      {/* Search and Filters */}
      <div 
        className="bg-white rounded-lg p-4 mb-6 shadow-sm"
        style={{ 
          backgroundColor: theme.colors.background.primary,
          border: \1px solid \\
        }}
      >
        <form onSubmit={handleSearch} className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: theme.colors.text.muted }}
              />
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: theme.colors.border.medium,
                  color: theme.colors.text.primary
                }}
              />
            </div>
          </div>
          
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 rounded-md text-sm"
            style={{
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.border.medium,
              color: theme.colors.text.primary
            }}
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="">Todos</option>
          </select>
          
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: theme.colors.primary[600],
              color: 'white'
            }}
          >
            Pesquisar
          </button>
        </form>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <Link
            key={client.id}
            to={\/clients/\\}
            className="block p-4 rounded-lg transition-all duration-200 hover:shadow-md group"
            style={{ 
              backgroundColor: theme.colors.background.primary,
              border: \1px solid \\
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary[300];
              e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border.light;
              e.currentTarget.style.backgroundColor = theme.colors.background.primary;
            }}
          >
            {/* Client Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.primary[100] }}
                >
                  <span className="text-sm font-medium"
                        style={{ color: theme.colors.primary[700] }}>
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-medium truncate"
                      style={{ color: theme.colors.text.primary }}>
                    {client.name}
                  </h3>
                  <p className="text-xs"
                     style={{ color: theme.colors.text.muted }}>
                    Cliente desde {client.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {client.status === 'inactive' && (
                <span 
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: theme.colors.error + '20',
                    color: theme.colors.error
                  }}
                >
                  Inativo
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center space-x-2">
                <MailIcon className="w-4 h-4" style={{ color: theme.colors.text.muted }} />
                <span className="text-sm truncate" style={{ color: theme.colors.text.secondary }}>
                  {client.email}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4" style={{ color: theme.colors.text.muted }} />
                <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  {client.phone}
                </span>
              </div>
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {client.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: getTagColor(tag) + '20',
                      color: getTagColor(tag)
                    }}
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {t(\client.tags.\\)}
                  </span>
                ))}
                {client.tags.length > 3 && (
                  <span className="text-xs" style={{ color: theme.colors.text.muted }}>
                    +{client.tags.length - 3} mais
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.colors.background.secondary,
              border: \1px solid \\,
              color: theme.colors.text.primary
            }}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Carregar mais'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {clients.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.text.muted }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.text.primary }}>
            Nenhum cliente encontrado
          </h3>
          <p className="mb-4" style={{ color: theme.colors.text.secondary }}>
            {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece adicionando o seu primeiro cliente'}
          </p>
          <Link
            to="/clients/new"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: theme.colors.primary[600],
              color: 'white'
            }}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Adicionar Cliente
          </Link>
        </div>
      )}
    </div>
  );
};
