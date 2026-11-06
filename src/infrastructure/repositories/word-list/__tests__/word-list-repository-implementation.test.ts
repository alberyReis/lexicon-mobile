import { database } from '@/infrastructure/database/database';
import { wordListRepository } from '../word-list-repository-implementation';

jest.mock('@/infrastructure/database/database', () => ({
    database: {
        executeAsync: jest.fn(),
        executeSync: jest.fn(),
    },
}));

const executeAsyncMock = jest.mocked(database.executeAsync);

describe('WordListRepository', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return words from the database', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [
                    { word: 'apple' },
                    { word: 'banana' },
                    { word: 'car' },
                ],
            },
        } as never);
        const result = await wordListRepository.getWords(null, 20, '');
        expect(result).toEqual(['apple', 'banana', 'car']);
        expect(executeAsyncMock).toHaveBeenCalledTimes(1);
    });

    it('should forward pagination parameters to the database', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [{ word: 'banana' }],
            },
        } as never);
        await wordListRepository.getWords('apple', 10, '');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.any(String),
            ['apple', '%', 10],
        );
    });

    it('should filter words using the search parameter', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [{ word: 'banana' }],
            },
        } as never);
        await wordListRepository.getWords(null, 20, 'ban');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.any(String),
            ['', 'ban%', 20],
        );
    });

    it('should escape special SQL LIKE characters', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [],
            },
        } as never);
        await wordListRepository.getWords(null, 20, 'a_b%');
        expect(executeAsyncMock).toHaveBeenCalledWith(
            expect.any(String),
            ['', 'a\\_b\\%%', 20],
        );
    });

    it('should return an empty array when no words are found', async () => {
        executeAsyncMock.mockResolvedValue({
            rows: {
                _array: [],
            },
        } as never);
        const result = await wordListRepository.getWords(null, 20, 'xyz');
        expect(result).toEqual([]);
    });

    it('should propagate database errors', async () => {
        executeAsyncMock.mockRejectedValue(
            new Error('Database error'),
        );
        await expect(
            wordListRepository.getWords(null, 20, ''),
        ).rejects.toThrow('Database error');
    });
});
