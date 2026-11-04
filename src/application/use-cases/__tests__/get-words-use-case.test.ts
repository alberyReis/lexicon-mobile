import { createGetWordsUseCase } from '../get-words-use-case';
import type { IWordListRepository } from '@/infrastructure/repositories/word-list/word-list-repository';

describe('GetWordsUseCase', () => {
    const getWordsMock = jest.fn();
    const repository: IWordListRepository = {
        getWords: getWordsMock,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return words provided by the repository', async () => {
        const words = ['apple', 'banana', 'car'];
        getWordsMock.mockResolvedValue(words);
        const getWords = createGetWordsUseCase(repository);
        const result = await getWords(null, 20, '');
        expect(result).toEqual(words);
        expect(getWordsMock).toHaveBeenCalledWith(null, 20, '');
        expect(getWordsMock).toHaveBeenCalledTimes(1);
    });

    it('should forward pagination and search parameters', async () => {
        getWordsMock.mockResolvedValue(['banana', 'band']);
        const getWords = createGetWordsUseCase(repository);
        await getWords('apple', 10, 'ban');
        expect(getWordsMock).toHaveBeenCalledWith(
            'apple',
            10,
            'ban',
        );
    });

    it('should use default parameters when not provided', async () => {
        getWordsMock.mockResolvedValue([]);
        const getWords = createGetWordsUseCase(repository);
        await getWords(null);
        expect(getWordsMock).toHaveBeenCalledWith(null, 20, '');
    });

    it('should return an empty array when no words are found', async () => {
        getWordsMock.mockResolvedValue([]);
        const getWords = createGetWordsUseCase(repository);
        const result = await getWords(null, 20, 'xyz');
        expect(result).toEqual([]);
    });
});
