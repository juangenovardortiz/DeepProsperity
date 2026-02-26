import { createContext, useContext, ReactNode } from 'react';
import { useCompletionEffect } from '../hooks/useCompletionEffect';

interface CompletionEffectContextType {
  registerClickOrigin: (origin: { x: number; y: number; color: string }) => void;
  fireCompletionEffect: () => void;
}

const CompletionEffectContext = createContext<CompletionEffectContextType>({
  registerClickOrigin: () => {},
  fireCompletionEffect: () => {},
});

export function CompletionEffectProvider({ children }: { children: ReactNode }) {
  const { registerClickOrigin, fireCompletionEffect } = useCompletionEffect();

  return (
    <CompletionEffectContext.Provider value={{ registerClickOrigin, fireCompletionEffect }}>
      {children}
    </CompletionEffectContext.Provider>
  );
}

export function useCompletionEffectContext() {
  return useContext(CompletionEffectContext);
}
