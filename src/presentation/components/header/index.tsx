import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import lexiconLogo from '../../../../assets/images/lexicon-logo.png';
import { Typography } from '@/presentation/components/typography';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import { useHeaderBuilder } from './builder';
import { styles } from './styles';

export const Header = () => {
    const { isLoggingOut, error, handleLogout } = useHeaderBuilder();

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Image
                    testID="header-logo"
                    source={lexiconLogo}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Pressable
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                    accessibilityRole="button"
                    accessibilityLabel={APP_STRINGS.auth.logout.button}
                    accessibilityState={{ disabled: isLoggingOut }}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator
                            size="small"
                            color={COLORS.secondary}
                        />
                    ) : (
                        <LogOut
                            size={20}
                            color={COLORS.secondary}
                            strokeWidth={1.8}
                        />
                    )}
                </Pressable>
            </View>
            <View style={styles.content}>
                <Typography variant="heading">
                    {APP_STRINGS.home.title}
                </Typography>

                <Typography variant="subtitle">
                    {APP_STRINGS.appSubtitle}
                </Typography>
            </View>
            {error ? (
                <View style={styles.errorContainer}>
                    <Typography variant="subtitle">
                        {error}
                    </Typography>
                </View>
            ) : null}
        </View>
    );
};