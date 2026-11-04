export type IHistoryRepository = {
    getHistory: () => Promise<string[]>;
    addToHistory: (word: string) => Promise<void>;
    clearHistory: () => Promise<void>;
};
