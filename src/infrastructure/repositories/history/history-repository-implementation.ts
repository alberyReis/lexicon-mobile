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
import type { IHistoryRepository } from './history-repository';

const getHistoryCollection = () => {
    const user = firebaseAuthRepository.getCurrentUser();

    if (!user) {
        throw new Error('Usuário não autenticado.');
    }

    return collection(
        getFirestore(),
        'users',
        user.uid,
        'history',
    );
};

export const historyRepository: IHistoryRepository = {
    getHistory: async () => {
        const reference = query(
            getHistoryCollection(),
            orderBy('viewedAt', 'desc'),
        );

        const snapshot = await getDocs(reference);

        return snapshot.docs.map(
            document => document.data().word as string,
        );
    },

    addToHistory: async word => {
        const reference = doc(getHistoryCollection(), word);

        await setDoc(reference, {
            word,
            viewedAt: serverTimestamp(),
        });
    },

    clearHistory: async () => {
        const snapshot = await getDocs(getHistoryCollection());

        const firestore = getFirestore();
        const batchSize = 450;

        for (let index = 0; index < snapshot.docs.length; index += batchSize) {
            const batch = writeBatch(firestore);

            snapshot.docs
                .slice(index, index + batchSize)
                .forEach(document => {
                    batch.delete(document.ref);
                });

            await batch.commit();
        }
    },
};
