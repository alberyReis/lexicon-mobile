import { BookSearch } from 'lucide-react-native';
import { View } from 'react-native';
import { Typography } from '@/presentation/components/typography';
import { COLORS } from '@/shared/constants/colors';
import type { IEmptyStateProps } from '@/types/empty-state/empty-state-type';
import { styles } from './styles';

export const EmptyState = ({
    title,
    description,
    icon: Icon = BookSearch,
}: IEmptyStateProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Icon
                    size={40}
                    color={COLORS.secondary}
                    strokeWidth={1.5}
                />
            </View>
            <View style={styles.content}>
                <Typography variant="title">
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
