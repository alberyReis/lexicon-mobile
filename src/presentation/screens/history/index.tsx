import { ActivityIndicator, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Header } from '@/presentation/components/header';
import { SectionHeader } from '@/presentation/components/section-header';
import { WordCard } from '@/presentation/components/word-card';
import { EmptyState } from '@/presentation/components/empty-state';
import { COLORS } from '@/shared/constants/colors';
import { useHistoryBuilder } from './builder';
import { styles } from './styles';
import { APP_STRINGS } from '@/shared/constants/app-strings';

export const HistoryScreen = () => {
    const {
        history,
        favorites,
        isPending,
        isError,
        isUpdating,
        toggleFavorite,
        openWordDetails,
    } = useHistoryBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.content}>
                <SectionHeader
                    title={APP_STRINGS.history.title}
                    description={APP_STRINGS.history.description}
                />
            </View>
            {isPending ? (
                <ActivityIndicator
                    size="large"
                    color={COLORS.secondary}
                />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <WordCard
                            word={item}
                            isFavorite={favorites.includes(item)}
                            onPress={() => openWordDetails(item)}
                            onToggleFavorite={() => toggleFavorite(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            title={
                                isError
                                    ? APP_STRINGS.history.errorTitle
                                    : APP_STRINGS.history.emptyTitle
                            }
                            description={
                                isError
                                    ? APP_STRINGS.history.errorDescription
                                    : APP_STRINGS.history.emptyDescription
                            }
                        />
                    }
                    extraData={favorites}
                    scrollEnabled={!isUpdating}
                />
            )}
        </SafeAreaView>
    );
};
