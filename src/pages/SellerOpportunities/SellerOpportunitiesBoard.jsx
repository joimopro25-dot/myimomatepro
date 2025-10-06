import React, { useState, useEffect } from 'react';
import SellerDealBoard from '../../components/SellerDealBoard';
import { getAllConsultantSellerOpportunities } from '../../utils/sellerOpportunityFirebase';
import { db } from '../../firebase/config';

export default function SellerOpportunitiesBoard() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const consultantId = 'YOUR_CONSULTANT_ID'; // Get from auth context

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const data = await getAllConsultantSellerOpportunities(db, consultantId);
      setOpportunities(data);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <SellerDealBoard opportunities={opportunities} />;
}