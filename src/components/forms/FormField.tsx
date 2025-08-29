// src/components/forms/FormField.tsx
import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { FieldDefinition } from '../../config/field-definitions';
import { useTheme } from '../../hooks/useTheme';
import { useClientTranslation } from '../../hooks/useTranslation';

interface FormFieldProps {
 field: FieldDefinition;
 register: UseFormRegister<any>;
 error?: FieldError;
 value?: any;
 onChange?: (value: any) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
 field,
 register,
 error,
 value,
 onChange
}) => {
 const { theme } = useTheme();
 const { t } = useClientTranslation();

 const getFieldProps = () => {
   const baseProps = {
     ...register(field.key, {
       required: field.required ? t('client.validation.required') : false,
       ...(field.validation && {
         minLength: field.validation.min ? {
           value: field.validation.min,
           message: \Mínimo \ caracteres\
         } : undefined,
         maxLength: field.validation.max ? {
           value: field.validation.max,
           message: \Máximo \ caracteres\
         } : undefined,
         pattern: field.validation.pattern ? {
           value: getValidationPattern(field.validation.pattern),
           message: getValidationMessage(field.validation.pattern)
         } : undefined
       })
     }),
     placeholder: field.placeholder ? t(field.placeholder) : undefined,
     className: \lock w-full rounded-md text-sm transition-colors \\,
     style: {
       backgroundColor: theme.colors.background.primary,
       borderColor: error ? theme.colors.error : theme.colors.border.medium,
       color: theme.colors.text.primary,
       padding: '0.5rem 0.75rem'
     }
   };

   return baseProps;
 };

 const getValidationPattern = (pattern: string) => {
   const patterns: Record<string, RegExp> = {
     email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
     phone_pt: /^(\+351)?[0-9]{9}$/,
     nif_pt: /^[0-9]{9}$/,
     citizen_card_pt: /^[0-9]{8}\s[0-9]\s[A-Z]{2}[0-9]$/,
     postal_code_pt: /^[0-9]{4}-[0-9]{3}$/
   };
   
   return patterns[pattern] || new RegExp(pattern);
 };

 const getValidationMessage = (pattern: string) => {
   const messages: Record<string, string> = {
     email: t('client.validation.email'),
     phone_pt: t('client.validation.phone'),
     nif_pt: t('client.validation.nif'),
     citizen_card_pt: t('client.validation.citizenCard'),
     postal_code_pt: t('client.validation.postalCode')
   };
   
   return messages[pattern] || 'Formato inválido';
 };

 const renderField = () => {
   switch (field.type) {
     case 'text':
     case 'email':
     case 'phone':
       return <input type={field.type === 'phone' ? 'tel' : field.type} {...getFieldProps()} />;
     
     case 'date':
       return <input type="date" {...getFieldProps()} />;
     
     case 'currency':
       return (
         <div className="relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <span style={{ color: theme.colors.text.muted }}>€</span>
           </div>
           <input 
             type="number" 
             step="0.01"
             {...getFieldProps()} 
             style={{
               ...getFieldProps().style,
               paddingLeft: '2rem'
             }}
           />
         </div>
       );
     
     case 'textarea':
       return (
         <textarea 
           rows={3} 
           {...getFieldProps()} 
           style={{
             ...getFieldProps().style,
             minHeight: '80px',
             resize: 'vertical'
           }}
         />
       );
     
     case 'select':
       return (
         <select {...getFieldProps()}>
           <option value="">Selecione...</option>
           {field.options?.map((option) => (
             <option key={option.value} value={option.value}>
               {t(option.label)}
             </option>
           ))}
         </select>
       );
     
     case 'multiselect':
       return (
         <div className="space-y-2">
           {field.options?.map((option) => (
             <label key={option.value} className="flex items-center">
               <input
                 type="checkbox"
                 value={option.value}
                 checked={Array.isArray(value) && value.includes(option.value)}
                 onChange={(e) => {
                   const currentValues = Array.isArray(value) ? value : [];
                   const newValues = e.target.checked
                     ? [...currentValues, option.value]
                     : currentValues.filter(v => v !== option.value);
                   onChange?.(newValues);
                 }}
                 className="rounded mr-2"
                 style={{
                   borderColor: theme.colors.border.medium,
                   color: theme.colors.primary[600]
                 }}
               />
               <span className="text-sm" style={{ color: theme.colors.text.primary }}>
                 {t(option.label)}
               </span>
             </label>
           ))}
         </div>
       );
     
     case 'checkbox':
       return (
         <label className="flex items-center">
           <input
             type="checkbox"
             {...register(field.key)}
             className="rounded mr-2"
             style={{
               borderColor: theme.colors.border.medium,
               color: theme.colors.primary[600]
             }}
           />
           <span className="text-sm" style={{ color: theme.colors.text.primary }}>
             {t(field.label)}
           </span>
         </label>
       );
     
     case 'file':
       return (
         <input
           type="file"
           accept={field.acceptedFileTypes?.join(',')}
           {...getFieldProps()}
           className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
           style={{
             backgroundColor: theme.colors.background.primary,
             color: theme.colors.text.primary,
             border: \1px solid \\
           }}
         />
       );
     
     default:
       return <input type="text" {...getFieldProps()} />;
   }
 };

 return (
   <div className="space-y-1">
     {field.type !== 'checkbox' && (
       <label 
         htmlFor={field.key}
         className="block text-sm font-medium"
         style={{ color: theme.colors.text.primary }}
       >
         {t(field.label)}
         {field.required && (
           <span style={{ color: theme.colors.error }}> *</span>
         )}
       </label>
     )}
     
     {renderField()}
     
     {field.helpText && (
       <p className="text-xs" style={{ color: theme.colors.text.muted }}>
         {t(field.helpText)}
       </p>
     )}
     
     {error && (
       <p className="text-xs" style={{ color: theme.colors.error }}>
         {error.message}
       </p>
     )}
   </div>
 );
};
