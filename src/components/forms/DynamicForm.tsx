// src/components/forms/DynamicForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FieldDefinition, FORM_TABS } from '../../config/field-definitions';
import { FormField } from './FormField';
import { useTheme } from '../../hooks/useTheme';
import { useClientTranslation } from '../../hooks/useTranslation';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface DynamicFormProps {
 fields: FieldDefinition[];
 initialData?: Record<string, any>;
 onSubmit: (data: Record<string, any>) => Promise<void>;
 onCancel?: () => void;
 submitLabel?: string;
 isLoading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
 fields,
 initialData = {},
 onSubmit,
 onCancel,
 submitLabel = 'Guardar',
 isLoading = false
}) => {
 const { theme } = useTheme();
 const { t } = useClientTranslation();
 const [activeTab, setActiveTab] = useState('personal');
 const [submitting, setSubmitting] = useState(false);

 const {
   register,
   handleSubmit,
   watch,
   setValue,
   formState: { errors, isDirty }
 } = useForm({
   defaultValues: initialData
 });

 const watchedValues = watch();

 // Check field visibility based on conditions
 const isFieldVisible = (field: FieldDefinition) => {
   if (!field.dependsOn || !field.showWhen) return true;
   
   const dependentValue = watchedValues[field.dependsOn];
   const showConditions = field.showWhen[field.dependsOn];
   
   if (Array.isArray(showConditions)) {
     return showConditions.includes(dependentValue);
   }
   
   return dependentValue === showConditions;
 };

 // Get fields for current tab
 const getCurrentTabFields = () => {
   const currentTab = FORM_TABS.find(tab => tab.id === activeTab);
   if (!currentTab) return [];
   
   return fields.filter(field => 
     currentTab.sections.includes(field.section) && isFieldVisible(field)
   );
 };

 // Group fields by section within current tab
 const getFieldsBySection = () => {
   const tabFields = getCurrentTabFields();
   const sections: Record<string, FieldDefinition[]> = {};
   
   tabFields.forEach(field => {
     if (!sections[field.section]) {
       sections[field.section] = [];
     }
     sections[field.section].push(field);
   });
   
   return sections;
 };

 const handleFormSubmit = async (data: Record<string, any>) => {
   setSubmitting(true);
   try {
     await onSubmit(data);
   } catch (error) {
     console.error('Form submission error:', error);
   } finally {
     setSubmitting(false);
   }
 };

 const getSectionTitle = (sectionKey: string) => {
   const sectionTitles: Record<string, string> = {
     basic: 'Informações Básicas',
     identification: 'Identificação',
     professional: 'Dados Profissionais', 
     family: 'Dados Familiares',
     address: 'Morada',
     financial: 'Situação Financeira',
     preferences: 'Preferências de Contacto',
     tags: 'Tags e Classificações',
     source: 'Origem do Cliente',
     gdpr: 'Consentimentos'
   };
   
   return sectionTitles[sectionKey] || sectionKey;
 };

 return (
   <div 
     className="bg-white rounded-lg shadow-sm"
     style={{ 
       backgroundColor: theme.colors.background.primary,
       border: \1px solid \\
     }}
   >
     {/* Tabs */}
     <div className="border-b" style={{ borderColor: theme.colors.border.light }}>
       <nav className="flex space-x-8 px-6">
         {FORM_TABS.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={\py-4 px-1 border-b-2 font-medium text-sm transition-colors \\}
             style={{
               color: activeTab === tab.id 
                 ? theme.colors.primary[600] 
                 : theme.colors.text.secondary,
               borderBottomColor: activeTab === tab.id 
                 ? theme.colors.primary[600] 
                 : 'transparent'
             }}
           >
             {t(tab.label)}
           </button>
         ))}
       </nav>
     </div>

     {/* Form content */}
     <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
       <div className="space-y-8">
         {Object.entries(getFieldsBySection()).map(([sectionKey, sectionFields]) => (
           <div key={sectionKey}>
             <h3 className="text-lg font-medium mb-4"
                 style={{ color: theme.colors.text.primary }}>
               {getSectionTitle(sectionKey)}
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {sectionFields.map((field) => (
                 <div
                   key={field.key}
                   className={\\\}
                 >
                   <FormField
                     field={field}
                     register={register}
                     error={errors[field.key]}
                     value={watchedValues[field.key]}
                     onChange={(value) => setValue(field.key, value)}
                   />
                 </div>
               ))}
             </div>
           </div>
         ))}
       </div>

       {/* Form actions */}
       <div className="flex justify-end space-x-4 mt-8 pt-6"
            style={{ borderTop: \1px solid \\ }}>
         {onCancel && (
           <button
             type="button"
             onClick={onCancel}
             disabled={submitting}
             className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
             style={{
               color: theme.colors.text.secondary,
               backgroundColor: theme.colors.background.secondary,
               border: \1px solid \\
             }}
           >
             Cancelar
           </button>
         )}
         
         <button
           type="submit"
           disabled={submitting || isLoading}
           className="px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center"
           style={{
             color: 'white',
             backgroundColor: theme.colors.primary[600]
           }}
         >
           {(submitting || isLoading) && (
             <LoadingSpinner size="sm" className="mr-2" />
           )}
           {submitLabel}
         </button>
       </div>
     </form>
   </div>
 );
};
