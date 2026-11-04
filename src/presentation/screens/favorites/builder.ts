import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import { container } from '@/dependency-injection/container';

export const useFavoritesBuilder = () => {
    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const queryClient = useQueryClient();

    const {
        data: favorites = [],
        isPending,
        isError,
    } = useQuery({
        queryKey: ['favorites'],
        queryFn: container.getFavorites,
    });

    const { mutate: toggleFavorite, isPending: isUpdating } = useMutation({
        mutationFn: container.toggleFavorite,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['favorites'],
            });
        },
    });

    const openWordDetails = (word: string) => {
        navigation.navigate('WordDetails', { word });
    };

    return {
        favorites,
        isPending,
        isError,
        isUpdating,
        toggleFavorite,
        openWordDetails,
    };
};
