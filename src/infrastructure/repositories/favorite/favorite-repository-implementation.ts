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
import type { IFavoriteRepository } from './favorite-repository';

const getFavoritesCollection = () => {
    const user = firebaseAuthRepository.getCurrentUser();

    if (!user) {
        throw new Error('Usuário não autenticado.');
    }

    return collection(
        getFirestore(),
        'users',
        user.uid,
        'favorites',
    );
};

export const favoriteRepository: IFavoriteRepository = {
    getFavorites: async () => {
        const snapshot = await getDocs(getFavoritesCollection());

        return snapshot.docs.map(document => document.data().word as string);
    },

    addFavorite: async word => {
        const reference = doc(getFavoritesCollection(), word);

        await setDoc(reference, {
            word,
            createdAt: serverTimestamp(),
        });
    },

    removeFavorite: async word => {
        const reference = doc(getFavoritesCollection(), word);

        await deleteDoc(reference);
    },

    isFavorite: async word => {
        const reference = doc(getFavoritesCollection(), word);

        const snapshot = await getDoc(reference);

        return snapshot.exists();
    },
};