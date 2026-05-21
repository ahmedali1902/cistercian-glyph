import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorToastProvider } from './components/ErrorToasts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorToastProvider>
      <App />
    </ErrorToastProvider>
  </StrictMode>,
);
