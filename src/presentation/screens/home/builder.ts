import { useState } from 'react';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import { container } from '@/dependency-injection/container';
import { firebaseAuthRepository } from '@/infrastructure/repositories/firebase-auth-repository';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

const PAGE_SIZE = 20;

export const useHomeBuilder = () => {
    const [search, setSearch] = useState('');

    const queryClient = useQueryClient();

    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const uid = firebaseAuthRepository.getCurrentUser()?.uid;

    const {
        data,
        isPending,
        isError,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: QUERY_KEYS.words(search.trim().toLowerCase()),
        initialPageParam: null as string | null,

        queryFn: ({ pageParam }) =>
            container.getWords(pageParam, PAGE_SIZE, search.trim()),

        getNextPageParam: lastPage => {
            if (lastPage.length < PAGE_SIZE) {
                return undefined;
            }

            return lastPage[lastPage.length - 1];
        },
    });

    const { data: favorites = [] } = useQuery({
        queryKey: QUERY_KEYS.favorites(uid ?? ''),
        queryFn: container.getFavorites,
        enabled: !!uid,
    });

    const { mutate: toggleFavoriteMutation } = useMutation({
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

    const words = data?.pages.flat() ?? [];

    const toggleFavorite = (word: string) => {
        if (!uid) {
            return;
        }

        toggleFavoriteMutation(word);
    };

    const loadMoreWords = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return {
        search,
        setSearch,
        words,
        favorites,
        toggleFavorite,
        navigation,
        isPending,
        isError,
        isFetchingNextPage,
        hasNextPage,
        loadMoreWords,
    };
};