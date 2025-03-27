
// Re-export from the new modules for backward compatibility
export { callSfdApi } from './api/callSfdApi';
export { corsHeaders } from './api/corsHeaders';
export { default as sfdApiClient } from './api/sfdApiClient';

// Make sure the interceptors are registered
import './api/requestInterceptor';
import './api/responseInterceptor';
