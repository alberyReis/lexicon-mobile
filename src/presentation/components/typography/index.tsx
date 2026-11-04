import { Text } from 'react-native';
import type { ITypographyProps } from '@/types/typography/typography-type';
import { styles } from './styles';

export const Typography = ({
    children,
    variant = 'body',
    style,
}: ITypographyProps) => {
    return (
        <Text style={[styles[variant], style]}>
            {children}
        </Text>
    );
};
