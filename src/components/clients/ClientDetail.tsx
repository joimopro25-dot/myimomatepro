// src/components/clients/ClientDetail.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
 ArrowLeftIcon, 
 EditIcon, 
 ArchiveIcon, 
 PhoneIcon, 
 MailIcon, 
 UserIcon,
 CalendarIcon,
 MapPinIcon,
 BriefcaseIcon,
 EuroIcon,
 TagIcon,
 MoreVerticalIcon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useClientTranslation } from '../../hooks/useTranslation';
import { useTenant } from '../../hooks/useTenant';
import { clientService, Client } from '../../services/clientService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface InfoCardProps {
 title: string;
 icon: React.ComponentType<any>;
 children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon: Icon, children }) => {
 const { theme } = useTheme();
 
 return (
   <div 
     className="p-4 rounded-lg"
     style={{ 
       backgroundColor: theme.colors.background.primary,
       border: \1px solid \\
     }}
   >
     <div className="flex items-center space-x-2 mb-3">
       <Icon className="w-5 h-5" style={{ color: theme.colors.primary[600] }} />
       <h3 className="font-medium" style={{ color: theme.colors.text.primary }}>
         {title}
       </h3>
     </div>
     {children}
   </div>
 );
};

interface InfoRowProps {
 label: string;
 value: string | number | null | undefined;
 type?: 'text' | 'email' | 'phone' | 'date' | 'currency';
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, type = 'text' }) => {
 const { theme } = useTheme();
 
 const formatValue = () => {
   if (!value) return '-';
   
   switch (type) {
     case 'email':
       return (
         <a 
           href={\mailto:\\}
           className="hover:underline"
           style={{ color: theme.colors.primary[600] }}
         >
           {value}
         </a>
       );
     case 'phone':
       return (
         <a 
           href={\	el:\\}
           className="hover:underline"
           style={{ color: theme.colors.primary[600] }}
         >
           {value}
         </a>
       );
     case 'date':
       return new Date(value).toLocaleDateString();
     case 'currency':
       return \€\\;
     default:
       return String(value);
   }
 };

 return (
   <div className="flex justify-between py-2">
     <span style={{ color: theme.colors.text.secondary }}>{label}:</span>
     <span style={{ color: theme.colors.text.primary }}>{formatValue()}</span>
   </div>
 );
};

