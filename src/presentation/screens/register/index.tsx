import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';
import { useRegisterBuilder } from './builder';
import { styles } from './styles';

export const RegisterScreen = () => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        isLoading,
        error,
        handleRegister,
        handleGoToLogin,
    } = useRegisterBuilder();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {APP_STRINGS.auth.register.title}
                        </Text>
                        <Text style={styles.subtitle}>
                            {APP_STRINGS.auth.register.subtitle}
                        </Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                {APP_STRINGS.auth.register.emailLabel}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={
                                    APP_STRINGS.auth.register.emailPlaceholder
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
                                {APP_STRINGS.auth.register.passwordLabel}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder={
                                    APP_STRINGS.auth.register.passwordPlaceholder
                                }
                                placeholderTextColor={COLORS.secondary}
                                secureTextEntry
                                autoComplete="new-password"
                                editable={!isLoading}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>
                                {APP_STRINGS.auth.register.confirmPasswordLabel}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder={
                                    APP_STRINGS.auth.register.confirmPasswordPlaceholder
                                }
                                placeholderTextColor={COLORS.secondary}
                                secureTextEntry
                                autoComplete="new-password"
                                editable={!isLoading}
                            />
                        </View>
                        {error ? (
                            <Text style={styles.error}>
                                {error}
                            </Text>
                        ) : null}
                        <Pressable
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    color={COLORS.background}
                                />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {APP_STRINGS.auth.register.submit}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {APP_STRINGS.auth.register.hasAccount}
                        </Text>
                        <Pressable
                            onPress={handleGoToLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.footerLink}>
                                {APP_STRINGS.auth.register.signIn}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};