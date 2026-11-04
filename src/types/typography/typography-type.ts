import type { TextStyle } from 'react-native';

export type ITypographyVariant =
    | 'heading'
    | 'title'
    | 'subtitle'
    | 'body'
    | 'caption'
    | 'label';

export type ITypographyProps = {
    children: React.ReactNode;
    variant?: ITypographyVariant;
    style?: TextStyle;
};
