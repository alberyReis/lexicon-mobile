import { createGetHistoryUseCase } from '../get-history-use-case';
import type { IHistoryRepository } from '@/infrastructure/repositories/history/history-repository';

describe('GetHistoryUseCase', () => {
    const getHistoryMock = jest.fn();
    const addToHistoryMock = jest.fn();
    const clearHistoryMock = jest.fn();

    const repository: IHistoryRepository = {
        getHistory: getHistoryMock,
        addToHistory: addToHistoryMock,
        clearHistory: clearHistoryMock,
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
        expect(getHistoryMock).toHaveBeenCalledWith();
    });

    it('should return an empty array when history is empty', async () => {
        getHistoryMock.mockResolvedValue([]);
        const getHistory = createGetHistoryUseCase(repository);
        const result = await getHistory();
        expect(result).toEqual([]);
        expect(getHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
        getHistoryMock.mockRejectedValue(
            new Error('Database error'),
        );
        const getHistory = createGetHistoryUseCase(repository);
        await expect(getHistory()).rejects.toThrow(
            'Database error',
        );
        expect(getHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should not modify history when fetching words', async () => {
        getHistoryMock.mockResolvedValue(['apple']);
        const getHistory = createGetHistoryUseCase(repository);
        await getHistory();
        expect(addToHistoryMock).not.toHaveBeenCalled();
        expect(clearHistoryMock).not.toHaveBeenCalled();
    });

    it('should fetch history on every execution', async () => {
        getHistoryMock
            .mockResolvedValueOnce(['apple'])
            .mockResolvedValueOnce(['apple', 'banana']);
        const getHistory = createGetHistoryUseCase(repository);
        const firstResult = await getHistory();
        const secondResult = await getHistory();
        expect(firstResult).toEqual(['apple']);
        expect(secondResult).toEqual(['apple', 'banana']);
        expect(getHistoryMock).toHaveBeenCalledTimes(2);
    });
});
