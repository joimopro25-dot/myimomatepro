// config/field-definitions.ts
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
  // Campos obrigatórios
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
    icon: 'EnvelopeIcon',
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
  // Dados pessoais opcionais
  {
    key: 'personalInfo.citizenCardNumber',
    type: 'text',
    label: 'client.fields.personalInfo.citizenCardNumber',
    category: 'personal',
    section: 'identification',
    required: false,
    validation: { pattern: 'citizen_card_pt' },
    placeholder: 'client.placeholders.citizenCardNumber',
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
    width: 'half',
    isSystem: false,
    isAuditable: true,
    isSearchable: true,
    isExportable: false
  }
];

export const getFieldsBySection = (section: string): FieldDefinition[] => {
  return CLIENT_FIELDS.filter(field => field.section === section);
};

export const getFieldsByCategory = (category: string): FieldDefinition[] => {
  return CLIENT_FIELDS.filter(field => field.category === category);
};

export const getRequiredFields = (): FieldDefinition[] => {
  return CLIENT_FIELDS.filter(field => field.required);
};
