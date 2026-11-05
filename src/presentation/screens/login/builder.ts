import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';

export const useLoginBuilder = () => {
    const navigation = useNavigation<NativeStackNavigationProp<IRootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (isLoading) {
            return;
        }

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            setError(APP_STRINGS.auth.login.requiredFields);
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await firebaseAuthRepository.signIn({
                email: normalizedEmail,
                password,
            });
        } catch {
            setError(APP_STRINGS.auth.login.invalidCredentials);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToRegister = () => {
        navigation.navigate('Register');
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        error,
        handleLogin,
        handleGoToRegister,
    };
};