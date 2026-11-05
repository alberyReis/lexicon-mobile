import { ActivityIndicator, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/presentation/components/empty-state';
import { Header } from '@/presentation/components/header';
import { SearchBar } from '@/presentation/components/search-bar';
import { SectionHeader } from '@/presentation/components/section-header';
import { WordCard } from '@/presentation/components/word-card';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import { useHomeBuilder } from './builder';
import { styles } from './styles';

export const HomeScreen = () => {
    const {
        search,
        setSearch,
        words,
        favorites,
        toggleFavorite,
        navigation,
        isPending,
        isError,
        isFetchingNextPage,
        loadMoreWords,
    } = useHomeBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.content}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                />

                <SectionHeader
                    title={APP_STRINGS.home.wordsTitle}
                    description={APP_STRINGS.home.wordsDescription}
                />
            </View>
            {isPending ? (
                <ActivityIndicator
                    testID="home-loading"
                    size="large"
                    color={COLORS.secondary}
                />
            ) : (
                <FlatList
                    testID="home-word-list"
                    data={words}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <WordCard
                            word={item}
                            isFavorite={favorites.includes(item)}
                            onPress={() =>
                                navigation.navigate('WordDetails', {
                                    word: item,
                                })
                            }
                            onToggleFavorite={() =>
                                toggleFavorite(item)
                            }
                        />
                    )}
                    onEndReached={loadMoreWords}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <ActivityIndicator
                                testID="home-pagination-loading"
                                size="small"
                                color={COLORS.secondary}
                            />
                        ) : undefined
                    }
                    ListEmptyComponent={
                        !isError ? (
                            <EmptyState
                                title={APP_STRINGS.emptyState.searchTitle}
                                description={APP_STRINGS.emptyState.searchDescription}
                            />
                        ) : undefined
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};
