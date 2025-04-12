
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

export default sfdApiClient;
