
export interface QRCodeGenerationHook {
  isProcessingQRCode: boolean;
  generatePaymentQRCode: (amount: number, loanId?: string) => Promise<QRCodeResponse>;
  generateWithdrawalQRCode: (amount: number) => Promise<QRCodeResponse>;
}

export interface QRCodeResponse {
  success: boolean;
  qrData?: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
}
