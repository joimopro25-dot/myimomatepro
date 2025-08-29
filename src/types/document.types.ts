// types/document.types.ts
export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'visit_form' | 'cpcv' | 'evaluation' | 'proposal' | 'contract' | 'report';
  category: 'client' | 'property' | 'deal' | 'legal';
  version: string;
  autoFillFields: {
    fieldName: string;
    dataSource: 'client' | 'property' | 'deal' | 'user' | 'tenant';
    sourcePath: string;
    format?: 'currency' | 'date' | 'phone' | 'text';
    fallback?: string;
  }[];
  template: string;
  styles: string;
  settings: {
    isEditable: boolean;
    requiresSignature: boolean;
    autoGenerate: boolean;
    triggers?: string[];
  };
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
    tags: string[];
  };
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  name: string;
  content: string;
  styles: string;
  context: {
    clientId?: string;
    dealId?: string;
    propertyId?: string;
    userId: string;
    tenantId: string;
  };
  data: Record<string, any>;
  generatedAt: Date;
  version: string;
  isEditable: boolean;
  requiresSignature: boolean;
  status: 'draft' | 'final' | 'signed';
}
