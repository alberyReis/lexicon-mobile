import { View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Typography } from '@/presentation/components/typography';
import { styles } from './styles';
import { IWordDetailsRouteProp } from '@/types/word-details/word-details-type';

export const WordDetailsScreen = () => {
    const route = useRoute<IWordDetailsRouteProp>();

    const { word } = route.params;

    return (
        <View style={styles.container}>
            <Typography variant="heading">
                {word}
            </Typography>
        </View>
    );
};
