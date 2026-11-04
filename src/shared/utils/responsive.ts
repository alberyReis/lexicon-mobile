import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const widthPixel = (size: number): number => {
    return (width / BASE_WIDTH) * size;
};

export const heightPixel = (size: number): number => {
    return (height / BASE_HEIGHT) * size;
};