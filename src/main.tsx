import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGlobalImageOptimizer } from './lib/imageOptimizerScript';
import { initWebMcpTools } from './lib/webMcp';

// Boot auto-image optimizer & WebMCP agent tools immediately
initGlobalImageOptimizer();
initWebMcpTools();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
