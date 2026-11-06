import {
    collection,
    doc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    writeBatch,
} from '@react-native-firebase/firestore';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { historyRepository } from '../history-repository-implementation';

jest.mock('@react-native-firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    getFirestore: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(),
    serverTimestamp: jest.fn(),
    setDoc: jest.fn(),
    writeBatch: jest.fn(),
}));

jest.mock('@/infrastructure/repositories/firebase-auth-repository', () => ({
    firebaseAuthRepository: {
        getCurrentUser: jest.fn(),
    },
}));

const collectionMock = jest.mocked(collection);
const docMock = jest.mocked(doc);
const getDocsMock = jest.mocked(getDocs);
const getFirestoreMock = jest.mocked(getFirestore);
const orderByMock = jest.mocked(orderBy);
const queryMock = jest.mocked(query);
const serverTimestampMock = jest.mocked(serverTimestamp);
const setDocMock = jest.mocked(setDoc);
const writeBatchMock = jest.mocked(writeBatch);

const getCurrentUserMock = jest.mocked(
    firebaseAuthRepository.getCurrentUser,
);

describe('HistoryRepository', () => {
    const userId = 'user-123';

    const firestoreInstance = {
        id: 'firestore-instance',
    };

    const historyCollection = {
        id: 'history-collection',
    };

    const historyDocument = {
        id: 'history-document',
    };

    const orderByConstraint = {
        field: 'viewedAt',
        direction: 'desc',
    };

    const historyQuery = {
        id: 'history-query',
    };

    const timestamp = {
        seconds: 1700000000,
        nanoseconds: 0,
    };

    let deleteMock: jest.Mock;
    let commitMock: jest.Mock;

    const createDocument = (word: string) => ({
        ref: {
            id: word,
        },
        data: () => ({
            word,
        }),
    });

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
            historyCollection as never,
        );

        docMock.mockReturnValue(
            historyDocument as never,
        );

        orderByMock.mockReturnValue(
            orderByConstraint as never,
        );

        queryMock.mockReturnValue(
            historyQuery as never,
        );

        serverTimestampMock.mockReturnValue(
            timestamp as never,
        );

        deleteMock = jest.fn();
        commitMock = jest.fn().mockResolvedValue(undefined);

        writeBatchMock.mockReturnValue({
            delete: deleteMock,
            commit: commitMock,
        } as never);
    });

    it('should return words ordered by most recent view', async () => {
        getDocsMock.mockResolvedValue({
            docs: [
                createDocument('banana'),
                createDocument('apple'),
            ],
        } as never);
        const result = await historyRepository.getHistory();
        expect(result).toEqual([
            'banana',
            'apple',
        ]);
        expect(collectionMock).toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            userId,
            'history',
        );
        expect(orderByMock).toHaveBeenCalledWith(
            'viewedAt',
            'desc',
        );
        expect(queryMock).toHaveBeenCalledWith(
            historyCollection,
            orderByConstraint,
        );
        expect(getDocsMock).toHaveBeenCalledWith(
            historyQuery,
        );
    });

    it('should return an empty array when history is empty', async () => {
        getDocsMock.mockResolvedValue({
            docs: [],
        } as never);
        const result = await historyRepository.getHistory();
        expect(result).toEqual([]);
    });

    it('should add a word to history with a timestamp', async () => {
        setDocMock.mockResolvedValue(undefined);
        await historyRepository.addToHistory('apple');
        expect(docMock).toHaveBeenCalledWith(
            historyCollection,
            'apple',
        );
        expect(serverTimestampMock).toHaveBeenCalledTimes(1);
        expect(setDocMock).toHaveBeenCalledWith(
            historyDocument,
            {
                word: 'apple',
                viewedAt: timestamp,
            },
        );
    });

    it('should update the timestamp when a word already exists', async () => {
        setDocMock.mockResolvedValue(undefined);
        await historyRepository.addToHistory('apple');
        await historyRepository.addToHistory('apple');
        expect(docMock).toHaveBeenCalledTimes(2);
        expect(docMock).toHaveBeenNthCalledWith(
            1,
            historyCollection,
            'apple',
        );
        expect(docMock).toHaveBeenNthCalledWith(
            2,
            historyCollection,
            'apple',
        );
        expect(serverTimestampMock).toHaveBeenCalledTimes(2);
        expect(setDocMock).toHaveBeenCalledTimes(2);
        expect(setDocMock).toHaveBeenNthCalledWith(
            1,
            historyDocument,
            {
                word: 'apple',
                viewedAt: timestamp,
            },
        );
        expect(setDocMock).toHaveBeenNthCalledWith(
            2,
            historyDocument,
            {
                word: 'apple',
                viewedAt: timestamp,
            },
        );
    });

    it('should clear all history records', async () => {
        const documents = [
            createDocument('apple'),
            createDocument('banana'),
            createDocument('orange'),
        ];
        getDocsMock.mockResolvedValue({
            docs: documents,
        } as never);
        await historyRepository.clearHistory();
        expect(getDocsMock).toHaveBeenCalledWith(
            historyCollection,
        );
        expect(writeBatchMock).toHaveBeenCalledTimes(1);
        expect(writeBatchMock).toHaveBeenCalledWith(
            firestoreInstance,
        );
        expect(deleteMock).toHaveBeenCalledTimes(3);
        documents.forEach(document => {
            expect(deleteMock).toHaveBeenCalledWith(
                document.ref,
            );
        });
        expect(commitMock).toHaveBeenCalledTimes(1);
    });

    it('should propagate database errors', async () => {
        getDocsMock.mockRejectedValue(
            new Error('Firestore error'),
        );
        await expect(
            historyRepository.getHistory(),
        ).rejects.toThrow('Firestore error');
    });

    it('should reject operations without an authenticated user', async () => {
        getCurrentUserMock.mockReturnValue(null);
        await expect(
            historyRepository.getHistory(),
        ).rejects.toThrow('Usuário não autenticado.');
        await expect(
            historyRepository.addToHistory('apple'),
        ).rejects.toThrow('Usuário não autenticado.');
        await expect(
            historyRepository.clearHistory(),
        ).rejects.toThrow('Usuário não autenticado.');
        expect(collectionMock).not.toHaveBeenCalled();
        expect(getDocsMock).not.toHaveBeenCalled();
        expect(setDocMock).not.toHaveBeenCalled();
        expect(writeBatchMock).not.toHaveBeenCalled();
    });

    it('should use the authenticated user ID to access history', async () => {
        getCurrentUserMock.mockReturnValue({
            uid: 'another-user',
            email: 'another@example.com',
        });
        getDocsMock.mockResolvedValue({
            docs: [],
        } as never);
        const result = await historyRepository.getHistory();
        expect(result).toEqual([]);
        expect(collectionMock).toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            'another-user',
            'history',
        );
        expect(collectionMock).not.toHaveBeenCalledWith(
            firestoreInstance,
            'users',
            userId,
            'history',
        );
    });

    it('should not create a batch when history is empty', async () => {
        getDocsMock.mockResolvedValue({
            docs: [],
        } as never);
        await historyRepository.clearHistory();
        expect(getDocsMock).toHaveBeenCalledWith(
            historyCollection,
        );
        expect(writeBatchMock).not.toHaveBeenCalled();
        expect(deleteMock).not.toHaveBeenCalled();
        expect(commitMock).not.toHaveBeenCalled();
    });

    it('should delete history in batches of 450 documents', async () => {
        const documents = Array.from(
            { length: 901 },
            (_, index) => createDocument(`word-${index}`),
        );
        getDocsMock.mockResolvedValue({
            docs: documents,
        } as never);
        await historyRepository.clearHistory();
        expect(writeBatchMock).toHaveBeenCalledTimes(3);
        expect(deleteMock).toHaveBeenCalledTimes(901);
        expect(commitMock).toHaveBeenCalledTimes(3);
        expect(deleteMock).toHaveBeenNthCalledWith(
            1,
            documents[0].ref,
        );
        expect(deleteMock).toHaveBeenNthCalledWith(
            450,
            documents[449].ref,
        );
        expect(deleteMock).toHaveBeenNthCalledWith(
            451,
            documents[450].ref,
        );
        expect(deleteMock).toHaveBeenNthCalledWith(
            900,
            documents[899].ref,
        );
        expect(deleteMock).toHaveBeenNthCalledWith(
            901,
            documents[900].ref,
        );
    });

    it('should propagate errors when adding a word', async () => {
        setDocMock.mockRejectedValue(
            new Error('Permission denied'),
        );
        await expect(
            historyRepository.addToHistory('apple'),
        ).rejects.toThrow('Permission denied');
    });

    it('should propagate errors when committing a batch', async () => {
        getDocsMock.mockResolvedValue({
            docs: [
                createDocument('apple'),
            ],
        } as never);
        commitMock.mockRejectedValue(
            new Error('Batch commit failed'),
        );
        await expect(
            historyRepository.clearHistory(),
        ).rejects.toThrow('Batch commit failed');
        expect(writeBatchMock).toHaveBeenCalledTimes(1);
        expect(commitMock).toHaveBeenCalledTimes(1);
    });
});
