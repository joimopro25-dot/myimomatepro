/**
 * CLIENT CONTEXT - RealEstateCRM Pro
 * Global state management for clients and opportunities
 * Provides client data across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLoading } from './LoadingContext';
import { clientService } from '../services/clientService';
import { opportunityService } from '../services/opportunityService';

// Create context
const ClientContext = createContext();

// Custom hook to use client context
export function useClients() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}

// Client Provider Component
export function ClientProvider({ children }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  // State
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [clientStats, setClientStats] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    qualification: '',
    tags: [],
    source: '',
    profileComplete: null
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Load clients when component mounts or filters change
  useEffect(() => {
    if (currentUser?.consultantId) {
      loadClients();
    }
  }, [currentUser, filters, sortConfig, pagination.page, refreshKey]);

  // Load client statistics
  useEffect(() => {
    if (currentUser?.consultantId) {
      loadClientStats();
    }
  }, [currentUser, refreshKey]);

  /**
   * Load clients from database
   */
  const loadClients = useCallback(async () => {
    if (!currentUser?.consultantId) return;

    try {
      setLoading(true);
      
      const result = await clientService.list(
        currentUser.consultantId,
        {
          ...filters,
          sortBy: sortConfig.field,
          sortOrder: sortConfig.order
        },
        {
          page: pagination.page,
          limit: pagination.limit
        }
      );

      if (result.success) {
        setClients(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.count
        }));
      } else {
        showToast('Erro ao carregar clientes', 'error');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      showToast('Erro ao carregar clientes', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters, sortConfig, pagination.page, pagination.limit]);

  /**
   * Load client statistics
   */
  const loadClientStats = useCallback(async () => {
    if (!currentUser?.consultantId) return;

    try {
      const result = await clientService.getClientStats(currentUser.consultantId);
      
      if (result.success) {
        setClientStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading client stats:', error);
    }
  }, [currentUser]);

  /**
   * Quick add client
   */
  const quickAddClient = useCallback(async (clientData) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return null;
    }

    try {
      setLoading(true);
      
      const result = await clientService.quickAddClient(
        currentUser.consultantId,
        clientData
      );

      if (result.success) {
        showToast('Cliente adicionado com sucesso!', 'success');
        setRefreshKey(prev => prev + 1); // Trigger reload
        return result.data;
      } else {
        if (result.duplicates) {
          showToast('Cliente já existe com este email ou telefone', 'warning');
        } else {
          showToast(result.error || 'Erro ao adicionar cliente', 'error');
        }
        return null;
      }
    } catch (error) {
      console.error('Error adding client:', error);
      showToast('Erro ao adicionar cliente', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast, setLoading]);

  /**
   * Create complete client
   */
  const createClient = useCallback(async (clientData) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return null;
    }

    try {
      setLoading(true);
      
      const result = await clientService.createClient(
        currentUser.consultantId,
        clientData
      );

      if (result.success) {
        showToast('Cliente criado com sucesso!', 'success');
        setRefreshKey(prev => prev + 1);
        return result.data;
      } else {
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => {
            showToast(`${error.field}: ${error.message}`, 'error');
          });
        } else if (result.duplicates) {
          showToast('Cliente já existe', 'warning');
        } else {
          showToast(result.error || 'Erro ao criar cliente', 'error');
        }
        return null;
      }
    } catch (error) {
      console.error('Error creating client:', error);
      showToast('Erro ao criar cliente', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast, setLoading]);

  /**
   * Update client
   */
  const updateClient = useCallback(async (clientId, updates) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return false;
    }

    try {
      setLoading(true);
      
      const result = await clientService.updateClient(
        currentUser.consultantId,
        clientId,
        updates
      );

      if (result.success) {
        showToast('Cliente atualizado com sucesso!', 'success');
        
        // Update local state
        setClients(prev => prev.map(client => 
          client.id === clientId ? result.data : client
        ));
        
        if (selectedClient?.id === clientId) {
          setSelectedClient(result.data);
        }
        
        return true;
      } else {
        showToast(result.error || 'Erro ao atualizar cliente', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating client:', error);
      showToast('Erro ao atualizar cliente', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedClient, showToast, setLoading]);

  /**
   * Delete client (soft delete)
   */
  const deleteClient = useCallback(async (clientId) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return false;
    }

    try {
      setLoading(true);
      
      const result = await clientService.softDelete(
        currentUser.consultantId,
        clientId
      );

      if (result.success) {
        showToast('Cliente removido com sucesso!', 'success');
        
        // Remove from local state
        setClients(prev => prev.filter(client => client.id !== clientId));
        
        if (selectedClient?.id === clientId) {
          setSelectedClient(null);
        }
        
        return true;
      } else {
        showToast(result.error || 'Erro ao remover cliente', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      showToast('Erro ao remover cliente', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedClient, showToast, setLoading]);

  /**
   * Add qualification to client
   */
  const addQualification = useCallback(async (clientId, qualification) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return null;
    }

    try {
      setLoading(true);
      
      const result = await clientService.addQualification(
        currentUser.consultantId,
        clientId,
        qualification
      );

      if (result.success) {
        showToast('Qualificação adicionada com sucesso!', 'success');
        
        // Reload client data
        if (selectedClient?.id === clientId) {
          loadClientById(clientId);
        }
        
        return result;
      } else {
        showToast(result.error || 'Erro ao adicionar qualificação', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error adding qualification:', error);
      showToast('Erro ao adicionar qualificação', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedClient, showToast, setLoading]);

  /**
   * Remove qualification from client
   */
  const removeQualification = useCallback(async (clientId, qualificationId) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return false;
    }

    try {
      setLoading(true);
      
      const result = await clientService.removeQualification(
        currentUser.consultantId,
        clientId,
        qualificationId
      );

      if (result.success) {
        showToast('Qualificação removida com sucesso!', 'success');
        
        // Reload client data
        if (selectedClient?.id === clientId) {
          loadClientById(clientId);
        }
        
        return true;
      } else {
        showToast(result.error || 'Erro ao remover qualificação', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error removing qualification:', error);
      showToast('Erro ao remover qualificação', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedClient, showToast, setLoading]);

  /**
   * Link spouse as client
   */
  const linkSpouseAsClient = useCallback(async (clientId) => {
    if (!currentUser?.consultantId) {
      showToast('Erro: Consultor não identificado', 'error');
      return null;
    }

    try {
      setLoading(true);
      
      const result = await clientService.linkSpouseAsClient(
        currentUser.consultantId,
        clientId
      );

      if (result.success) {
        showToast('Cônjuge criado como cliente!', 'success');
        setRefreshKey(prev => prev + 1); // Reload clients
        return result.spouseClientId;
      } else {
        showToast(result.error || 'Erro ao criar cônjuge como cliente', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error linking spouse:', error);
      showToast('Erro ao criar cônjuge como cliente', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast, setLoading]);

  /**
   * Search clients
   */
  const searchClients = useCallback(async (searchTerm) => {
    if (!currentUser?.consultantId) return [];

    try {
      const result = await clientService.searchClients(
        currentUser.consultantId,
        searchTerm,
        filters
      );

      if (result.success) {
        return result.clients;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }, [currentUser, filters]);

  /**
   * Load client by ID
   */
  const loadClientById = useCallback(async (clientId) => {
    if (!currentUser?.consultantId) return null;

    try {
      setLoading(true);
      
      const result = await clientService.getById(
        currentUser.consultantId,
        clientId
      );

      if (result.success) {
        setSelectedClient(result.data);
        
        // Load client opportunities
        const oppResult = await opportunityService.getByClient(
          currentUser.consultantId,
          clientId
        );
        
        if (oppResult.success) {
          setOpportunities(oppResult.data);
        }
        
        return result.data;
      } else {
        showToast('Cliente não encontrado', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error loading client:', error);
      showToast('Erro ao carregar cliente', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast, setLoading]);

  /**
   * Check for duplicate clients
   */
  const checkDuplicates = useCallback(async (fields) => {
    if (!currentUser?.consultantId) return { hasDuplicates: false, clients: [] };

    try {
      const result = await clientService.checkDuplicates(
        currentUser.consultantId,
        fields
      );
      
      return result;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return { hasDuplicates: false, clients: [] };
    }
  }, [currentUser]);

  /**
   * Apply filters
   */
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      qualification: '',
      tags: [],
      source: '',
      profileComplete: null
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Sort clients
   */
  const sortClients = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Export clients
   */
  const exportClients = useCallback(async (format = 'csv') => {
    if (!currentUser?.consultantId) return;

    try {
      setLoading(true);
      
      // Get all clients without pagination
      const result = await clientService.list(
        currentUser.consultantId,
        filters,
        { limit: 10000 }
      );

      if (result.success) {
        // Format data for export
        const exportData = result.data.map(client => ({
          Nome: client.name,
          Email: client.email || '',
          Telefone: client.phone || '',
          NIF: client.nif || '',
          Categoria: client.clientScore?.category || 'C',
          Fonte: client.source || '',
          'Data Criação': new Date(client.createdAt).toLocaleDateString('pt-PT'),
          'Perfil Completo': client.profileComplete ? 'Sim' : 'Não'
        }));

        // Create CSV
        if (format === 'csv') {
          const headers = Object.keys(exportData[0]);
          const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
              headers.map(header => `"${row[header]}"`).join(',')
            )
          ].join('\n');

          // Download file
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
        }

        showToast('Clientes exportados com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Error exporting clients:', error);
      showToast('Erro ao exportar clientes', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters, showToast, setLoading]);

  /**
   * Import clients from CSV
   */
  const importClients = useCallback(async (file) => {
    if (!currentUser?.consultantId) return;

    try {
      setLoading(true);
      
      // Parse CSV file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const clients = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each line
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const clientData = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          // Map CSV headers to client fields
          switch (header.toLowerCase()) {
            case 'nome':
            case 'name':
              clientData.name = value;
              break;
            case 'email':
              clientData.email = value;
              break;
            case 'telefone':
            case 'phone':
              clientData.phone = value;
              break;
            case 'nif':
              clientData.nif = value;
              break;
            case 'morada':
            case 'address':
              clientData.address = { street: value };
              break;
            case 'fonte':
            case 'source':
              clientData.source = value;
              break;
            case 'notas':
            case 'notes':
              clientData.notes = value;
              break;
          }
        });

        // Try to add client
        if (clientData.name) {
          const result = await clientService.quickAddClient(
            currentUser.consultantId,
            clientData
          );
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      showToast(
        `Importação concluída: ${successCount} sucesso, ${errorCount} erros`,
        successCount > 0 ? 'success' : 'error'
      );
      
      setRefreshKey(prev => prev + 1); // Reload clients
    } catch (error) {
      console.error('Error importing clients:', error);
      showToast('Erro ao importar clientes', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast, setLoading]);

  // Context value
  const value = {
    // State
    clients,
    selectedClient,
    opportunities,
    clientStats,
    filters,
    sortConfig,
    pagination,
    
    // Actions
    quickAddClient,
    createClient,
    updateClient,
    deleteClient,
    addQualification,
    removeQualification,
    linkSpouseAsClient,
    searchClients,
    loadClientById,
    checkDuplicates,
    applyFilters,
    clearFilters,
    sortClients,
    changePage,
    exportClients,
    importClients,
    refresh: () => setRefreshKey(prev => prev + 1)
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}