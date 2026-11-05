import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from '@/dependency-injection/container';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import type { IWordDetailsRouteProp } from '@/types/word-details/word-details-route-type';

export const useWordDetailsBuilder = () => {
    const route = useRoute<IWordDetailsRouteProp>();

    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const queryClient = useQueryClient();

    const { word } = route.params;

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
        const registerHistory = async () => {
            try {
                await container.addToHistory(word);

                await queryClient.invalidateQueries({
                    queryKey: ['history'],
                });
            } catch (error) {
                console.error('[History] Failed to register word:', error);
            }
        };

        registerHistory();
    }, [word, queryClient]);

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
