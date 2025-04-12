
import { useState } from 'react';
import { useToast } from '../use-toast';
import { useAuth } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { QRCodeGenerationHook, QRCodeResponse } from './types';

export function useQRCodeGeneration(): QRCodeGenerationHook {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const generateQRCode = async (amount: number, type: 'payment' | 'withdrawal'): Promise<boolean> => {
    if (!user) {
      setError("User not authenticated");
      toast({
        title: "Error",
        description: "Vous devez être connecté pour générer un code QR",
        variant: "destructive",
      });
      return false;
    }
    
    if (!amount || amount <= 0) {
      setError("Amount must be greater than zero");
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à zéro",
        variant: "destructive",
      });
      return false;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // For this demo, we'll create a mockup QR code
      // In production, call your Supabase function to generate a real QR code
      const mockQRData = `data:image/png;base64,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`;

      // In a real implementation, we'd call the Supabase function:
      /*
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: {
          userId: user.id,
          amount: amount,
          type: type === 'withdrawal' ? 'withdrawal' : 'deposit'
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "QR code generation failed");
      
      setQrCodeData(data.qrData);
      */
      
      // Instead, we'll use a mock QR code
      setQrCodeData(mockQRData);
      return true;
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setError(error.message || "Failed to generate QR code");
      toast({
        title: "Erreur",
        description: "Impossible de générer le code QR",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // For more specific use cases
  const generatePaymentQRCode = async (amount: number, loanId?: string): Promise<QRCodeResponse> => {
    setIsProcessingQRCode(true);
    try {
      // In a real implementation, call the Supabase function
      return {
        success: true,
        qrData: `data:image/png;base64,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`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        transactionId: `qr-${Date.now()}`
      };
    } catch (error: any) {
      console.error('Error generating payment QR code:', error);
      return {
        success: false,
        error: error.message || "Failed to generate payment QR code"
      };
    } finally {
      setIsProcessingQRCode(false);
    }
  };
  
  const generateWithdrawalQRCode = async (amount: number): Promise<QRCodeResponse> => {
    setIsProcessingQRCode(true);
    try {
      // In a real implementation, call the Supabase function
      return {
        success: true,
        qrData: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAADHxJREFUeF7tnVuSHLkRRaGZLazZymzGs5mxJa1lrMQbmLEVezP23/yYtQWLZpHMIqOqEvXIl8B9/eMDRJx7A9VdJunv//jb33+Tj+cjiHwFvn379lc82QWXxfd5gu8bV2f897//8yH69Q+vL1kBIaIkEVXCKuKYRDzfiXyU8VhCM0OaCSoR8FdRQ0QpXz0JdBNBGjMbz+cTz3dORHX5aDJFzg7ILzH+iOjvz3/89vdffJbz/AQFXvFrXcn5TE7EMj0c0efPH7I+IuqoLK6DCjzb8xpDVFfcH3O8Dg46ITsLRYHnJ0S0rCwmg1BqPi2yiB7yiE2z/HTHT+/gQQUISGAp/E5MQkJ+EPAsz9iBZZOAyNzCMIeC4y/PiKh1lk2nZ3laWXj+RAUICKPCUwECAoprBQgIcIMCBAS4QQECAtyggOmY5NWr1y+bKtPL/+cP+Vb/8Uf50nr4j93i+Gub0V9qw9VD/nDRyz9+SWFrJnl92mfyCibZoYXQP5p1xc35qzdv4WvZb28/hs/LFhDTTvpT1lAvkdnqRxlP0QRdKhEYHlK5E27xIKCPnO+tHY2yKfLjTjqJnDj9TIK4RQT3m5CnpAQBsRE8K5fq9dIaZdNn0wIRzLkDa5HfhIjSMhIQ24kN7Zez1C8HZD6qJVdm3r3tN8F/SnE9zOtJMZPgaAylJCCCmKa+tOzlW9Oe4ZXMZEqgmKMnmQKQn+O97B1cLYUJiLCVjg6MqEYmadgoCYDINslJJM8CIpnDHvtKSAtJQLxmHaFEqz0xSSBtfJwWLT5VZEJiA6S1CZLJxpkEicUMgmTb2YKAGCXa7IZJsG7fXwekDQ7YJFdZdv2cBAnHDAKFUkZbEBAjh8/uLN7rZ08Qr0wis/znDYJkZAZBQnllkhK3ISBGUb+7Qy+jgXGDFgWZpCzLXgaIZvK1c4vMqLZA/aQLe10HJ4WAgA1oJJn5LCB4dZ+LvlqJRmFwggJmgPx85kIiMLqA8v4gKwhIlA52/xQ1G+5nCojX+ETcBuYQrJr/5rkFW1G3Q0BiBbTzieqM3Hc+a+F+sDowmwgfNVtIWD0gCCgESC9JIrMLSS4yh2iyffsxuZrTBmZSTL4HnZR2Cghsp+yv/OzV42XANwOI10wSJYiJPhCPW0DsL0Wg0/UckIhlgbZPUXN1A7NL686hqjMfQ7SX2YNhfH93a0Ci9HEJaFGzxQcGYMg51Xc/5VquuLkDBr4zHCXZQ0bJJYeYXRKEJiCjlNFfbzGHjBwZCEbOo0qPkGQ+xGzvO2/tASSz5/ucpKnW9NRYUn7bOWRIiDt7/dE5ScslE7qD4UX3V9QjQDB1bJPkFpD+Yc/zOQnGIEiP0zMJxAXL8EfnJLMCRFvNQXqc5SqQ0d+uazIJEpD9k+wKkD/fCvL88/RCgXOMo3kq7+MrXLNAkq3KTQDRFgVbZTlRdDg6EX+Vq+jA/qwF5xhUQEZTpQwUw3POFlG9BYRhbVEjWYKdKTrmcZgfDwVaFwHRxGAHlrKCi6LIOZoJA2F4QAQG5tQd+8JjYHDOCIh2gBQTMj5q+0k03k0wD8EJQxfSWRs1sxCQW2mXXTk+WKjCHHKrh/Yol7zjI1wExHCJ6rKrJSAW0xakk9o66XE+ZBCLqzbomgTEI8i0qbTZRGlZH4siAQ+6IALShbNpAXsxzb96HQlonUmEPF4WkJYqPgFrM8mdPpWAvP8gTJn9H1LfdAJrH9PfOIJlEI0c1sccawHhnVvXOUXe46uLQQiIQxdtnRrHLdZ2lhPSbFHqRnmn5jAHxNosnYPs+M1H58ZZ9U8HyOM/Hx3zzFvL7jnolX+yq52/ZxLkfWxuQA5rFN5qTm/q9/Jx4Ot2jH8m0a6Lj17NWbSDLQmIEZCIy+YHAXsD5MGWW61+DAHRhNWa2QVkmTH2mklmfAYROcj1CoibVp93zMkkBAQ9+4E6fAJpDKa81NpqpPG8/zxClzUBqZ67txiDQPXuXQ4JyBcBy99JrM3sHZCHxGRlkjMCkt1i8zHI8rJ+9n89vwukl5h73c+u3hAQX/nq8aRPJllnTcZNAWrC8mxUxZAWkFbcIwJyB0g0UURmpvNV9VH13ZMsf4XLakCOCshIIgmpKR83Af3qdRkgZ0gll4CEWwkbTXdtbHC0mxIQa0jMAFmLM1pVVQOD4+o5CYizBGcHpHWiHwLSxdEDc+fE6Xm6fwT5/d9vxnfePLqFAUCkKwgTRKZXekgWOPO1PSDd0/2cUfwAaReTcb/HjQnrqtw70Rtp7wPQfX/TW/bwT3JEQBpOmXlsL+dXUJG2Pr98kSj8v+tLiRbNbzfqHRlXvcZfvZlXyqW0u1TjuL6JmjXH8H9JUwJSRb7IjHpwQCJNtulnE9d2K6YStyEgmyr5vT6ySY8ICH3i7WVl+i8BUeqJbyc9pz0FIMsuTlX5IVdwjhYQfIKUf/U5RrW9FxMQ6a4uQVtcA2RJA71J9mQRZJDyIBEQx3b+AcjxLw0uCQizh1MDI4fdEY3ITPKVsL0Cosh+m5p9VDC/Ln4LSLNQM9DIYTejsGwxrqR731w8LnB+7x0BuQPkZrqW6KiB0QhEQDBEshS9MxrmIL1S13UEZNdRBAR8GBGQEiDSsOHI41gzB5F5LPUm78XKn/JWfRJkEN7BnDtMV/rvVc9iOQvkdcVHRkzMQTAeyd80swFEk09m2MvRAHm+KjRbJPpaWx+Y2QHCf1xwWkO9AJJxb3l3SrKKxd9QJiBf5iDa24Bt46KpJCxRIyCbgFgOlY3MVoEkJJf0dYCIbmHJiuzQOoqaNeaOiHmPBLESkIC86pOAJEzVQ9yt93oFZNTt+j4O2U82g0SfgwBFXM+/X75+C/n8xz/ZrNXLJJFOFBJwpZEJIEhGbWqPyDEtiQc1W27/r29R2evlZ/KDmcRDEi+8zQb29yCACIGUf31Oi7fbV3lUDhldxq20HcWWNYpYjgXRPCCDl8aVMu+tzxIQ7WOgmq5EQ3g0sOVQY9oZeUCUgITOg1gDIu+dQJzK4tluWzCvBGIZVpb+VslT+2pAwoAYQ7LcbbTkL8ckmtVPbWsxbedVQ5ZoHGX9a7PNAvL161tRKkSrN8tSawVAHiVF5hbvzwkISFBESUAsfyZh+/0jAkKvVsQkSC+RQSY3/ekAsS7LQpVlaBLRwwwQKzH3unl0ANvKDnuV53SA9JCEQOkBlG9HAcnScupMIg7uJJmsFBBJn+f5ACeShDUcpxqDSLsJ+zXZoW0OiPaVm1VHiUy/p13FkiCXwXJmQCRxzwJICKzZAZFmPCu5WvQ0vXsYaZOFYQIQy1Oay+G0d5xBL/3vGYERZOQjR6jVqwGRyG1llOURr9EDjPdF2soiw9nVPRwgmtG+Z1P0/KjfN0lHzSBtv8isbwmf9K38nNnj9eZMcrZXb3r+pBbj25nf1UZ85FhHCFtA/nqXN9E+sX4mbz7Ks3fDxvM9BxHSUv7v/8hhpv06w0kL/nMOCbJrrrTeE9pq7j3XLtZG7oHe0vSK1yX9T/Eqln3YYRt+Wn/U+IeZRCMGXlYJuVD7oD5rnpSA/DTN3v9fLwLyIl6UKaKuXg+qnqYXM8j9Xmm1ymj5S97NQYTkFJu8ev1meLV2eVGlzSaiB7axvNKzNCfLXkUNyvVLQmhQ3iYfMx8UYvRVi9S9TFbMl5hN5FLLZ7AHczrllH9N8igOQv7vXf7rLu0dyrUgM0xJrDW12h+xk9XcXP7xnH3dUxYQS1Cj5JrBwNZCWuiKzDGa6/mA4NJRskqLU+FpWzQNAd1DGWRZGilCuiCX/QGZ3r1N78lUKYFD7ikg0IwICJRPpuBLsYAAVRQICGOCGxAQ4AYFCAhwgwKEAjAgIMClAgQEuEEBAgLcoAABAW5QYP6Xbe2GyPAK1FWAmQRWZqoAAdkN8OndRoG5AZFc4jY3V/MdnBAQnDv+GUUlI2QS9OYjjjxdmNoKEBCPgwdKrSzMIJBxtgYEZLfwp3ejAgRko9A83V8BAuJv4+kdBASCQwUICHCDAgQEuEEBAgLcoAABAW5QgIAANyhAQIAbFCAaQg19QgG+BlZY7C23AgQkV2eONqgAAQE6FVaAgBQWn5MLBQgIQClcgf8DL2q0BnGOuoUAAAAASUVORK5CYII=`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        transactionId: `qr-${Date.now()}`
      };
    } catch (error: any) {
      console.error('Error generating withdrawal QR code:', error);
      return {
        success: false,
        error: error.message || "Failed to generate withdrawal QR code"
      };
    } finally {
      setIsProcessingQRCode(false);
    }
  };
  
  return {
    isGenerating,
    qrCodeData,
    error,
    generateQRCode,
    isProcessingQRCode,
    generatePaymentQRCode,
    generateWithdrawalQRCode
  };
}
