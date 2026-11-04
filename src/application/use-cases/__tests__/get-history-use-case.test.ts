import { createGetHistoryUseCase } from '../get-history-use-case';
import type { IHistoryRepository } from '@/infrastructure/repositories/history/history-repository';

describe('GetHistoryUseCase', () => {
    const getHistoryMock = jest.fn();

    const repository: IHistoryRepository = {
        getHistory: getHistoryMock,
        addToHistory: jest.fn(),
        clearHistory: jest.fn(),
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return words from history', async () => {
        const words = ['apple', 'banana', 'car'];
        getHistoryMock.mockResolvedValue(words);
        const getHistory = createGetHistoryUseCase(repository);
        const result = await getHistory();
        expect(result).toEqual(words);
        expect(getHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when history is empty', async () => {
        getHistoryMock.mockResolvedValue([]);
        const getHistory = createGetHistoryUseCase(repository);
        const result = await getHistory();
        expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
        getHistoryMock.mockRejectedValue(
            new Error('Database error'),
        );
        const getHistory = createGetHistoryUseCase(repository);
        await expect(getHistory()).rejects.toThrow(
            'Database error',
        );
    });
});
