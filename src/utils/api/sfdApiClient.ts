
import axios from 'axios';

// Create an axios instance for SFD-specific API calls
const sfdApiClient = axios.create({
  baseURL: '/api/sfd',
  timeout: 10000
});

// Add a request interceptor to include the SFD ID in the URL
sfdApiClient.interceptors.request.use(
  config => {
    // Get SFD ID from headers
    const sfdId = config.headers?.['X-SFD-ID'];
    
    if (sfdId) {
      // Ensure the URL includes the SFD ID by constructing it properly
      // If the URL doesn't already start with the SFD ID, add it
      if (!config.url?.startsWith(`/${sfdId}`)) {
        config.url = `/${sfdId}${config.url?.startsWith('/') ? config.url : `/${config.url}`}`;
      }
      
      console.log('Making request to SFD-specific endpoint:', config.url);
    } else {
      console.warn('No SFD ID provided for SFD API call');
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a transaction handling method to ensure atomic operations
sfdApiClient.transaction = async (operations) => {
  try {
    // Begin a transaction (simulated with a specific endpoint)
    const transactionResponse = await sfdApiClient.post('/transaction/begin');
    const transactionId = transactionResponse.data.transactionId;
    
    console.log('Started transaction:', transactionId);
    
    // Execute all operations with the transaction ID
    const results = [];
    try {
      for (const operation of operations) {
        const { method, url, data } = operation;
        const headers = {
          'X-Transaction-ID': transactionId,
          ...(operation.headers || {})
        };
        
        // Execute the operation within the transaction context
        const response = await sfdApiClient.request({
          method,
          url,
          data,
          headers
        });
        
        results.push(response.data);
      }
      
      // Commit the transaction
      await sfdApiClient.post('/transaction/commit', { transactionId });
      console.log('Committed transaction:', transactionId);
      
      return {
        success: true,
        results
      };
    } catch (error) {
      // Rollback on any error
      await sfdApiClient.post('/transaction/rollback', { transactionId });
      console.error('Rolled back transaction due to error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
};

export default sfdApiClient;
