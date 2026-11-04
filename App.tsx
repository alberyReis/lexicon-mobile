import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppNavigation } from '@/presentation/navigation/app-navigation';
import { initializeDatabase } from '@/infrastructure/database/initialize-database';
import { queryClient } from '@/shared/config/query-client';

export const App = () => {
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log('[SQLite] Banco inicializado com sucesso.');
      })
      .catch((error: unknown) => {
        console.error('[SQLite] Erro ao inicializar o banco:', error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigation />
    </QueryClientProvider>
  );
};
