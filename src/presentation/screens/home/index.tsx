import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Header } from '@/presentation/components/header';
import { SearchBar } from '@/presentation/components/search-bar';
import { SectionHeader } from '@/presentation/components/section-header';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { useHomeBuilder } from './builder';
import { styles } from './styles';

export const HomeScreen = () => {
    const { search, setSearch } = useHomeBuilder();

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
        </SafeAreaView>
    );
};