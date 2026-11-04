import { dictionaryApiService } from '@/infrastructure/api/services/dictionary-api-service';
import { wordRepository } from '../word-repository-implementation';

jest.mock('@/infrastructure/api/services/dictionary-api-service', () => ({
    dictionaryApiService: {
        getWord: jest.fn(),
    },
}));

const getWordMock = jest.mocked(dictionaryApiService.getWord);

describe('WordRepository', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch word details from the dictionary service', async () => {
        getWordMock.mockResolvedValue([]);
        await wordRepository.getWord('apple');
        expect(getWordMock).toHaveBeenCalledWith('apple');
        expect(getWordMock).toHaveBeenCalledTimes(1);
    });

    it('should map the API response to the domain model', async () => {
        const apiResponse = [
            {
                word: 'apple',
                phonetic: '/ˈæp.əl/',
                phonetics: [
                    {
                        text: '/ˈæp.əl/',
                        audio: 'https://example.com/apple.mp3',
                    },
                ],
                meanings: [
                    {
                        partOfSpeech: 'noun',
                        definitions: [
                            {
                                definition: 'A round fruit.',
                                example: 'I ate an apple.',
                                synonyms: ['fruit'],
                                antonyms: [],
                            },
                        ],
                    },
                ],
            },
        ];
        getWordMock.mockResolvedValue(apiResponse);
        const result = await wordRepository.getWord('apple');
        expect(result).toEqual([
            {
                word: 'apple',
                phonetic: '/ˈæp.əl/',
                phonetics: [
                    {
                        text: '/ˈæp.əl/',
                        audio: 'https://example.com/apple.mp3',
                    },
                ],
                meanings: [
                    {
                        partOfSpeech: 'noun',
                        definitions: [
                            {
                                definition: 'A round fruit.',
                                example: 'I ate an apple.',
                                synonyms: ['fruit'],
                                antonyms: [],
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('should return an empty array when the API returns no results', async () => {
        getWordMock.mockResolvedValue([]);
        const result = await wordRepository.getWord('unknown');
        expect(result).toEqual([]);
    });

    it('should propagate errors from the dictionary service', async () => {
        getWordMock.mockRejectedValue(
            new Error('Network error'),
        );
        await expect(
            wordRepository.getWord('apple'),
        ).rejects.toThrow('Network error');
    });
});
