export type IMainTabParamList = {
    Home: undefined;
    Favorites: undefined;
    History: undefined;
};

export type IRootStackParamList = {
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    WordDetails: {
        word: string;
    };
};