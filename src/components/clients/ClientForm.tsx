// src/components/clients/ClientForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useClientTranslation } from '../../hooks/useTranslation';
import { useTenant } from '../../hooks/useTenant';
import { useAuth } from '../../hooks/useAuth';
import { DynamicForm } from '../forms/DynamicForm';
import { CLIENT_FIELDS } from '../../config/field-definitions';
import { clientService, Client } from '../../services/clientService';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ClientForm: React.FC = () => {
 const { clientId } = useParams<{ clientId: string }>();
 const navigate = useNavigate();
 const { theme } = useTheme();
 const { t } = useClientTranslation();
 const { tenant } = useTenant();
 const { user } = useAuth();
 
 const [client, setClient] = useState<Client | null>(null);
 const [loading, setLoading] = useState(!!clientId);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);
 
 const isEditing = !!clientId;
 const pageTitle = isEditing ? 'Editar Cliente' : 'Novo Cliente';

 // Load client data for editing
 useEffect(() => {
   if (!tenant || !clientId) return;
   
   loadClient();
 }, [tenant, clientId]);

 const loadClient = async () => {
   if (!tenant || !clientId) return;
   
   setLoading(true);
   setError(null);
   
   try {
     const clientData = await clientService.getClient(tenant.id, clientId);
     if (clientData) {
       setClient(clientData);
     } else {
       setError('Cliente não encontrado');
     }
   } catch (err) {
     console.error('Error loading client:', err);
     setError('Erro ao carregar dados do cliente');
   } finally {
     setLoading(false);
   }
 };

 const handleSubmit = async (formData: Record<string, any>) => {
   if (!tenant || !user) return;
   
   setSaving(true);
   setError(null);
   
   try {
     if (isEditing && clientId) {
       // Update existing client
       await clientService.updateClient(tenant.id, user.uid, clientId, formData);
     } else {
       // Create new client
       await clientService.createClient(tenant.id, user.uid, formData);
     }
     
     // Navigate back to client list
     navigate('/clients');
   } catch (err) {
     console.error('Error saving client:', err);
     setError(isEditing ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
   } finally {
     setSaving(false);
   }
 };

 const handleCancel = () => {
   if (isEditing && clientId) {
     navigate(\/clients/\\);
   } else {
     navigate('/clients');
   }
 };

 const getInitialData = () => {
   if (client) {
     // Convert client data to form format
     return {
       name: client.name || '',
       email: client.email || '',
       phone: client.phone || '',
       'personalInfo.citizenCardNumber': client.personalInfo?.citizenCardNumber || '',
       'personalInfo.citizenCardValidity': client.personalInfo?.citizenCardValidity || null,
       'personalInfo.nif': client.personalInfo?.nif || '',
       'personalInfo.birthDate': client.personalInfo?.birthDate || null,
       'personalInfo.nationality': client.personalInfo?.nationality || '',
       'personalInfo.birthPlace': client.personalInfo?.birthPlace || '',
       'personalInfo.parish': client.personalInfo?.parish || '',
       'personalInfo.municipality': client.personalInfo?.municipality || '',
       'personalInfo.profession': client.personalInfo?.profession || '',
       'personalInfo.maritalStatus': client.personalInfo?.maritalStatus || '',
       'spouse.name': client.spouse?.name || '',
       'spouse.email': client.spouse?.email || '',
       'spouse.phone': client.spouse?.phone || '',
       'spouse.profession': client.spouse?.profession || '',
       'spouse.citizenCardNumber': client.spouse?.citizenCardNumber || '',
       'spouse.nif': client.spouse?.nif || '',
       'address.street': client.address?.street || '',
       'address.number': client.address?.number || '',
       'address.floor': client.address?.floor || '',
       'address.postalCode': client.address?.postalCode || '',
       'address.city': client.address?.city || '',
       'address.parish': client.address?.parish || '',
       'address.municipality': client.address?.municipality || '',
       'address.district': client.address?.district || '',
       'financialInfo.monthlyIncome': client.financialInfo?.monthlyIncome || '',
       'financialInfo.spouseMonthlyIncome': client.financialInfo?.spouseMonthlyIncome || '',
       'financialInfo.availableCapital': client.financialInfo?.availableCapital || '',
       'financialInfo.creditSituation': client.financialInfo?.creditSituation || '',
       'financialInfo.primaryBank': client.financialInfo?.primaryBank || '',
       'financialInfo.hasBankPreApproval': client.financialInfo?.hasBankPreApproval || false,
       'financialInfo.preApprovalDetails': client.financialInfo?.preApprovalDetails || '',
       'contactPreferences.preferredMethod': client.contactPreferences?.preferredMethod || '',
       'contactPreferences.bestTimeToCall': client.contactPreferences?.bestTimeToCall || '',
       'contactPreferences.daysAvailable': client.contactPreferences?.daysAvailable || [],
       tags: client.tags || [],
       'source.channel': client.source?.channel || '',
       'source.details': client.source?.details || '',
       'source.referralSource': client.source?.referralSource || '',
       'gdprConsents.dataProcessing': client.gdprConsents?.dataProcessing || false,
       'gdprConsents.marketing': client.gdprConsents?.marketing || false,
       status: client.status || 'active',
       notes: client.notes || '',
       consultorNotes: client.consultorNotes || '',
       nextContactDate: client.nextContactDate || null
     };
   }
   
   // Default values for new client
   return {
     name: '',
     email: '',
     phone: '',
     status: 'active',
     'gdprConsents.dataProcessing': false,
     'gdprConsents.marketing': false
   };
 };

 if (loading && isEditing) {
   return (
     <div className="p-6">
       <div className="flex items-center space-x-4 mb-6">
         <button 
           onClick={handleCancel}
           className="p-2 rounded-md"
           style={{ color: theme.colors.text.secondary }}
         >
           <ArrowLeftIcon className="w-5 h-5" />
         </button>
         <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
           {pageTitle}
         </h1>
       </div>
       <div className="flex justify-center py-12">
         <LoadingSpinner size="lg" text="A carregar dados do cliente..." />
       </div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="p-6">
       <div className="flex items-center space-x-4 mb-6">
         <button 
           onClick={handleCancel}
           className="p-2 rounded-md"
           style={{ color: theme.colors.text.secondary }}
         >
           <ArrowLeftIcon className="w-5 h-5" />
         </button>
         <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
           {pageTitle}
         </h1>
       </div>
       
       <div 
         className="p-4 rounded-md"
         style={{ 
           backgroundColor: theme.colors.error + '20',
           border: \1px solid \40\
         }}
       >
         <p style={{ color: theme.colors.error }}>{error}</p>
         <button
           onClick={() => window.location.reload()}
           className="mt-2 text-sm underline"
           style={{ color: theme.colors.error }}
         >
           Tentar novamente
         </button>
       </div>
     </div>
   );
 }

 return (
   <div className="p-6">
     {/* Header */}
     <div className="flex items-center space-x-4 mb-6">
       <button 
         onClick={handleCancel}
         className="p-2 rounded-md transition-colors"
         style={{ color: theme.colors.text.secondary }}
         onMouseEnter={(e) => {
           e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.backgroundColor = 'transparent';
         }}
       >
         <ArrowLeftIcon className="w-5 h-5" />
       </button>
       
       <div className="flex-1">
         <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
           {pageTitle}
         </h1>
         {isEditing && client && (
           <p style={{ color: theme.colors.text.secondary }}>
             Cliente desde {client.createdAt.toLocaleDateString()}
           </p>
         )}
       </div>
       
       {error && (
         <div 
           className="px-3 py-2 rounded-md text-sm"
           style={{ 
             backgroundColor: theme.colors.error + '20',
             color: theme.colors.error
           }}
         >
           {error}
         </div>
       )}
     </div>

     {/* Form */}
     <div className="max-w-4xl">
       <DynamicForm
         fields={CLIENT_FIELDS}
         initialData={getInitialData()}
         onSubmit={handleSubmit}
         onCancel={handleCancel}
         submitLabel={
           saving 
             ? (isEditing ? 'A atualizar...' : 'A criar...') 
             : (isEditing ? 'Atualizar Cliente' : 'Criar Cliente')
         }
         isLoading={saving}
       />
     </div>
   </div>
 );
};
