
import { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

export const handleError = (error: unknown, customMessage?: string) => {
  const message = customMessage || 'An error occurred';
  
  console.error('Error:', error);
  
  if (error instanceof AxiosError) {
    const serverMessage = error.response?.data?.message || error.message;
    toast({
      title: 'Error',
      description: serverMessage,
      variant: 'destructive',
    });
    return serverMessage;
  } 
  
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
  
  return message;
};

export const handleApiResponse = (response: any, successMessage: string) => {
  if (response.error) {
    toast({
      title: 'Error',
      description: response.error.message || 'An error occurred',
      variant: 'destructive',
    });
    return false;
  }
  
  toast({
    title: 'Success',
    description: successMessage,
  });
  
  return true;
};
