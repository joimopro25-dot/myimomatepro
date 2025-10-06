import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SellerQualificationForm from '../../components/SellerQualificationForm';
import { createSellerOpportunity } from '../../utils/sellerOpportunityFirebase';
import { db } from '../../firebase/config';

export default function NewSellerOpportunity() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const consultantId = 'YOUR_CONSULTANT_ID'; // Get from auth context

  const handleSubmit = async (data) => {
    try {
      const oppId = await createSellerOpportunity(
        db, 
        consultantId, 
        clientId, 
        data
      );
      console.log('Seller opportunity created:', oppId);
      navigate(`/clients/${clientId}/seller-opportunities`);
    } catch (error) {
      console.error('Error creating seller opportunity:', error);
      alert('Erro ao criar oportunidade');
    }
  };

  const handleCancel = () => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <SellerQualificationForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}