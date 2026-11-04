import { View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import type { ISectionHeaderProps } from '@/types/section-header/section-header-type';
import { styles } from './styles';

export const SectionHeader = ({ title, description }: ISectionHeaderProps) => {
    return (
        <View style={styles.container}>
            <Typography variant="title">
                {title}
            </Typography>
            {description && (
                <Typography variant="subtitle">
                    {description}
                </Typography>
            )}
        </View>
    );
};
