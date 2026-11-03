import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/presentation/components/header';
import { styles } from './styles';

export const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Header />
        </SafeAreaView>
    );
};