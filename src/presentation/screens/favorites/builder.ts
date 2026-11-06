
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import { container } from '@/dependency-injection/container';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useFavoritesBuilder = () => {
    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const queryClient = useQueryClient();

    const uid = firebaseAuthRepository.getCurrentUser()?.uid;

    const {
        data: favorites = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: QUERY_KEYS.favorites(uid ?? ''),
        queryFn: container.getFavorites,
        enabled: !!uid,
    });

    const { mutate: toggleFavorite, isPending: isUpdating } = useMutation({
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

    const handleToggleFavorite = (word: string) => {
        if (!uid) {
            return;
        }

        toggleFavorite(word);
    };

    const openWordDetails = (word: string) => {
        navigation.navigate('WordDetails', { word });
    };

    return {
        favorites,
        isPending,
        isError,
        isUpdating,
        toggleFavorite: handleToggleFavorite,
        openWordDetails,
    };
};
