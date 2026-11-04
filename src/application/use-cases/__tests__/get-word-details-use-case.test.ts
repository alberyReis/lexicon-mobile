import { createGetWordDetailsUseCase } from '../get-word-details-use-case';
import type { IWordRepository } from '@/infrastructure/repositories/word/word-repository';

describe('GetWordDetailsUseCase', () => {
    const getWordMock = jest.fn();

    const repository: IWordRepository = {
        getWord: getWordMock,
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return word details from the repository', async () => {
        const wordDetails = [
            {
                word: 'apple',
                phonetic: '/ˈæp.əl/',
                meanings: [
                    {
                        partOfSpeech: 'noun',
                        definitions: [
                            {
                                definition: 'A round fruit.',
                            },
                        ],
                    },
                ],
            },
        ];
        getWordMock.mockResolvedValue(wordDetails);
        const getWordDetails = createGetWordDetailsUseCase(repository);
        const result = await getWordDetails.execute('apple');
        expect(result).toEqual(wordDetails);
        expect(getWordMock).toHaveBeenCalledWith('apple');
        expect(getWordMock).toHaveBeenCalledTimes(1);
    });

    it('should forward the requested word to the repository', async () => {
        getWordMock.mockResolvedValue([]);
        const getWordDetails = createGetWordDetailsUseCase(repository);
        await getWordDetails.execute('banana');
        expect(getWordMock).toHaveBeenCalledWith('banana');
    });

    it('should propagate repository errors', async () => {
        getWordMock.mockRejectedValue(
            new Error('Network error'),
        );
        const getWordDetails = createGetWordDetailsUseCase(repository);
        await expect(
            getWordDetails.execute('apple'),
        ).rejects.toThrow('Network error');
    });
});
