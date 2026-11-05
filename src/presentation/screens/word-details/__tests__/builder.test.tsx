import type { ReactNode } from 'react';
import {
    act,
    cleanup,
    renderHook,
    waitFor,
} from '@testing-library/react-native';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import {
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import { container } from '@/dependency-injection/container';
import { useWordDetailsBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock('@/dependency-injection/container', () => ({
    container: {
        getWordDetails: {
            execute: jest.fn(),
        },
        addToHistory: jest.fn(),
    },
}));

const getWordDetailsMock = jest.mocked(
    container.getWordDetails.execute,
);

const addToHistoryMock = jest.mocked(container.addToHistory);
const useNavigationMock = jest.mocked(useNavigation);
const useRouteMock = jest.mocked(useRoute);

describe('useWordDetailsBuilder', () => {
    let queryClient: QueryClient;
    let goBackMock: jest.Mock;

    const wordDetails = [
        {
            word: 'apple',
            phonetic: '/ˈæp.əl/',
            phonetics: [],
            meanings: [
                {
                    partOfSpeech: 'noun',
                    definitions: [
                        {
                            definition: 'A round fruit.',
                            synonyms: [],
                            antonyms: [],
                        },
                    ],
                    synonyms: [],
                    antonyms: [],
                },
            ],
        },
    ];

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

    const renderWordDetailsBuilder = async () => {
        const hook = await renderHook(
            () => useWordDetailsBuilder(),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(hook.result.current).not.toBeNull();
        });

        await waitFor(() => {
            expect(
                queryClient.getQueryState([
                    'word-details',
                    'apple',
                ])?.fetchStatus,
            ).toBe('idle');
        });

        await waitFor(() => {
            expect(addToHistoryMock).toHaveBeenCalledWith(
                'apple',
            );
        });

        return hook;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
                mutations: {
                    retry: false,
                },
            },
        });

        goBackMock = jest.fn();

        useNavigationMock.mockReturnValue({
            goBack: goBackMock,
        } as never);

        useRouteMock.mockReturnValue({
            params: {
                word: 'apple',
            },
        } as never);

        getWordDetailsMock.mockResolvedValue(wordDetails);
        addToHistoryMock.mockResolvedValue(undefined);
    });

    afterEach(async () => {
        await cleanup();
        queryClient.clear();
        jest.restoreAllMocks();
    });

    it('should receive the word from route params', async () => {
        const { result } = await renderWordDetailsBuilder();
        expect(result.current.word).toBe('apple');
    });

    it('should fetch word details', async () => {
        const { result } = await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(result.current.wordDetails).toEqual(
                wordDetails[0],
            );
        });
        expect(getWordDetailsMock).toHaveBeenCalledWith(
            'apple',
        );
    });

    it('should expose the word phonetic and meanings', async () => {
        const { result } = await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(result.current.wordDetails).toBeDefined();
        });
        expect(result.current.wordDetails?.phonetic).toBe(
            '/ˈæp.əl/',
        );
        expect(result.current.wordDetails?.meanings).toEqual(
            wordDetails[0].meanings,
        );
    });

    it('should register the viewed word in history', async () => {
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(addToHistoryMock).toHaveBeenCalledWith(
                'apple',
            );
        });
        expect(addToHistoryMock).toHaveBeenCalledTimes(1);
    });

    it('should invalidate history after registering a word', async () => {
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ['history'],
            });
        });
    });

    it('should expose an error when fetching word details fails', async () => {
        getWordDetailsMock.mockRejectedValue(
            new Error('API error'),
        );
        const { result } = await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
        expect(result.current.wordDetails).toBeUndefined();
    });

    it('should allow refetching word details', async () => {
        const { result } = await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(result.current.wordDetails).toEqual(
                wordDetails[0],
            );
        });
        await act(async () => {
            await result.current.refetch();
        });
        await waitFor(() => {
            expect(getWordDetailsMock).toHaveBeenCalledTimes(2);
        });
        expect(result.current.wordDetails).toEqual(
            wordDetails[0],
        );
    });

    it('should navigate back', async () => {
        const { result } = await renderWordDetailsBuilder();
        await act(async () => {
            result.current.handleGoBack();
        });
        expect(goBackMock).toHaveBeenCalledTimes(1);
    });

    it('should handle history registration errors', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => { });
        addToHistoryMock.mockRejectedValue(
            new Error('Database error'),
        );
        await renderWordDetailsBuilder();
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[History] Failed to register word:',
                expect.any(Error),
            );
        });
        expect(
            queryClient.getQueryState([
                'word-details',
                'apple',
            ])?.fetchStatus,
        ).toBe('idle');
    });
});
