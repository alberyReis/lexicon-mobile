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
import { favoriteRepository } from '@/infrastructure/repositories/favorite/favorite-repository-implementation';
import { createToggleFavoriteUseCase } from '../toggle-favorite-use-case';

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

const collectionMock = jest.mocked(collection);
const deleteDocMock = jest.mocked(deleteDoc);
const docMock = jest.mocked(doc);
const getDocMock = jest.mocked(getDoc);
const getDocsMock = jest.mocked(getDocs);
const getFirestoreMock = jest.mocked(getFirestore);
const serverTimestampMock = jest.mocked(serverTimestamp);
const setDocMock = jest.mocked(setDoc);

const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);

describe('ToggleFavorite Integration', () => {
    const favorites = new Map<string, Set<string>>();

    const firestoreInstance = {
        id: 'firestore-instance',
    };

    const timestamp = {
        seconds: 1700000000,
        nanoseconds: 0,
    };

    const toggleFavorite = createToggleFavoriteUseCase(
        favoriteRepository,
    );

    const getUserFavorites = (uid: string): Set<string> => {
        let userFavorites = favorites.get(uid);

        if (!userFavorites) {
            userFavorites = new Set<string>();
            favorites.set(uid, userFavorites);
        }

        return userFavorites;
    };

    beforeEach(() => {
        jest.resetAllMocks();
        favorites.clear();

        getCurrentUserMock.mockReturnValue({
            uid: 'user-123',
            email: 'test@example.com',
        });

        getFirestoreMock.mockReturnValue(
            firestoreInstance as never,
        );

        serverTimestampMock.mockReturnValue(
            timestamp as never,
        );

        collectionMock.mockImplementation(
            (_firestore, ...segments) => {
                const uid = segments[1];

                return {
                    uid,
                } as never;
            },
        );

        docMock.mockImplementation(
            (reference, word) => {
                const { uid } = reference as unknown as {
                    uid: string;
                };

                return {
                    uid,
                    word,
                } as never;
            },
        );

        getDocMock.mockImplementation(async reference => {
            const { uid, word } = reference as unknown as {
                uid: string;
                word: string;
            };

            return {
                exists: () => getUserFavorites(uid).has(word),
            } as never;
        });

        getDocsMock.mockImplementation(async reference => {
            const { uid } = reference as unknown as {
                uid: string;
            };

            return {
                docs: [...getUserFavorites(uid)].map(word => ({
                    data: () => ({ word }),
                })),
            } as never;
        });

        setDocMock.mockImplementation(async reference => {
            const { uid, word } = reference as unknown as {
                uid: string;
                word: string;
            };

            getUserFavorites(uid).add(word);
        });

        deleteDocMock.mockImplementation(async reference => {
            const { uid, word } = reference as unknown as {
                uid: string;
                word: string;
            };

            getUserFavorites(uid).delete(word);
        });
    });

    it('should add a word to favorites', async () => {
        const result = await toggleFavorite('apple');
        expect(result).toBe(true);
        expect(getUserFavorites('user-123').has('apple')).toBe(true);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['apple']);
    });

    it('should remove an existing favorite', async () => {
        getUserFavorites('user-123').add('apple');
        const result = await toggleFavorite('apple');
        expect(result).toBe(false);
        expect(getUserFavorites('user-123').has('apple')).toBe(false);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual([]);
    });

    it('should add and remove the same word', async () => {
        const firstResult = await toggleFavorite('banana');
        expect(firstResult).toBe(true);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['banana']);
        const secondResult = await toggleFavorite('banana');
        expect(secondResult).toBe(false);
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual([]);
    });

    it('should preserve other favorites when removing a word', async () => {
        getUserFavorites('user-123').add('apple');
        getUserFavorites('user-123').add('banana');
        await toggleFavorite('apple');
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['banana']);
    });

    it('should return all favorite words', async () => {
        await toggleFavorite('orange');
        await toggleFavorite('apple');
        await toggleFavorite('banana');
        const result = await favoriteRepository.getFavorites();
        expect(result).toHaveLength(3);
        expect(result).toEqual(
            expect.arrayContaining([
                'apple',
                'banana',
                'orange',
            ]),
        );
    });

    it('should persist a favorite using setDoc', async () => {
        await toggleFavorite('apple');
        expect(setDocMock).toHaveBeenCalledWith(
            expect.objectContaining({
                uid: 'user-123',
                word: 'apple',
            }),
            {
                word: 'apple',
                createdAt: timestamp,
            },
        );
        expect(serverTimestampMock).toHaveBeenCalledTimes(1);
    });

    it('should remove a favorite using deleteDoc', async () => {
        getUserFavorites('user-123').add('apple');
        await toggleFavorite('apple');
        expect(deleteDocMock).toHaveBeenCalledWith(
            expect.objectContaining({
                uid: 'user-123',
                word: 'apple',
            }),
        );
        expect(setDocMock).not.toHaveBeenCalled();
    });

    it('should isolate favorites by authenticated user', async () => {
        await toggleFavorite('apple');
        getCurrentUserMock.mockReturnValue({
            uid: 'user-456',
            email: 'another@example.com',
        });
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual([]);
        await toggleFavorite('banana');
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['banana']);
        getCurrentUserMock.mockReturnValue({
            uid: 'user-123',
            email: 'test@example.com',
        });
        expect(
            await favoriteRepository.getFavorites(),
        ).toEqual(['apple']);
    });

    it('should reject toggling when user is not authenticated', async () => {
        getCurrentUserMock.mockReturnValue(null);
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Usuário não autenticado.');
        expect(getDocMock).not.toHaveBeenCalled();
        expect(setDocMock).not.toHaveBeenCalled();
        expect(deleteDocMock).not.toHaveBeenCalled();
    });

    it('should propagate errors when checking favorite status', async () => {
        getDocMock.mockRejectedValueOnce(
            new Error('Firestore read error'),
        );
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Firestore read error');
        expect(setDocMock).not.toHaveBeenCalled();
        expect(deleteDocMock).not.toHaveBeenCalled();
    });

    it('should propagate errors when adding a favorite', async () => {
        setDocMock.mockRejectedValueOnce(
            new Error('Firestore write error'),
        );
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Firestore write error');
        expect(getUserFavorites('user-123').has('apple')).toBe(false);
    });

    it('should propagate errors when removing a favorite', async () => {
        getUserFavorites('user-123').add('apple');
        deleteDocMock.mockRejectedValueOnce(
            new Error('Firestore delete error'),
        );
        await expect(
            toggleFavorite('apple'),
        ).rejects.toThrow('Firestore delete error');
        expect(getUserFavorites('user-123').has('apple')).toBe(true);
    });
});
