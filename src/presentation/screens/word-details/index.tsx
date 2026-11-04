import { SafeAreaView } from 'react-native-safe-area-context';
import { WordDetailsHeader } from '@/presentation/components/word-details-header';
import { useWordDetailsBuilder } from './builder';
import { styles } from './styles';

export const WordDetailsScreen = () => {
    const { word, handleGoBack } = useWordDetailsBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <WordDetailsHeader
                word={word}
                onGoBack={handleGoBack}
            />
        </SafeAreaView>
    );
};
