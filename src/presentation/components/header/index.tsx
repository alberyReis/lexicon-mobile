import { Image, Text, View } from 'react-native';
import lexiconLogo from '../../../../assets/images/lexicon-logo.png';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { styles } from './styles';

export const Header = () => {
    return (
        <View style={styles.container}>
            <Image
                source={lexiconLogo}
                style={styles.logo}
                resizeMode="contain"
            />
            <View style={styles.content}>
                <Text style={styles.title}>
                    {APP_STRINGS.home.title}
                </Text>
                <Text style={styles.subtitle}>
                    {APP_STRINGS.appSubtitle}
                </Text>
            </View>
        </View>
    );
};