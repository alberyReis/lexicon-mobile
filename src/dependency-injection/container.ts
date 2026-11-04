import { createGetWordDetailsUseCase } from '@/application/use-cases/get-word-details-use-case';
import { createGetWordsUseCase } from '@/application/use-cases/get-words-use-case';
import { createGetFavoritesUseCase } from '@/application/use-cases/get-favorites-use-case';
import { createToggleFavoriteUseCase } from '@/application/use-cases/toggle-favorite-use-case';
import { createGetHistoryUseCase } from '@/application/use-cases/get-history-use-case';
import { createAddToHistoryUseCase } from '@/application/use-cases/add-to-history-use-case';

import { wordRepository } from '@/infrastructure/repositories/word/word-repository-implementation';
import { wordListRepository } from '@/infrastructure/repositories/word-list/word-list-repository-implementation';
import { favoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository-implementation';
import { historyRepository } from '@/infrastructure/repositories/history/history-repository-implementation';

export const container = {
    getWordDetails: createGetWordDetailsUseCase(wordRepository),
    getWords: createGetWordsUseCase(wordListRepository),
    getFavorites: createGetFavoritesUseCase(favoriteRepository),
    toggleFavorite: createToggleFavoriteUseCase(favoriteRepository),
    getHistory: createGetHistoryUseCase(historyRepository),
    addToHistory: createAddToHistoryUseCase(historyRepository),
};
