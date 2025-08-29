// templates/visit-form.template.ts
import { DocumentTemplate } from '../types/document.types';

export const visitFormTemplate: DocumentTemplate = {
  id: 'visit-form-v2',
  name: 'Ficha de Visita',
  type: 'visit_form',
  category: 'property',
  version: '2.0',
  
  autoFillFields: [
    { fieldName: 'cliente_nome', dataSource: 'client', sourcePath: 'name' },
    { fieldName: 'cliente_cc', dataSource: 'client', sourcePath: 'personalInfo.citizenCardNumber' },
    { fieldName: 'cliente_telefone', dataSource: 'client', sourcePath: 'phone', format: 'phone' },
    { fieldName: 'cliente_email', dataSource: 'client', sourcePath: 'email' },
    { fieldName: 'agente_nome', dataSource: 'user', sourcePath: 'name' },
    { fieldName: 'agente_telefone', dataSource: 'user', sourcePath: 'phone', format: 'phone' },
    { fieldName: 'imovel_referencia', dataSource: 'property', sourcePath: 'reference' },
    { fieldName: 'imovel_morada', dataSource: 'property', sourcePath: 'address.full' },
    { fieldName: 'imovel_preco', dataSource: 'property', sourcePath: 'price', format: 'currency' },
    { fieldName: 'imovel_tipologia', dataSource: 'property', sourcePath: 'typology' },
    { fieldName: 'visita_data', dataSource: 'deal', sourcePath: 'visitDate', format: 'date' },
    { fieldName: 'visita_hora', dataSource: 'deal', sourcePath: 'visitTime' },
    { fieldName: 'empresa_nome', dataSource: 'tenant', sourcePath: 'companyName' },
    { fieldName: 'empresa_logo', dataSource: 'tenant', sourcePath: 'settings.logo' }
  ],
  
  template: \
    <div class="visit-form">
      <header class="form-header">
        <div class="company-branding">
          {{#if empresa_logo}}
          <img src="{{empresa_logo}}" alt="{{empresa_nome}}" class="company-logo" />
          {{/if}}
          <h1 class="form-title">FICHA DE VISITA</h1>
        </div>
        <div class="visit-info">
          <p><strong>Data:</strong> {{visita_data}} <strong>Hora:</strong> {{visita_hora}}</p>
          <p><strong>Referência:</strong> {{imovel_referencia}}</p>
        </div>
      </header>

      <section class="client-qualification">
        <h2>QUALIFICAÇÃO CLIENTE</h2>
        <div class="form-row">
          <div class="field-group">
            <label>Nome*:</label>
            <span class="field-value">{{cliente_nome}}</span>
          </div>
        </div>
        
        <div class="form-row">
          <div class="field-group half-width">
            <label>Cartão de Cidadão*:</label>
            <span class="field-value">{{cliente_cc}}</span>
          </div>
          <div class="field-group half-width">
            <label>Contacto:</label>
            <span class="field-value">{{cliente_telefone}}</span>
          </div>
        </div>
        
        <div class="form-row">
          <div class="field-group">
            <label>Email:</label>
            <span class="field-value">{{cliente_email}}</span>
          </div>
        </div>
      </section>

      <section class="property-info">
        <h2>INFORMAÇÕES DO IMÓVEL</h2>
        <div class="form-row">
          <div class="field-group">
            <label>Morada*:</label>
            <span class="field-value">{{imovel_morada}}</span>
          </div>
        </div>
        
        <div class="form-row">
          <div class="field-group half-width">
            <label>Preço*:</label>
            <span class="field-value price">{{imovel_preco}}</span>
          </div>
          <div class="field-group half-width">
            <label>Tipologia:</label>
            <span class="field-value">{{imovel_tipologia}}</span>
          </div>
        </div>
      </section>

      <section class="property-evaluation">
        <h2>AVALIAÇÃO DO IMÓVEL</h2>
        
        <div class="evaluation-grid">
          <div class="evaluation-item">
            <label>Qualidade Construção:</label>
            <div class="rating-options">
              <label><input type="radio" name="qualidade_construcao" value="mau"> Mau</label>
              <label><input type="radio" name="qualidade_construcao" value="medio"> Médio</label>
              <label><input type="radio" name="qualidade_construcao" value="bom"> Bom</label>
              <label><input type="radio" name="qualidade_construcao" value="muito_bom"> Muito Bom</label>
            </div>
          </div>
          
          <div class="evaluation-item">
            <label>Acabamentos:</label>
            <div class="rating-options">
              <label><input type="radio" name="acabamentos" value="mau"> Mau</label>
              <label><input type="radio" name="acabamentos" value="medio"> Médio</label>
              <label><input type="radio" name="acabamentos" value="bom"> Bom</label>
              <label><input type="radio" name="acabamentos" value="muito_bom"> Muito Bom</label>
            </div>
          </div>
        </div>
      </section>

      <section class="client-feedback">
        <h2>FEEDBACK DO CLIENTE</h2>
        
        <div class="feedback-field">
          <label>O que mais gostou?</label>
          <textarea name="mais_gostou" rows="3"></textarea>
        </div>
        
        <div class="feedback-field">
          <label>O que menos gostou?</label>
          <textarea name="menos_gostou" rows="3"></textarea>
        </div>
        
        <div class="purchase-intention">
          <label>Compraria/Arrendaria este Imóvel?</label>
          <div class="intention-options">
            <label><input type="radio" name="compraria" value="nao"> Não</label>
            <label><input type="radio" name="compraria" value="sim"> Sim</label>
          </div>
          <textarea name="razao_decisao" rows="2" placeholder="Porquê?"></textarea>
        </div>
      </section>

      <footer class="signatures-section">
        <div class="signature-grid">
          <div class="signature-box">
            <label>O Agente Associado</label>
            <div class="signature-line"></div>
            <p class="signatory-name">{{agente_nome}}</p>
          </div>
          
          <div class="signature-box">
            <label>O Cliente</label>
            <div class="signature-line"></div>
            <p class="signatory-name">{{cliente_nome}}</p>
          </div>
          
          <div class="signature-box">
            <label>O Proprietário</label>
            <div class="signature-line"></div>
          </div>
        </div>
      </footer>
    </div>
  \,
  
  styles: \
    .visit-form {
      font-family: 'Inter', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      background: white;
      color: #333;
      line-height: 1.4;
    }
    
    .form-header {
      border-bottom: 3px solid #0369a1;
      padding-bottom: 20px;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .company-logo {
      max-height: 60px;
      margin-bottom: 10px;
    }
    
    .form-title {
      font-size: 28px;
      font-weight: bold;
      color: #0369a1;
      margin: 0;
    }
    
    .visit-info {
      background: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      color: #64748b;
    }
    
    h2 {
      background: linear-gradient(135deg, #0369a1, #0284c7);
      color: white;
      padding: 12px 20px;
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      border-radius: 6px;
    }
    
    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      align-items: center;
    }
    
    .field-group {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .field-group.half-width {
      flex: 0.5;
    }
    
    .field-group label {
      font-weight: 600;
      color: #374151;
      min-width: 120px;
      font-size: 14px;
    }
    
    .field-value {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: #f9fafb;
      font-size: 14px;
    }
    
    .field-value.price {
      font-weight: bold;
      color: #059669;
      font-size: 16px;
    }
    
    .evaluation-grid {
      display: grid;
      gap: 20px;
    }
    
    .evaluation-item {
      border: 1px solid #e5e7eb;
      padding: 15px;
      border-radius: 8px;
      background: #fafafa;
    }
    
    .rating-options {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .rating-options label {
      font-weight: normal;
      font-size: 13px;
      cursor: pointer;
    }
    
    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      box-sizing: border-box;
    }
    
    .signatures-section {
      margin-top: 40px;
      border-top: 2px solid #e5e7eb;
      padding-top: 30px;
    }
    
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 40px;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      height: 50px;
      border-bottom: 1px solid #374151;
      margin: 20px 0 10px 0;
    }
    
    .signatory-name {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
      font-style: italic;
    }
    
    @media print {
      .visit-form {
        padding: 0;
      }
    }
  \,
  
  settings: {
    isEditable: true,
    requiresSignature: true,
    autoGenerate: true,
    triggers: ['visit_scheduled', 'visit_completed']
  },
  
  metadata: {
    createdBy: 'system',
    createdAt: new Date(),
    updatedBy: 'system',
    updatedAt: new Date(),
    tags: ['visita', 'cliente', 'avaliacao', 'imovel']
  }
};
