import { api } from './api';

export interface KYCStatus {
  kyc_status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  has_submission: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected' | null;
  rejection_reason?: string | null;
  submitted_at?: string | null;
}

export interface KYCSubmitData {
  document_type: 'CI' | 'Passport' | 'License';
  document_front: {
    uri: string;
    name: string;
    type: string;
  };
  document_back: {
    uri: string;
    name: string;
    type: string;
  };
  selfie_image: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface KYCSubmitResponse {
  message: string;
  kyc_status: string;
  verification: any;
}

export const kycService = {
  async submitKYC(data: KYCSubmitData, token: string): Promise<KYCSubmitResponse> {
    const formData = new FormData();
    
    formData.append('document_type', data.document_type);
    
    // Append images
    formData.append('document_front', {
      uri: data.document_front.uri,
      name: data.document_front.name,
      type: data.document_front.type,
    } as any);
    
    formData.append('document_back', {
      uri: data.document_back.uri,
      name: data.document_back.name,
      type: data.document_back.type,
    } as any);
    
    formData.append('selfie_image', {
      uri: data.selfie_image.uri,
      name: data.selfie_image.name,
      type: data.selfie_image.type,
    } as any);
    
    const url = `${api.baseURL}/auth/kyc/submit/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData.error || responseData.detail || 'Error al enviar documentos',
        data: responseData,
      };
    }
    
    return responseData;
  },
  
  async getKYCStatus(token: string): Promise<KYCStatus> {
    return api.get('/auth/kyc/status/', token);
  },
  
  async resubmitKYC(data: KYCSubmitData, token: string): Promise<KYCSubmitResponse> {
    const formData = new FormData();
    
    formData.append('document_type', data.document_type);
    formData.append('document_front', {
      uri: data.document_front.uri,
      name: data.document_front.name,
      type: data.document_front.type,
    } as any);
    formData.append('document_back', {
      uri: data.document_back.uri,
      name: data.document_back.name,
      type: data.document_back.type,
    } as any);
    formData.append('selfie_image', {
      uri: data.selfie_image.uri,
      name: data.selfie_image.name,
      type: data.selfie_image.type,
    } as any);
    
    const url = `${api.baseURL}/auth/kyc/resubmit/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData.error || responseData.detail || 'Error al reenviar documentos',
        data: responseData,
      };
    }
    
    return responseData;
  },
};