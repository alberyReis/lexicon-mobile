import { createAddToHistoryUseCase } from '../add-to-history-use-case';
import type { IHistoryRepository } from '@/infrastructure/repositories/history/history-repository';

describe('AddToHistoryUseCase', () => {
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

        addToHistoryMock.mockResolvedValue(undefined);
    });

    it('should add a word to history', async () => {
        const addToHistory = createAddToHistoryUseCase(repository);
        await addToHistory('apple');
        expect(addToHistoryMock).toHaveBeenCalledWith('apple');
        expect(addToHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should forward the provided word to the repository', async () => {
        const addToHistory = createAddToHistoryUseCase(repository);
        await addToHistory('banana');
        expect(addToHistoryMock).toHaveBeenCalledWith('banana');
        expect(addToHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
        addToHistoryMock.mockRejectedValue(
            new Error('Firestore error'),
        );
        const addToHistory = createAddToHistoryUseCase(repository);
        await expect(
            addToHistory('apple'),
        ).rejects.toThrow('Firestore error');
        expect(addToHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should not call unrelated repository methods', async () => {
        const addToHistory = createAddToHistoryUseCase(repository);
        await addToHistory('apple');
        expect(getHistoryMock).not.toHaveBeenCalled();
        expect(clearHistoryMock).not.toHaveBeenCalled();
    });

    it('should allow adding the same word multiple times', async () => {
        const addToHistory = createAddToHistoryUseCase(repository);
        await addToHistory('apple');
        await addToHistory('apple');
        expect(addToHistoryMock).toHaveBeenCalledTimes(2);
        expect(addToHistoryMock).toHaveBeenNthCalledWith(
            1,
            'apple',
        );
        expect(addToHistoryMock).toHaveBeenNthCalledWith(
            2,
            'apple',
        );
    });

    it('should wait for the repository operation to complete', async () => {
        let resolveOperation!: () => void;
        addToHistoryMock.mockImplementation(
            () =>
                new Promise<void>(resolve => {
                    resolveOperation = resolve;
                }),
        );
        const addToHistory = createAddToHistoryUseCase(repository);
        let completed = false;
        const operation = addToHistory('apple').then(() => {
            completed = true;
        });
        await Promise.resolve();
        expect(completed).toBe(false);
        expect(addToHistoryMock).toHaveBeenCalledTimes(1);
        resolveOperation();
        await operation;
        expect(completed).toBe(true);
    });
});
