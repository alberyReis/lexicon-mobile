import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import type { IAuthUser } from '@/types/auth/auth-type';

export const useAppNavigationBuilder = () => {
    const [user, setUser] = useState<IAuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const queryClient = useQueryClient();

    useEffect(() => {
        const unsubscribe = firebaseAuthRepository.onAuthStateChanged(
            authenticatedUser => {
                queryClient.clear();

                setUser(authenticatedUser);
                setIsLoading(false);
            },
        );

        return unsubscribe;
    }, [queryClient]);

    return {
        user,
        isLoading,
    };
};