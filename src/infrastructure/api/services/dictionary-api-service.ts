import { dictionaryApiClient } from '@/infrastructure/api/clients/dictionary-api-client';
import type { IWordApiResponse } from '@/types/word-details/word-api-type';

export const dictionaryApiService = {
    getWord: async (word: string): Promise<IWordApiResponse[]> => {
        const response = await dictionaryApiClient.get<IWordApiResponse[]>(
            `/${encodeURIComponent(word)}`,
        );
        return response.data;
    },
};
