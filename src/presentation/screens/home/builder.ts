import { useState } from 'react';

export const useHomeBuilder = () => {
    const [search, setSearch] = useState('');

    return {
        search,
        setSearch,
    };
};