import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';

export const useRegisterBuilder = () => {
    const navigation = useNavigation<NativeStackNavigationProp<IRootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (isLoading) {
            return;
        }

        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password || !confirmPassword) {
            setError(APP_STRINGS.auth.register.requiredFields);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError(APP_STRINGS.auth.register.invalidEmail);
            return;
        }

        if (password.length < 6) {
            setError(APP_STRINGS.auth.register.shortPassword);
            return;
        }

        if (password !== confirmPassword) {
            setError(APP_STRINGS.auth.register.passwordMismatch);
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await firebaseAuthRepository.signUp({
                email: normalizedEmail,
                password,
            });
        } catch (error: unknown) {
            const firebaseError = error as { code?: string };

            if (firebaseError.code === 'auth/email-already-in-use') {
                setError(APP_STRINGS.auth.register.emailAlreadyInUse);
            } else {
                setError(APP_STRINGS.auth.register.registerError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLogin = () => {
        navigation.navigate('Login');
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        isLoading,
        error,
        handleRegister,
        handleGoToLogin,
    };
};