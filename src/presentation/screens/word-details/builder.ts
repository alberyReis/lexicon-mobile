import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { IRootStackParamList } from '@/presentation/navigation/navigation-types';
import type { IWordDetailsRouteProp } from '@/types/word-details/word-details-route-type';

export const useWordDetailsBuilder = () => {
    const route = useRoute<IWordDetailsRouteProp>();

    const navigation = useNavigation<
        NativeStackNavigationProp<IRootStackParamList>
    >();

    const { word } = route.params;

    const handleGoBack = () => {
        navigation.goBack();
    };

    return {
        word,
        handleGoBack,
    };
};
