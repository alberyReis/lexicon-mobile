
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WordDefinition } from '@/presentation/components/word-definition';
import { WordDetailsHeader } from '@/presentation/components/word-details-header';
import { Typography } from '@/presentation/components/typography';
import { COLORS } from '@/shared/constants/colors';

import { useWordDetailsBuilder } from './builder';
import { styles } from './styles';
import { APP_STRINGS } from '@/shared/constants/app-strings';

export const WordDetailsScreen = () => {
    const {
        word,
        wordDetails,
        isLoading,
        isError,
        refetch,
        handleGoBack,
    } = useWordDetailsBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <WordDetailsHeader
                    word={wordDetails?.word ?? word}
                    phonetic={wordDetails?.phonetic}
                    partOfSpeech={wordDetails?.meanings[0]?.partOfSpeech}
                    onGoBack={handleGoBack}
                />

                {isLoading && (
                    <View style={styles.feedbackContainer}>
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primary}
                        />
                    </View>
                )}

                {isError && (
                    <View style={styles.feedbackContainer}>
                        <Typography variant="title">
                             {APP_STRINGS.wordDetails.loadError}
                        </Typography>

                        <Typography variant="subtitle">
                            {APP_STRINGS.wordDetails.retry}
                        </Typography>
                    </View>
                )}

                {wordDetails && (
                    <WordDefinition
                        meanings={wordDetails.meanings}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
