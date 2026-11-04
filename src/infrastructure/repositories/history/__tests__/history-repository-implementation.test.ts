import { database } from '@/infrastructure/database/database';
import { historyRepository } from '../history-repository-implementation';

jest.mock('@/infrastructure/database/database', () => ({
    database: {
        executeAsync: jest.fn(),
    },
}));

const executeAsyncMock = jest.mocked(database.executeAsync);

describe('HistoryRepository', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return words ordered by most recent view', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [
                    { word: 'banana' },
                    { word: 'apple' },
                ],
            },
        } as never);
        const result = await historyRepository.getHistory();
        expect(result).toEqual(['banana', 'apple']);
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.stringMatching(
                /SELECT\s+word\s+FROM\s+history\s+ORDER BY viewed_at DESC/,
            ),
        );
    });

    it('should return an empty array when history is empty', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [],
            },
        } as never);
        const result = await historyRepository.getHistory();
        expect(result).toEqual([]);
    });

    it('should add a word to history with a timestamp', async () => {
        jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
        executeAsyncMock.mockResolvedValue({} as never);
        await historyRepository.addToHistory('apple');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO history'),
            ['apple', 1700000000000],
        );
        jest.restoreAllMocks();
    });

    it('should update the timestamp when a word already exists', async () => {
        executeAsyncMock.mockResolvedValue({} as never);
        await historyRepository.addToHistory('apple');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.stringMatching(
                /ON CONFLICT\(word\)\s+DO UPDATE SET viewed_at = excluded\.viewed_at/,
            ),
            ['apple', expect.any(Number)],
        );
    });

    it('should clear all history records', async () => {
        executeAsyncMock.mockResolvedValue({} as never);
        await historyRepository.clearHistory();
        expect(executeAsyncMock).toHaveBeenCalledWith(
            'DELETE FROM history',
        );
    });

    it('should propagate database errors', async () => {
        executeAsyncMock.mockRejectedValue(
            new Error('Database error'),
        );
        await expect(
            historyRepository.getHistory(),
        ).rejects.toThrow('Database error');
    });
});
