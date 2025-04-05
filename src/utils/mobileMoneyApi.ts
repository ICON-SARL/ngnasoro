
// Define mobile money API response types
export interface MobileMoneyResponse {
  success: boolean;
  message?: string;
  transactionId: string | null;
  error?: string;
}

export interface QRCodeResponse {
  success: boolean;
  qrCodeData?: string;
  referenceId?: string;
  expiresAt?: string;
  error?: string;
}

// Mock implementation for mobile money API
export const mobileMoneyApi = {
  initiatePayment: async (phoneNumber: string, amount: number, provider: string): Promise<MobileMoneyResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Mobile Money payment initiated to ${phoneNumber} via ${provider}`,
      transactionId: `MM-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  },
  
  initiateWithdrawal: async (phoneNumber: string, amount: number, provider: string): Promise<MobileMoneyResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Mobile Money withdrawal initiated to ${phoneNumber} via ${provider}`,
      transactionId: `MMW-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  },
  
  generateQRCode: async (amount: number, type: 'payment' | 'withdrawal'): Promise<QRCodeResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      qrCodeData: `data:image/svg+xml;base64,${btoa('<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="150" fill="white"/><rect x="10" y="10" width="130" height="130" fill="#0D6A51" opacity="0.1"/><text x="75" y="80" font-size="12" text-anchor="middle">QR Code</text></svg>')}`,
      referenceId: `QR-${type.toUpperCase()}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }
};
