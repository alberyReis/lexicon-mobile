import { View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import type { ISectionHeaderProps } from '@/types/section-header/section-header-type';
import { styles } from './styles';

export const SectionHeader = ({ title, description }: ISectionHeaderProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.indicator} />
            <View style={styles.content}>
                <Typography variant="title" style={styles.title}>
                    {title}
                </Typography>
                {description && (
                    <Typography variant="subtitle" style={styles.description}>
                        {description}
                    </Typography>
                )}
            </View>
        </View>
    );
};
