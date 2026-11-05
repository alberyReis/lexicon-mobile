import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from '@react-native-firebase/auth';
import { firebaseAuthRepository } from '../firebase-auth-repository';

jest.mock('@react-native-firebase/auth', () => ({
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
}));

const getAuthMock = jest.mocked(getAuth);
const signInMock = jest.mocked(signInWithEmailAndPassword);
const signUpMock = jest.mocked(createUserWithEmailAndPassword);
const signOutMock = jest.mocked(signOut);
const onAuthStateChangedMock = jest.mocked(onAuthStateChanged);

const auth = {
    currentUser: null as {
        uid: string;
        email: string | null;
    } | null,
};

const user = {
    uid: 'user-123',
    email: 'test@example.com',
};

const credentials = {
    email: 'test@example.com',
    password: '123456',
};

describe('FirebaseAuthRepository', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        auth.currentUser = null;

        getAuthMock.mockReturnValue(auth as never);
    });

    describe('signIn', () => {
        it('should authenticate and return the user', async () => {
            signInMock.mockResolvedValue({
                user,
            } as never);
            const result = await firebaseAuthRepository.signIn(
                credentials,
            );
            expect(result).toEqual(user);
            expect(signInMock).toHaveBeenCalledWith(
                auth,
                credentials.email,
                credentials.password,
            );
            expect(signInMock).toHaveBeenCalledTimes(1);
        });

        it('should propagate authentication errors', async () => {
            signInMock.mockRejectedValue(
                new Error('Invalid credentials'),
            );
            await expect(
                firebaseAuthRepository.signIn(credentials),
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('signUp', () => {
        it('should register and return the user', async () => {
            signUpMock.mockResolvedValue({
                user,
            } as never);
            const result = await firebaseAuthRepository.signUp(
                credentials,
            );
            expect(result).toEqual(user);
            expect(signUpMock).toHaveBeenCalledWith(
                auth,
                credentials.email,
                credentials.password,
            );
            expect(signUpMock).toHaveBeenCalledTimes(1);
        });

        it('should propagate registration errors', async () => {
            signUpMock.mockRejectedValue(
                new Error('Email already in use'),
            );
            await expect(
                firebaseAuthRepository.signUp(credentials),
            ).rejects.toThrow('Email already in use');
        });
    });

    describe('signOut', () => {
        it('should sign out the authenticated user', async () => {
            signOutMock.mockResolvedValue(undefined);
            await firebaseAuthRepository.signOut();
            expect(signOutMock).toHaveBeenCalledWith(auth);
            expect(signOutMock).toHaveBeenCalledTimes(1);
        });

        it('should propagate sign out errors', async () => {
            signOutMock.mockRejectedValue(
                new Error('Sign out failed'),
            );
            await expect(
                firebaseAuthRepository.signOut(),
            ).rejects.toThrow('Sign out failed');
        });
    });

    describe('getCurrentUser', () => {
        it('should return the authenticated user', () => {
            auth.currentUser = user;
            const result = firebaseAuthRepository.getCurrentUser();
            expect(result).toEqual(user);
            expect(getAuthMock).toHaveBeenCalledTimes(1);
        });

        it('should return null when no user is authenticated', () => {
            const result = firebaseAuthRepository.getCurrentUser();
            expect(result).toBeNull();
        });

        it('should preserve a null email', () => {
            auth.currentUser = {
                uid: 'user-123',
                email: null,
            };
            const result = firebaseAuthRepository.getCurrentUser();
            expect(result).toEqual({
                uid: 'user-123',
                email: null,
            });
        });
    });

    describe('onAuthStateChanged', () => {
        it('should notify when a user is authenticated', () => {
            const callback = jest.fn();
            const unsubscribe = jest.fn();
            onAuthStateChangedMock.mockImplementation(
                (_auth, listener) => {
                    if (typeof listener === 'function') {
                        listener(user as never);
                    }

                    return unsubscribe;
                },
            );
            const result =
                firebaseAuthRepository.onAuthStateChanged(callback);
            expect(onAuthStateChangedMock).toHaveBeenCalledWith(
                auth,
                expect.any(Function),
            );
            expect(callback).toHaveBeenCalledWith(user);
            expect(result).toBe(unsubscribe);
        });

        it('should notify when the user signs out', () => {
            const callback = jest.fn();
            onAuthStateChangedMock.mockImplementation(
                (_auth, listener) => {
                    if (typeof listener === 'function') {
                        listener(null);
                    }

                    return jest.fn();
                },
            );
            firebaseAuthRepository.onAuthStateChanged(callback);
            expect(callback).toHaveBeenCalledWith(null);
        });

        it('should return the unsubscribe function', () => {
            const unsubscribe = jest.fn();
            onAuthStateChangedMock.mockReturnValue(unsubscribe);
            const result =
                firebaseAuthRepository.onAuthStateChanged(jest.fn());
            result();
            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });
    });
});