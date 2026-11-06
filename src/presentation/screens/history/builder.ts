import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import { container } from '@/dependency-injection/container';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useHistoryBuilder = () => {
    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const queryClient = useQueryClient();

    const uid = firebaseAuthRepository.getCurrentUser()?.uid;

    const {
        data: history = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: QUERY_KEYS.history(uid ?? ''),
        queryFn: container.getHistory,
        enabled: !!uid,
    });

    const { data: favorites = [] } = useQuery({
        queryKey: QUERY_KEYS.favorites(uid ?? ''),
        queryFn: container.getFavorites,
        enabled: !!uid,
    });

    const {
        mutate: toggleFavoriteMutation,
        isPending: isUpdating,
    } = useMutation({
        mutationFn: container.toggleFavorite,

        onSuccess: () => {
            if (!uid) {
                return;
            }

            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.favorites(uid),
            });
        },
    });

    const toggleFavorite = (word: string) => {
        if (!uid) {
            return;
        }

        toggleFavoriteMutation(word);
    };

    const openWordDetails = (word: string) => {
        navigation.navigate('WordDetails', { word });
    };

    return {
        history,
        favorites,
        isPending,
        isError,
        isUpdating,
        toggleFavorite,
        openWordDetails,
    };
};
