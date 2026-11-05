import { useEffect, useState } from 'react';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import type { IAuthUser } from '@/types/auth/auth-type';

export const useAppNavigationBuilder = () => {
    const [user, setUser] = useState<IAuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firebaseAuthRepository.onAuthStateChanged(
            authenticatedUser => {
                setUser(authenticatedUser);
                setIsLoading(false);
            },
        );

        return unsubscribe;
    }, []);

    return {
        user,
        isLoading,
    };
};