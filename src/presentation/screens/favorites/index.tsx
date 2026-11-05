import { ActivityIndicator, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/presentation/components/header';
import { SectionHeader } from '@/presentation/components/section-header';
import { WordCard } from '@/presentation/components/word-card';
import { EmptyState } from '@/presentation/components/empty-state';
import { COLORS } from '@/shared/constants/colors';
import { useFavoritesBuilder } from './builder';
import { styles } from './styles';

export const FavoritesScreen = () => {
    const {
        favorites,
        isPending,
        isError,
        isUpdating,
        toggleFavorite,
        openWordDetails,
    } = useFavoritesBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.content}>
                <SectionHeader
                    title="Favoritos"
                    description="Suas palavras salvas para consultar depois."
                />
            </View>
            {isPending ? (
                <ActivityIndicator
                    testID="favorites-loading"
                    size="large"
                    color={COLORS.secondary}
                />
            ) : (
                <FlatList
                    testID="favorites-word-list"
                    data={favorites}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <WordCard
                            word={item}
                            isFavorite
                            onPress={() => openWordDetails(item)}
                            onToggleFavorite={() => toggleFavorite(item)}
                        />
                    )}
                    ListEmptyComponent={
                        !isError ? (
                            <EmptyState
                                title="Nenhum favorito ainda"
                                description="Toque no coração de uma palavra para salvá-la aqui."
                            />
                        ) : undefined
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    extraData={isUpdating}
                />
            )}
        </SafeAreaView>
    );
};
