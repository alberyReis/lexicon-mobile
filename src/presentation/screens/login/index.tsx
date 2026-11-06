import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import { useLoginBuilder } from './builder';
import { styles } from './styles';

export const LoginScreen = () => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        error,
        handleLogin,
        handleGoToRegister,
    } = useLoginBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                testID="login-keyboard-avoiding-view"
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {APP_STRINGS.auth.login.title}
                        </Text>
                        <Text style={styles.subtitle}>
                            {APP_STRINGS.auth.login.subtitle}
                        </Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                {APP_STRINGS.auth.login.emailLabel}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={
                                    APP_STRINGS.auth.login.emailPlaceholder
                                }
                                placeholderTextColor={COLORS.secondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                editable={!isLoading}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                {APP_STRINGS.auth.login.passwordLabel}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder={
                                    APP_STRINGS.auth.login.passwordPlaceholder
                                }
                                placeholderTextColor={COLORS.secondary}
                                secureTextEntry
                                autoComplete="password"
                                editable={!isLoading}
                            />
                        </View>
                        {error ? (
                            <Text style={styles.error}>
                                {error}
                            </Text>
                        ) : null}
                        <Pressable
                            testID="login-button"
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    color={COLORS.background}
                                />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {APP_STRINGS.auth.login.submit}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {APP_STRINGS.auth.login.noAccount}
                        </Text>
                        <Pressable
                            onPress={handleGoToRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.footerLink}>
                                {APP_STRINGS.auth.login.signUp}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};