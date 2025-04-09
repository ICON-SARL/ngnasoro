
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize the app (BrowserRouter is now in AppRoutes)
createRoot(document.getElementById("root")!).render(
  <App />
);
