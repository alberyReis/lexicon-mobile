import { dictionaryApiClient } from '@/infrastructure/api/clients/dictionary-api-client';
import { dictionaryApiService } from '../dictionary-api-service';

jest.mock('@/infrastructure/api/clients/dictionary-api-client', () => ({
    dictionaryApiClient: {
        get: jest.fn(),
    },
}));

const getMock = jest.mocked(dictionaryApiClient.get);

describe('DictionaryApiService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should request the correct word endpoint', async () => {
        getMock.mockResolvedValue({
            data: [],
        });
        await dictionaryApiService.getWord('apple');
        expect(getMock).toHaveBeenCalledWith('/apple');
        expect(getMock).toHaveBeenCalledTimes(1);
    });

    it('should encode special characters in the word', async () => {
        getMock.mockResolvedValue({
            data: [],
        });
        await dictionaryApiService.getWord('hello world');
        expect(getMock).toHaveBeenCalledWith('/hello%20world');
    });

    it('should return the response data', async () => {
        const wordData = [
            {
                word: 'apple',
                phonetic: '/ˈæp.əl/',
                phonetics: [],
                meanings: [],
            },
        ];
        getMock.mockResolvedValue({
            data: wordData,
        });
        const result = await dictionaryApiService.getWord('apple');
        expect(result).toEqual(wordData);
    });

    it('should propagate a 404 error when the word is not found', async () => {
        const error = {
            response: {
                status: 404,
            },
        };
        getMock.mockRejectedValue(error);
        await expect(
            dictionaryApiService.getWord('unknownword'),
        ).rejects.toEqual(error);
    });

    it('should propagate network errors', async () => {
        getMock.mockRejectedValue(
            new Error('Network Error'),
        );
        await expect(
            dictionaryApiService.getWord('apple'),
        ).rejects.toThrow('Network Error');
    });

    it('should propagate server errors', async () => {
        const error = {
            response: {
                status: 500,
            },
        };
        getMock.mockRejectedValue(error);
        await expect(
            dictionaryApiService.getWord('apple'),
        ).rejects.toEqual(error);
    });
});
