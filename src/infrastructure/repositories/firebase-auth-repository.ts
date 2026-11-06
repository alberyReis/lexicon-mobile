import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from '@react-native-firebase/auth';
import type {
    IAuthCredentials,
    IAuthRepository,
    IAuthUser,
} from '@/types/auth/auth-type';

export const firebaseAuthRepository: IAuthRepository = {
    async signIn({ email, password }: IAuthCredentials): Promise<IAuthUser> {
        const credential = await signInWithEmailAndPassword(
            getAuth(),
            email,
            password,
        );

        return {
            uid: credential.user.uid,
            email: credential.user.email,
        };
    },

    async signUp({ email, password }: IAuthCredentials): Promise<IAuthUser> {
        const credential = await createUserWithEmailAndPassword(
            getAuth(),
            email,
            password,
        );

        return {
            uid: credential.user.uid,
            email: credential.user.email,
        };
    },

    async signOut(): Promise<void> {
        await signOut(getAuth());
    },

    getCurrentUser(): IAuthUser | null {
        const user = getAuth().currentUser;

        if (!user) {
            return null;
        }

        return {
            uid: user.uid,
            email: user.email,
        };
    },

    onAuthStateChanged(callback) {
        return onAuthStateChanged(getAuth(), user => {
            callback(
                user
                    ? {
                        uid: user.uid,
                        email: user.email,
                    }
                    : null,
            );
        });
    },
};