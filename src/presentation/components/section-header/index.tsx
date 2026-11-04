import { Text, View } from 'react-native';
import type { ISectionHeaderProps } from '@/types/section-header/section-header-type';
import { styles } from './styles';

export const SectionHeader = ({ title, description }: ISectionHeaderProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {title}
            </Text>
            {description && (
                <Text style={styles.description}>
                    {description}
                </Text>
            )}
        </View>
    );
};