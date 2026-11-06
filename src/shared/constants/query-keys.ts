export const QUERY_KEYS = {
    words: (search: string) => ['words', search] as const,

    favorites: (uid: string) => ['favorites', uid] as const,

    history: (uid: string) => ['history', uid] as const,
};