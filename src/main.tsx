import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './stores/store-context';
import './styles/global.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);