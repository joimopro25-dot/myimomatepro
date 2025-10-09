// src/pages/CommissionsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import CommissionsDashboard from '../components/CommissionsDashboard';
import { getAllCommissions, updateCommissionTracking } from '../utils/sellerOpportunityFirebase';

export default function CommissionsPage() {
  const { currentUser } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommissions();
  }, [currentUser]);

  const loadCommissions = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await getAllCommissions(db, currentUser.uid);
      setCommissions(data);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async (updatedData) => {
    try {
      await updateCommissionTracking(
        db,
        currentUser.uid,
        updatedData.clientId,
        updatedData.opportunityId,
        updatedData
      );
      
      // Refresh list
      await loadCommissions();
    } catch (error) {
      console.error('Error updating commission:', error);
      alert('Erro ao atualizar comissão');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <CommissionsDashboard
        commissions={commissions}
        onUpdateCommission={handleUpdateCommission}
      />
    </div>
  );
}