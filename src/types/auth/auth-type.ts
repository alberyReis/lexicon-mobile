export type IAuthUser = {
    uid: string;
    email: string | null;
};

export type IAuthCredentials = {
    email: string;
    password: string;
};

export type IAuthRepository = {
    signIn(credentials: IAuthCredentials): Promise<IAuthUser>;
    signUp(credentials: IAuthCredentials): Promise<IAuthUser>;
    signOut(): Promise<void>;
    getCurrentUser(): IAuthUser | null;
    onAuthStateChanged(callback: (user: IAuthUser | null) => void): () => void;
};