export const ClientDetail: React.FC = () => {
 const { clientId } = useParams<{ clientId: string }>();
 const navigate = useNavigate();
 const { theme } = useTheme();
 const { t } = useClientTranslation();
 const { tenant } = useTenant();
 
 const [client, setClient] = useState<Client | null>(null);
 const [loading, setLoading] = useState(true);
 const [showActions, setShowActions] = useState(false);
 const [error, setError] = useState<string | null>(null);

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

 const handleArchiveClient = async () => {
   if (!tenant || !clientId || !client) return;
   
   const confirmed = window.confirm('Tem a certeza que pretende arquivar este cliente?');
   if (!confirmed) return;
   
   try {
     await clientService.deleteClient(tenant.id, tenant.id, clientId);
     navigate('/clients');
   } catch (err) {
     console.error('Error archiving client:', err);
     setError('Erro ao arquivar cliente');
   }
 };

 if (loading) {
   return (
     <div className="p-6">
       <div className="flex items-center space-x-4 mb-6">
         <Link 
           to="/clients"
           className="p-2 rounded-md"
           style={{ color: theme.colors.text.secondary }}
         >
           <ArrowLeftIcon className="w-5 h-5" />
         </Link>
         <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
           Cliente
         </h1>
       </div>
       <div className="flex justify-center py-12">
         <LoadingSpinner size="lg" text="A carregar dados do cliente..." />
       </div>
     </div>
   );
 }

 if (error || !client) {
   return (
     <div className="p-6">
       <div className="flex items-center space-x-4 mb-6">
         <Link 
           to="/clients"
           className="p-2 rounded-md"
           style={{ color: theme.colors.text.secondary }}
         >
           <ArrowLeftIcon className="w-5 h-5" />
         </Link>
         <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
           Cliente
         </h1>
       </div>
       
       <div 
         className="p-4 rounded-md"
         style={{ 
           backgroundColor: theme.colors.error + '20',
           border: \1px solid \40\
         }}
       >
         <p style={{ color: theme.colors.error }}>{error || 'Cliente não encontrado'}</p>
       </div>
     </div>
   );
 }

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

 return (
   <div className="p-6">
     {/* Header */}
     <div className="flex items-center justify-between mb-6">
       <div className="flex items-center space-x-4">
         <Link 
           to="/clients"
           className="p-2 rounded-md transition-colors"
           style={{ color: theme.colors.text.secondary }}
         >
           <ArrowLeftIcon className="w-5 h-5" />
         </Link>
         
         <div className="flex items-center space-x-4">
           <div 
             className="w-12 h-12 rounded-full flex items-center justify-center"
             style={{ backgroundColor: theme.colors.primary[100] }}
           >
             <span className="text-lg font-medium"
                   style={{ color: theme.colors.primary[700] }}>
               {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
             </span>
           </div>
           
           <div>
             <h1 className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
               {client.name}
             </h1>
             <p style={{ color: theme.colors.text.secondary }}>
               Cliente desde {client.createdAt.toLocaleDateString()}
             </p>
           </div>
         </div>
       </div>

       {/* Actions */}
       <div className="flex items-center space-x-2">
         <Link
           to={\/clients/\/edit\}
           className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
           style={{
             backgroundColor: theme.colors.primary[600],
             color: 'white'
           }}
         >
           <EditIcon className="w-4 h-4 mr-2" />
           Editar
         </Link>
         
         <div className="relative">
           <button
             onClick={() => setShowActions(!showActions)}
             className="p-2 rounded-md transition-colors"
             style={{ color: theme.colors.text.secondary }}
           >
             <MoreVerticalIcon className="w-5 h-5" />
           </button>
           
           {showActions && (
             <div 
               className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10"
               style={{ 
                 backgroundColor: theme.colors.background.primary,
                 border: \1px solid \\
               }}
             >
               <button
                 onClick={handleArchiveClient}
                 className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                 style={{ color: theme.colors.error }}
               >
                 <ArchiveIcon className="w-4 h-4 mr-3" />
                 Arquivar Cliente
               </button>
             </div>
           )}
         </div>
       </div>
     </div>

     {/* Status and Tags */}
     <div className="flex items-center space-x-4 mb-6">
       <span 
         className="px-3 py-1 text-sm rounded-full"
         style={{
           backgroundColor: client.status === 'active' 
             ? theme.colors.success + '20' 
             : theme.colors.error + '20',
           color: client.status === 'active' 
             ? theme.colors.success 
             : theme.colors.error
         }}
       >
         {client.status === 'active' ? 'Ativo' : 'Inativo'}
       </span>
       
       {client.tags && client.tags.map((tag) => (
         <span
           key={tag}
           className="inline-flex items-center px-2 py-1 text-xs rounded-full"
           style={{
             backgroundColor: getTagColor(tag) + '20',
             color: getTagColor(tag)
           }}
         >
           <TagIcon className="w-3 h-3 mr-1" />
           {t(\client.tags.\\)}
         </span>
       ))}
     </div>

     {/* Content Grid */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
       {/* Contact Information */}
       <InfoCard title="Informações de Contacto" icon={UserIcon}>
         <div className="space-y-1">
           <InfoRow label="Email" value={client.email} type="email" />
           <InfoRow label="Telefone" value={client.phone} type="phone" />
           <InfoRow 
             label="Método Preferido" 
             value={client.contactPreferences?.preferredMethod} 
           />
           <InfoRow 
             label="Melhor Horário" 
             value={client.contactPreferences?.bestTimeToCall} 
           />
         </div>
       </InfoCard>

       {/* Personal Information */}
       <InfoCard title="Dados Pessoais" icon={UserIcon}>
         <div className="space-y-1">
           <InfoRow label="NIF" value={client.personalInfo?.nif} />
           <InfoRow label="Data de Nascimento" value={client.personalInfo?.birthDate} type="date" />
           <InfoRow label="Profissão" value={client.personalInfo?.profession} />
           <InfoRow label="Estado Civil" value={client.personalInfo?.maritalStatus} />
           <InfoRow label="Nacionalidade" value={client.personalInfo?.nationality} />
         </div>
       </InfoCard>

       {/* Address */}
       {(client.address?.street || client.address?.city) && (
         <InfoCard title="Morada" icon={MapPinIcon}>
           <div className="space-y-1">
             <InfoRow 
               label="Rua" 
               value={\\ \\.trim()} 
             />
             <InfoRow label="Andar" value={client.address?.floor} />
             <InfoRow label="Código Postal" value={client.address?.postalCode} />
             <InfoRow label="Cidade" value={client.address?.city} />
             <InfoRow label="Concelho" value={client.address?.municipality} />
           </div>
         </InfoCard>
       )}

       {/* Financial Information */}
       {client.financialInfo && (
         <InfoCard title="Informações Financeiras" icon={EuroIcon}>
           <div className="space-y-1">
             <InfoRow 
               label="Rendimento Mensal" 
               value={client.financialInfo.monthlyIncome} 
               type="currency" 
             />
             {client.financialInfo.spouseMonthlyIncome && (
               <InfoRow 
                 label="Rendimento Cônjuge" 
                 value={client.financialInfo.spouseMonthlyIncome} 
                 type="currency" 
               />
             )}
             <InfoRow 
               label="Capital Disponível" 
               value={client.financialInfo.availableCapital} 
               type="currency" 
             />
             <InfoRow 
               label="Situação de Crédito" 
               value={client.financialInfo.creditSituation} 
             />
             <InfoRow 
               label="Banco Principal" 
               value={client.financialInfo.primaryBank} 
             />
           </div>
         </InfoCard>
       )}

       {/* Spouse Information */}
       {client.spouse?.name && (
         <InfoCard title="Dados do Cônjuge" icon={UserIcon}>
           <div className="space-y-1">
             <InfoRow label="Nome" value={client.spouse.name} />
             <InfoRow label="Email" value={client.spouse.email} type="email" />
             <InfoRow label="Telefone" value={client.spouse.phone} type="phone" />
             <InfoRow label="Profissão" value={client.spouse.profession} />
             <InfoRow label="NIF" value={client.spouse.nif} />
           </div>
         </InfoCard>
       )}

       {/* Notes */}
       {(client.notes || client.consultorNotes) && (
         <InfoCard title="Observações" icon={BriefcaseIcon}>
           {client.notes && (
             <div className="mb-3">
               <h4 className="text-sm font-medium mb-1" style={{ color: theme.colors.text.primary }}>
                 Notas do Cliente:
               </h4>
               <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                 {client.notes}
               </p>
             </div>
           )}
           {client.consultorNotes && (
             <div>
               <h4 className="text-sm font-medium mb-1" style={{ color: theme.colors.text.primary }}>
                 Notas do Consultor:
               </h4>
               <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                 {client.consultorNotes}
               </p>
             </div>
           )}
         </InfoCard>
       )}
     </div>

     {/* Next Contact Date */}
     {client.nextContactDate && (
       <div className="mt-6">
         <div 
           className="p-4 rounded-md"
           style={{ 
             backgroundColor: theme.colors.warning + '20',
             border: \1px solid \40\
           }}
         >
           <div className="flex items-center space-x-2">
             <CalendarIcon className="w-5 h-5" style={{ color: theme.colors.warning }} />
             <span className="font-medium" style={{ color: theme.colors.warning }}>
               Próximo contacto: {client.nextContactDate.toLocaleDateString()}
             </span>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};
