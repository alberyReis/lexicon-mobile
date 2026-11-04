import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/presentation/components/header';
import { SearchBar } from '@/presentation/components/search-bar';
import { useHomeBuilder } from './builder';
import { styles } from './styles';

export const HomeScreen = () => {
    const { search, setSearch } = useHomeBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <SearchBar
                value={search}
                onChangeText={setSearch}
            />
        </SafeAreaView>
    );
};