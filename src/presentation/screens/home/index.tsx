import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/presentation/components/empty-state';
import { Header } from '@/presentation/components/header';
import { SearchBar } from '@/presentation/components/search-bar';
import { SectionHeader } from '@/presentation/components/section-header';
import { WordCard } from '@/presentation/components/word-card';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useHomeBuilder } from './builder';
import { styles } from './styles';

export const HomeScreen = () => {
    const {
        search,
        setSearch,
        words,
        favorites,
        toggleFavorite,
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
            <FlatList
                data={words}
                keyExtractor={(item) => item.word}
                renderItem={({ item }) => (
                    <WordCard
                        word={item.word}
                        phonetic={item.phonetic}
                        partOfSpeech={item.partOfSpeech}
                        isFavorite={favorites.includes(item.word)}
                        onPress={() => { }}
                        onToggleFavorite={() => toggleFavorite(item.word)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState
                        title={APP_STRINGS.emptyState.searchTitle}
                        description={APP_STRINGS.emptyState.searchDescription}
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};
