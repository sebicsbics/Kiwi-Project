import { api } from './api';

export interface Contract {
  id: number;
  title: string;
  description: string;
  price: string;
  condition: string;
  access_code: string;
  qr_code_data: string;
  qr_code_image: string;
  status: string;
  seller: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  buyer?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  photos: Array<{
    id: number;
    image: string;
    order: number;
    uploaded_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MyTransaction {
  id: number;
  title: string;
  price: string;
  status: string;
  role: 'seller' | 'buyer';
  other_party_name: string;
  main_photo: string | null;
  created_at: string;
}

export interface CreateContractData {
  title: string;
  description?: string;
  price: string;
  condition: string;
  photos: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
}

export interface ContractResponse {
  contract: Contract;
  message: string;
}

export const contractsService = {
  async createContract(data: CreateContractData, token: string): Promise<ContractResponse> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('price', data.price);
    formData.append('condition', data.condition);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    // Append photos
    data.photos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        name: photo.name || `photo_${index}.jpg`,
        type: photo.type || 'image/jpeg',
      } as any);
    });
    
    const url = `${api.baseURL}/contracts/create/`;
    
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
        message: responseData.error || responseData.detail || 'Error al crear el contrato',
        data: responseData,
      };
    }
    
    return responseData;
  },
  
  async getContract(id: number, token: string): Promise<Contract> {
    return api.get(`/contracts/${id}/`, token);
  },
  
  async lookupContract(code: string): Promise<Contract> {
    return api.get(`/contracts/lookup/?code=${code.toUpperCase()}`);
  },
  
  async listContracts(token: string): Promise<Contract[]> {
    return api.get('/contracts/', token);
  },
  
  async getMyTransactions(token: string): Promise<MyTransaction[]> {
    return api.get('/contracts/my_transactions/', token);
  },
};