import type { IHistoryRepository } from '@/infrastructure/repositories/history/history-repository';

export const createAddToHistoryUseCase = (
    repository: IHistoryRepository,
) => {
    return async (word: string): Promise<void> => {
        await repository.addToHistory(word);
    };
};
