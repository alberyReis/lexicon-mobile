import { createAddToHistoryUseCase } from '../add-to-history-use-case';
import type { IHistoryRepository } from '@/infrastructure/repositories/history/history-repository';

describe('AddToHistoryUseCase', () => {
    const addToHistoryMock = jest.fn();

    const repository: IHistoryRepository = {
        getHistory: jest.fn(),
        addToHistory: addToHistoryMock,
        clearHistory: jest.fn(),
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should add a word to history', async () => {
        addToHistoryMock.mockResolvedValue(undefined);
        const addToHistory = createAddToHistoryUseCase(repository);
        await addToHistory('apple');
        expect(addToHistoryMock).toHaveBeenCalledWith('apple');
        expect(addToHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should forward the provided word to the repository', async () => {
        addToHistoryMock.mockResolvedValue(undefined);
        const addToHistory = createAddToHistoryUseCase(repository);
        await addToHistory('banana');
        expect(addToHistoryMock).toHaveBeenCalledWith('banana');
    });

    it('should propagate repository errors', async () => {
        addToHistoryMock.mockRejectedValue(
            new Error('Database error'),
        );
        const addToHistory = createAddToHistoryUseCase(repository);
        await expect(addToHistory('apple')).rejects.toThrow(
            'Database error',
        );
    });
});
