export type IFavoriteRepository = {
    getFavorites: () => Promise<string[]>;
    addFavorite: (word: string) => Promise<void>;
    removeFavorite: (word: string) => Promise<void>;
    isFavorite: (word: string) => Promise<boolean>;
};
