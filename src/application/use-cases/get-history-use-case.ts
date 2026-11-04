import type { IHistoryRepository } from '@/infrastructure/repositories/history/history-repository';

export const createGetHistoryUseCase = (
    repository: IHistoryRepository,
) => {
    return async (): Promise<string[]> => {
        return repository.getHistory();
    };
};
