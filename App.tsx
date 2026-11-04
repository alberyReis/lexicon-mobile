import { QueryClientProvider } from '@tanstack/react-query';
import { AppNavigation } from '@/presentation/navigation/app-navigation';
import { queryClient } from '@/shared/config/query-client';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigation />
    </QueryClientProvider>
  );
};