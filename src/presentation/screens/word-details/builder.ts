import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import type { IWordDetailsRouteProp } from '@/types/word-details/word-details-route-type';
import { container } from '@/dependency-injection/container';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useWordDetailsBuilder = () => {
    const route = useRoute<IWordDetailsRouteProp>();

    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const queryClient = useQueryClient();

    const { word } = route.params;

    const uid = firebaseAuthRepository.getCurrentUser()?.uid;

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['word-details', word],
        queryFn: () => container.getWordDetails.execute(word),
    });

    useEffect(() => {
        if (!uid) {
            return;
        }

        const registerHistory = async () => {
            try {
                await container.addToHistory(word);

                await queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.history(uid),
                });
            } catch (error) {
                console.error('[History] Failed to register word:', error);
            }
        };

        registerHistory();
    }, [word, uid, queryClient]);

    const handleGoBack = () => {
        navigation.goBack();
    };

    return {
        word,
        wordDetails: data?.[0],
        isLoading,
        isError,
        refetch,
        handleGoBack,
    };
};