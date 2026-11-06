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
import { favoriteRepository } from '../favorite-repository-implementation';

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

describe('FavoriteRepository', () => {
    const userId = 'user-123';

    const firestoreInstance = {
        id: 'firestore-instance',
    };

    const favoritesCollection = {
        id: 'favorites-collection',
    };

    const favoriteDocument = {
        id: 'favorite-document',
    };

    const timestamp = {
        seconds: 123456,
        nanoseconds: 0,
    };

    beforeEach(() => {
        jest.resetAllMocks();

        getCurrentUserMock.mockReturnValue({
            uid: userId,
            email: 'test@example.com',
        });

        getFirestoreMock.mockReturnValue(
            firestoreInstance as never,
        );

        collectionMock.mockReturnValue(
            favoritesCollection as never,
        );

        docMock.mockReturnValue(
            favoriteDocument as never,
        );

        serverTimestampMock.mockReturnValue(
            timestamp as never,
        );
    });

    it('should return favorite words from Firestore', async () => {
        getDocsMock.mockResolvedValue({
            docs: [
                {
                    data: () => ({
                        word: 'apple',
                    }),
                },
                {
                    data: () => ({
                        word: 'banana',
                    }),
                },
            ],
        } as never);
        const result = await favoriteRepository.getFavorites();
        expect(result).toEqual([
            'apple',
            'banana',
        ]);
        expect(collectionMock).toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            userId,
            'favorites',
        );
        expect(getDocsMock).toHaveBeenCalledWith(
            favoritesCollection,
        );
    });

    it('should add a word to favorites', async () => {
        setDocMock.mockResolvedValue(undefined);
        await favoriteRepository.addFavorite('apple');
        expect(docMock).toHaveBeenCalledWith(
            favoritesCollection,
            'apple',
        );
        expect(serverTimestampMock).toHaveBeenCalledTimes(1);
        expect(setDocMock).toHaveBeenCalledWith(
            favoriteDocument,
            {
                word: 'apple',
                createdAt: timestamp,
            },
        );
    });

    it('should remove a word from favorites', async () => {
        deleteDocMock.mockResolvedValue(undefined);
        await favoriteRepository.removeFavorite('apple');
        expect(docMock).toHaveBeenCalledWith(
            favoritesCollection,
            'apple',
        );
        expect(deleteDocMock).toHaveBeenCalledWith(
            favoriteDocument,
        );
    });

    it('should return true when the word is favorited', async () => {
        getDocMock.mockResolvedValue({
            exists: () => true,
        } as never);
        const result = await favoriteRepository.isFavorite('apple');
        expect(result).toBe(true);
        expect(docMock).toHaveBeenCalledWith(
            favoritesCollection,
            'apple',
        );
        expect(getDocMock).toHaveBeenCalledWith(
            favoriteDocument,
        );
    });

    it('should return false when the word is not favorited', async () => {
        getDocMock.mockResolvedValue({
            exists: () => false,
        } as never);
        const result = await favoriteRepository.isFavorite('apple');
        expect(result).toBe(false);
        expect(getDocMock).toHaveBeenCalledWith(
            favoriteDocument,
        );
    });

    it('should propagate database errors', async () => {
        getDocsMock.mockRejectedValue(
            new Error('Firestore error'),
        );
        await expect(
            favoriteRepository.getFavorites(),
        ).rejects.toThrow('Firestore error');
    });

    it('should reject operations without an authenticated user', async () => {
        getCurrentUserMock.mockReturnValue(null);
        await expect(
            favoriteRepository.getFavorites(),
        ).rejects.toThrow('Usuário não autenticado.');
        await expect(
            favoriteRepository.addFavorite('apple'),
        ).rejects.toThrow('Usuário não autenticado.');
        await expect(
            favoriteRepository.removeFavorite('apple'),
        ).rejects.toThrow('Usuário não autenticado.');
        await expect(
            favoriteRepository.isFavorite('apple'),
        ).rejects.toThrow('Usuário não autenticado.');
        expect(collectionMock).not.toHaveBeenCalled();
        expect(getDocsMock).not.toHaveBeenCalled();
        expect(setDocMock).not.toHaveBeenCalled();
        expect(deleteDocMock).not.toHaveBeenCalled();
        expect(getDocMock).not.toHaveBeenCalled();
    });

    it('should use the authenticated user ID to access favorites', async () => {
        getCurrentUserMock.mockReturnValue({
            uid: 'another-user',
            email: 'another@example.com',
        });
        getDocsMock.mockResolvedValue({
            docs: [],
        } as never);
        const result = await favoriteRepository.getFavorites();
        expect(result).toEqual([]);
        expect(collectionMock).toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            'another-user',
            'favorites',
        );
        expect(collectionMock).not.toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            userId,
            'favorites',
        );
    });

    it('should propagate errors when adding a favorite', async () => {
        setDocMock.mockRejectedValue(
            new Error('Permission denied'),
        );
        await expect(
            favoriteRepository.addFavorite('apple'),
        ).rejects.toThrow('Permission denied');
        expect(setDocMock).toHaveBeenCalledWith(
            favoriteDocument,
            {
                word: 'apple',
                createdAt: timestamp,
            },
        );
    });
});
