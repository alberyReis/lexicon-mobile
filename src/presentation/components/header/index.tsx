import { Image, View } from 'react-native';
import lexiconLogo from '../../../../assets/images/lexicon-logo.png';
import { Typography } from '@/presentation/components/typography';
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
                <Typography variant="heading">
                    {APP_STRINGS.home.title}
                </Typography>
                <Typography variant="subtitle">
                    {APP_STRINGS.appSubtitle}
                </Typography>
            </View>
        </View>
    );
};
