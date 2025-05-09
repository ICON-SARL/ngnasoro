
import { MobileMoneyResponse, QRCodeResponse } from '@/hooks/mobile-money/types';

// Mock mobile money payment function
export async function processMobileMoneyPayment(
  phoneNumber: string,
  amount: number,
  provider: string,
  description?: string
): Promise<MobileMoneyResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Success response (mock)
  return {
    success: true,
    transactionId: `mm-${Date.now()}`,
    message: "Mobile Money payment initiated"
  };
}

// Mock mobile money withdrawal function
export async function processMobileMoneyWithdrawal(
  phoneNumber: string,
  amount: number,
  provider: string,
  description?: string
): Promise<MobileMoneyResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Success response (mock)
  return {
    success: true,
    transactionId: `mmw-${Date.now()}`,
    message: "Mobile Money withdrawal initiated"
  };
}

// Mock QR code generation function
export async function generateMobileMoneyQRCode(
  amount: number,
  type: 'deposit' | 'withdrawal' | 'loan_payment',
  loanId?: string
): Promise<QRCodeResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock QR code data (usually this would be a base64 string)
  const qrCodeData = `https://mock-qr-code.example.com/${type}/${amount}/${Date.now()}`;
  
  // Set expiration to 5 minutes from now
  const expiration = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  // Success response with QR code data
  return {
    success: true,
    qrCodeData,
    transactionId: `qr-${Date.now()}`,
    expiration
  };
}

// QR code API for scanner functionality
export const qrCodeApi = {
  scanQRCodeForTransaction: async (qrCode: string, userId: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success response (would normally validate QR code and process transaction)
    return {
      success: true,
      message: "Transaction processed successfully",
      transaction: {
        id: `trans-${Date.now()}`,
        amount: 5000,
        date: new Date().toISOString(),
        type: "deposit"
      }
    };
  }
};
