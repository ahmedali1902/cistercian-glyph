import { createContext, useContext } from 'react';

export type ErrorToast = {
  id: number;
  message: string;
};

export type ErrorToastContextValue = {
  pushError: (message: string) => void;
};

export const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);

export const useErrorToast = () => {
  const context = useContext(ErrorToastContext);
  if (!context) {
    throw new Error('useErrorToast must be used within ErrorToastProvider');
  }

  return context;
};
