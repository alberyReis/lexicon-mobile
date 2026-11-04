import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import { container } from '@/dependency-injection/container';

const PAGE_SIZE = 20;

export const useHomeBuilder = () => {
    const [search, setSearch] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    
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
        queryKey: ['words'],
        initialPageParam: null as string | null,

        queryFn: ({ pageParam }) =>
            container.getWords(pageParam, PAGE_SIZE),

        getNextPageParam: (lastPage) => {
            if (lastPage.length < PAGE_SIZE) {
                return undefined;
            }

            return lastPage[lastPage.length - 1];
        },
    });

    const words = (data?.pages.flat() ?? []).filter((word) =>
        word.toLowerCase().includes(search.trim().toLowerCase()),
    );

    const toggleFavorite = (word: string) => {
        setFavorites((currentFavorites) =>
            currentFavorites.includes(word)
                ? currentFavorites.filter((favorite) => favorite !== word)
                : [...currentFavorites, word],
        );
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