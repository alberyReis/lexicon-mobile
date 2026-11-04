
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

const PAGE_SIZE = 20;

export const useHomeBuilder = () => {
    const [search, setSearch] = useState('');

    const queryClient = useQueryClient();

    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const {
        data,
        isPending,
        isError,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['words', search.trim().toLowerCase()],
        initialPageParam: null as string | null,

        queryFn: ({ pageParam }) =>
            container.getWords(pageParam, PAGE_SIZE, search.trim()),

        getNextPageParam: (lastPage) => {
            if (lastPage.length < PAGE_SIZE) {
                return undefined;
            }

            return lastPage[lastPage.length - 1];
        },
    });

    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites'],
        queryFn: container.getFavorites,
    });

    const { mutate: toggleFavoriteMutation } = useMutation({
        mutationFn: container.toggleFavorite,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['favorites'],
            });
        },
    });

    const words = data?.pages.flat() ?? [];

    const toggleFavorite = (word: string) => {
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
