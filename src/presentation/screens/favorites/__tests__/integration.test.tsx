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
import { useNavigation } from '@react-navigation/native';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    serverTimestamp,
    setDoc,
} from '@react-native-firebase/firestore';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { useFavoritesBuilder } from '../builder';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({}));

jest.mock('@react-native-firebase/firestore', () => ({
    collection: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    getFirestore: jest.fn(),
    serverTimestamp: jest.fn(),
    setDoc: jest.fn(),
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        getCurrentUser: jest.fn(),
    },
}));

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(() => ({
        executeAsync: jest.fn(),
        executeSync: jest.fn(),
        close: jest.fn(),
    })),
}));

const useNavigationMock = jest.mocked(useNavigation);

const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);

const collectionMock = jest.mocked(collection);
const deleteDocMock = jest.mocked(deleteDoc);
const docMock = jest.mocked(doc);
const getDocMock = jest.mocked(getDoc);
const getDocsMock = jest.mocked(getDocs);
const getFirestoreMock = jest.mocked(getFirestore);
const serverTimestampMock = jest.mocked(serverTimestamp);
const setDocMock = jest.mocked(setDoc);

describe('Favorites Integration', () => {
    const userId = 'user-123';

    const favorites = new Set<string>();

    const firestoreInstance = {
        id: 'firestore-instance',
    };

    const historyCollection = {
        id: 'favorites-collection',
    };

    const timestamp = {
        seconds: 1700000000,
        nanoseconds: 0,
    };

    let queryClient: QueryClient;

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

    beforeEach(() => {
        jest.resetAllMocks();
        favorites.clear();

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: Infinity,
                },
                mutations: {
                    retry: false,
                },
            },
        });

        useNavigationMock.mockReturnValue({
            navigate: jest.fn(),
        } as never);

        getCurrentUserMock.mockReturnValue({
            uid: userId,
            email: 'test@example.com',
        });

        getFirestoreMock.mockReturnValue(
            firestoreInstance as never,
        );

        collectionMock.mockReturnValue(
            historyCollection as never,
        );

        serverTimestampMock.mockReturnValue(
            timestamp as never,
        );

        docMock.mockImplementation((_reference, word) => {
            return {
                id: word,
            } as never;
        });

        getDocMock.mockImplementation(async reference => {
            const { id } = reference as unknown as {
                id: string;
            };

            return {
                exists: () => favorites.has(id),
            } as never;
        });

        getDocsMock.mockImplementation(async () => {
            return {
                docs: [...favorites].map(word => ({
                    data: () => ({
                        word,
                    }),
                })),
            } as never;
        });

        setDocMock.mockImplementation(async reference => {
            const { id } = reference as unknown as {
                id: string;
            };

            favorites.add(id);
        });

        deleteDocMock.mockImplementation(async reference => {
            const { id } = reference as unknown as {
                id: string;
            };

            favorites.delete(id);
        });
    });

    afterEach(async () => {
        await cleanup();
        await queryClient.cancelQueries();
        queryClient.clear();
    });

    it('should load favorites from the repository', async () => {
        favorites.add('apple');
        favorites.add('banana');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
                'banana',
            ]);
        });
        expect(collectionMock).toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            userId,
            'favorites',
        );
        expect(getDocsMock).toHaveBeenCalledWith(
            historyCollection,
        );
    });

    it('should add a favorite and update the query cache', async () => {
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.isPending).toBe(false);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        expect(favorites.has('apple')).toBe(true);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
        expect(setDocMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'apple',
            }),
            {
                word: 'apple',
                createdAt: timestamp,
            },
        );
    });

    it('should remove a favorite and update the query cache', async () => {
        favorites.add('apple');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([]);
        });
        expect(favorites.has('apple')).toBe(false);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual([]);
        expect(deleteDocMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'apple',
            }),
        );
    });

    it('should preserve other favorites when toggling a word', async () => {
        favorites.add('apple');
        favorites.add('banana');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
                'banana',
            ]);
        });
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'banana',
            ]);
        });
        expect(favorites.has('banana')).toBe(true);
        expect(favorites.has('apple')).toBe(false);
    });

    it('should not update favorites when the mutation fails', async () => {
        favorites.add('apple');
        const { result } = await renderHook(
            () => useFavoritesBuilder(),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => {
            expect(result.current.favorites).toEqual([
                'apple',
            ]);
        });
        deleteDocMock.mockRejectedValueOnce(
            new Error('Firestore error'),
        );
        await act(async () => {
            result.current.toggleFavorite('apple');
        });
        await waitFor(() => {
            expect(result.current.isUpdating).toBe(false);
        });
        expect(result.current.favorites).toEqual([
            'apple',
        ]);
        expect(favorites.has('apple')).toBe(true);
        expect(
            queryClient.getQueryData(
                QUERY_KEYS.favorites(userId),
            ),
        ).toEqual(['apple']);
    });
});
