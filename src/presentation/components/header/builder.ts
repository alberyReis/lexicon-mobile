import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { APP_STRINGS } from '@/shared/constants/app-strings';

export const useHeaderBuilder = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState('');

    const queryClient = useQueryClient();

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        setError('');

        try {
            await firebaseAuthRepository.signOut();

            queryClient.clear();
        } catch {
            setError(APP_STRINGS.auth.logout.error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return {
        isLoggingOut,
        error,
        handleLogout,
    };
};