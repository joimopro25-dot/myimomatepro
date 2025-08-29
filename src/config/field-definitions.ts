// src/config/field-definitions.ts - VERSÃO COMPLETA
export interface FieldDefinition {
 key: string;
 type: 'text' | 'email' | 'phone' | 'date' | 'currency' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'file';
 label: string;
 category: 'personal' | 'financial' | 'contact' | 'documentation' | 'professional';
 section: string;
 required: boolean;
 validation?: {
   min?: number;
   max?: number;
   pattern?: string;
   custom?: string;
 };
 placeholder?: string;
 helpText?: string;
 icon?: string;
 width?: 'full' | 'half' | 'third';
 dependsOn?: string;
 showWhen?: any;
 options?: { value: string; label: string }[];
 optionsSource?: 'api' | 'enum';
 acceptedFileTypes?: string[];
 maxFileSize?: number;
 isSystem: boolean;
 isAuditable: boolean;
 isSearchable: boolean;
 isExportable: boolean;
}

export const CLIENT_FIELDS: FieldDefinition[] = [
 // === CAMPOS OBRIGATÓRIOS ===
 {
   key: 'name',
   type: 'text',
   label: 'client.fields.name',
   category: 'personal',
   section: 'basic',
   required: true,
   validation: { min: 2, max: 100 },
   placeholder: 'client.placeholders.name',
   icon: 'UserIcon',
   width: 'full',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'email',
   type: 'email',
   label: 'client.fields.email',
   category: 'contact',
   section: 'basic',
   required: true,
   validation: { pattern: 'email' },
   placeholder: 'client.placeholders.email',
   icon: 'MailIcon',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'phone',
   type: 'phone',
   label: 'client.fields.phone',
   category: 'contact',
   section: 'basic',
   required: true,
   validation: { pattern: 'phone_pt' },
   placeholder: 'client.placeholders.phone',
   icon: 'PhoneIcon',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === TAB 1: DADOS PESSOAIS ===
 // Identificação
 {
   key: 'personalInfo.citizenCardNumber',
   type: 'text',
   label: 'client.fields.personalInfo.citizenCardNumber',
   category: 'personal',
   section: 'identification',
   required: false,
   validation: { pattern: 'citizen_card_pt' },
   placeholder: 'client.placeholders.citizenCardNumber',
   icon: 'CreditCardIcon',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: false
 },
 {
   key: 'personalInfo.citizenCardValidity',
   type: 'date',
   label: 'client.fields.personalInfo.citizenCardValidity',
   category: 'personal',
   section: 'identification',
   required: false,
   dependsOn: 'personalInfo.citizenCardNumber',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: false
 },
 {
   key: 'personalInfo.nif',
   type: 'text',
   label: 'client.fields.personalInfo.nif',
   category: 'personal',
   section: 'identification',
   required: false,
   validation: { pattern: 'nif_pt' },
   placeholder: 'client.placeholders.nif',
   icon: 'HashIcon',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: false
 },
 {
   key: 'personalInfo.birthDate',
   type: 'date',
   label: 'client.fields.personalInfo.birthDate',
   category: 'personal',
   section: 'identification',
   required: false,
   width: 'half',
   icon: 'CalendarIcon',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: true
 },

 // Naturalidade
 {
   key: 'personalInfo.nationality',
   type: 'select',
   label: 'client.fields.personalInfo.nationality',
   category: 'personal',
   section: 'identification',
   required: false,
   options: [
     { value: 'PT', label: 'Portuguesa' },
     { value: 'BR', label: 'Brasileira' },
     { value: 'ES', label: 'Espanhola' },
     { value: 'FR', label: 'Francesa' },
     { value: 'OTHER', label: 'Outra' }
   ],
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'personalInfo.birthPlace',
   type: 'text',
   label: 'client.fields.personalInfo.birthPlace',
   category: 'personal',
   section: 'identification',
   required: false,
   placeholder: 'Ex: Porto',
   width: 'third',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'personalInfo.parish',
   type: 'text',
   label: 'client.fields.personalInfo.parish',
   category: 'personal',
   section: 'identification',
   required: false,
   placeholder: 'Ex: Cedofeita',
   width: 'third',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'personalInfo.municipality',
   type: 'text',
   label: 'client.fields.personalInfo.municipality',
   category: 'personal',
   section: 'identification',
   required: false,
   placeholder: 'Ex: Porto',
   width: 'third',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // Profissão e Estado Civil
 {
   key: 'personalInfo.profession',
   type: 'text',
   label: 'client.fields.personalInfo.profession',
   category: 'professional',
   section: 'professional',
   required: false,
   placeholder: 'client.placeholders.profession',
   icon: 'BriefcaseIcon',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'personalInfo.maritalStatus',
   type: 'select',
   label: 'client.fields.personalInfo.maritalStatus',
   category: 'personal',
   section: 'family',
   required: false,
   options: [
     { value: 'single', label: 'client.options.maritalStatus.single' },
     { value: 'married', label: 'client.options.maritalStatus.married' },
     { value: 'divorced', label: 'client.options.maritalStatus.divorced' },
     { value: 'widowed', label: 'client.options.maritalStatus.widowed' },
     { value: 'civil_union', label: 'client.options.maritalStatus.civil_union' }
   ],
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // Dados do Cônjuge (condicionais)
 {
   key: 'spouse.name',
   type: 'text',
   label: 'client.fields.spouse.name',
   category: 'personal',
   section: 'family',
   required: false,
   dependsOn: 'personalInfo.maritalStatus',
   showWhen: { 'personalInfo.maritalStatus': ['married', 'civil_union'] },
   placeholder: 'Nome completo do cônjuge',
   width: 'full',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'spouse.email',
   type: 'email',
   label: 'client.fields.spouse.email',
   category: 'contact',
   section: 'family',
   required: false,
   dependsOn: 'spouse.name',
   placeholder: 'Email do cônjuge',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'spouse.phone',
   type: 'phone',
   label: 'client.fields.spouse.phone',
   category: 'contact',
   section: 'family',
   required: false,
   dependsOn: 'spouse.name',
   placeholder: '+351 912 345 678',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === MORADA ===
 {
   key: 'address.street',
   type: 'text',
   label: 'client.fields.address.street',
   category: 'contact',
   section: 'address',
   required: false,
   placeholder: 'Rua, Avenida, Praça...',
   width: 'full',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },
 {
   key: 'address.number',
   type: 'text',
   label: 'client.fields.address.number',
   category: 'contact',
   section: 'address',
   required: false,
   placeholder: '123',
   width: 'third',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: true
 },
 {
   key: 'address.floor',
   type: 'text',
   label: 'client.fields.address.floor',
   category: 'contact',
   section: 'address',
   required: false,
   placeholder: '2º Esq',
   width: 'third',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: true
 },
 {
   key: 'address.postalCode',
   type: 'text',
   label: 'client.fields.address.postalCode',
   category: 'contact',
   section: 'address',
   required: false,
   validation: { pattern: 'postal_code_pt' },
   placeholder: '4000-000',
   width: 'third',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === TAB 2: INFORMAÇÕES FINANCEIRAS ===
 {
   key: 'financialInfo.monthlyIncome',
   type: 'currency',
   label: 'client.fields.financialInfo.monthlyIncome',
   category: 'financial',
   section: 'financial',
   required: false,
   placeholder: 'client.placeholders.monthlyIncome',
   icon: 'EuroIcon',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: false
 },
 {
   key: 'financialInfo.spouseMonthlyIncome',
   type: 'currency',
   label: 'client.fields.financialInfo.spouseMonthlyIncome',
   category: 'financial',
   section: 'financial',
   required: false,
   dependsOn: 'spouse.name',
   placeholder: '0',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: false
 },
 {
   key: 'financialInfo.availableCapital',
   type: 'currency',
   label: 'client.fields.financialInfo.availableCapital',
   category: 'financial',
   section: 'financial',
   required: false,
   placeholder: 'client.placeholders.availableCapital',
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: false,
   isExportable: false
 },
 {
   key: 'financialInfo.creditSituation',
   type: 'select',
   label: 'client.fields.financialInfo.creditSituation',
   category: 'financial',
   section: 'financial',
   required: false,
   options: [
     { value: 'no_credit', label: 'client.options.creditSituation.no_credit' },
     { value: 'mortgage', label: 'client.options.creditSituation.mortgage' },
     { value: 'personal_loan', label: 'client.options.creditSituation.personal_loan' },
     { value: 'car_loan', label: 'client.options.creditSituation.car_loan' },
     { value: 'multiple_credits', label: 'client.options.creditSituation.multiple_credits' }
   ],
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === TAB 3: PREFERÊNCIAS DE CONTACTO ===
 {
   key: 'contactPreferences.preferredMethod',
   type: 'select',
   label: 'client.fields.contactPreferences.preferredMethod',
   category: 'contact',
   section: 'preferences',
   required: false,
   options: [
     { value: 'phone', label: 'client.options.contactMethod.phone' },
     { value: 'email', label: 'client.options.contactMethod.email' },
     { value: 'whatsapp', label: 'client.options.contactMethod.whatsapp' },
     { value: 'sms', label: 'client.options.contactMethod.sms' }
   ],
   width: 'half',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === TAGS E CLASSIFICAÇÕES ===
 {
   key: 'tags',
   type: 'multiselect',
   label: 'Tags',
   category: 'professional',
   section: 'tags',
   required: false,
   options: [
     { value: 'vip', label: 'client.tags.vip' },
     { value: 'urgent', label: 'client.tags.urgent' },
     { value: 'investor', label: 'client.tags.investor' },
     { value: 'first_home', label: 'client.tags.first_home' },
     { value: 'financing_approved', label: 'client.tags.financing_approved' },
     { value: 'no_rush', label: 'client.tags.no_rush' },
     { value: 'demanding', label: 'client.tags.demanding' },
     { value: 'flexible_location', label: 'client.tags.flexible_location' },
     { value: 'high_budget', label: 'client.tags.high_budget' },
     { value: 'referral', label: 'client.tags.referral' },
     { value: 'returning_client', label: 'client.tags.returning_client' }
   ],
   width: 'full',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === ORIGEM ===
 {
   key: 'source.channel',
   type: 'select',
   label: 'Como nos conheceu?',
   category: 'professional',
   section: 'source',
   required: false,
   options: [
     { value: 'website', label: 'client.options.source.website' },
     { value: 'google', label: 'client.options.source.google' },
     { value: 'facebook', label: 'client.options.source.facebook' },
     { value: 'instagram', label: 'client.options.source.instagram' },
     { value: 'referral', label: 'client.options.source.referral' },
     { value: 'real_estate_portal', label: 'client.options.source.real_estate_portal' },
     { value: 'outdoor_advertising', label: 'client.options.source.outdoor_advertising' },
     { value: 'radio', label: 'client.options.source.radio' },
     { value: 'newspaper', label: 'client.options.source.newspaper' },
     { value: 'cold_call', label: 'client.options.source.cold_call' },
     { value: 'other', label: 'client.options.source.other' }
   ],
   width: 'full',
   isSystem: false,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 },

 // === CAMPOS DE SISTEMA ===
 {
   key: 'status',
   type: 'select',
   label: 'Status',
   category: 'professional',
   section: 'system',
   required: true,
   options: [
     { value: 'active', label: 'Ativo' },
     { value: 'inactive', label: 'Inativo' },
     { value: 'archived', label: 'Arquivado' }
   ],
   width: 'half',
   isSystem: true,
   isAuditable: true,
   isSearchable: true,
   isExportable: true
 }
];

// Funções utilitárias
export const getFieldsBySection = (section: string): FieldDefinition[] => {
 return CLIENT_FIELDS.filter(field => field.section === section);
};

export const getFieldsByCategory = (category: string): FieldDefinition[] => {
 return CLIENT_FIELDS.filter(field => field.category === category);
};

export const getRequiredFields = (): FieldDefinition[] => {
 return CLIENT_FIELDS.filter(field => field.required);
};

export const getSearchableFields = (): FieldDefinition[] => {
 return CLIENT_FIELDS.filter(field => field.isSearchable);
};

export const getExportableFields = (): FieldDefinition[] => {
 return CLIENT_FIELDS.filter(field => field.isExportable);
};

export const getConditionalFields = (): FieldDefinition[] => {
 return CLIENT_FIELDS.filter(field => field.dependsOn);
};

// Mapeamento de seções para tabs
export const FORM_TABS = [
 {
   id: 'personal',
   label: 'client.tabs.personalInfo',
   sections: ['basic', 'identification', 'professional', 'family', 'address']
 },
 {
   id: 'financial',
   label: 'client.tabs.financialInfo', 
   sections: ['financial']
 },
 {
   id: 'documentation',
   label: 'client.tabs.documentation',
   sections: ['preferences', 'tags', 'source', 'gdpr']
 }
];
