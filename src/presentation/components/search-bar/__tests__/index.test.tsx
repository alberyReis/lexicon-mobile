import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react-native';
import { SearchBar } from '../index';
import { APP_STRINGS } from '@/shared/constants/app-strings';
import { COLORS } from '@/shared/constants/colors';

jest.mock('lucide-react-native', () => ({
    Search: 'Search',
}));

describe('SearchBar', () => {
    const onChangeTextMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the search input', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        expect(
            screen.getByPlaceholderText(
                APP_STRINGS.home.searchPlaceholder,
            ),
        ).toBeTruthy();
    });

    it('should display the provided value', async () => {
        await render(
            <SearchBar
                value="apple"
                onChangeText={onChangeTextMock}
            />,
        );
        expect(screen.getByDisplayValue('apple')).toBeTruthy();
    });

    it('should call onChangeText when typing', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        fireEvent.changeText(
            screen.getByPlaceholderText(
                APP_STRINGS.home.searchPlaceholder,
            ),
            'banana',
        );
        expect(onChangeTextMock).toHaveBeenCalledWith('banana');
        expect(onChangeTextMock).toHaveBeenCalledTimes(1);
    });

    it('should render an empty value', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        const input = screen.getByPlaceholderText(
            APP_STRINGS.home.searchPlaceholder,
        );
        expect(input.props.value).toBe('');
    });

    it('should disable auto capitalization', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        const input = screen.getByPlaceholderText(
            APP_STRINGS.home.searchPlaceholder,
        );
        expect(input.props.autoCapitalize).toBe('none');
    });

    it('should disable auto correction', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        const input = screen.getByPlaceholderText(
            APP_STRINGS.home.searchPlaceholder,
        );
        expect(input.props.autoCorrect).toBe(false);
    });

    it('should use the search return key', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        const input = screen.getByPlaceholderText(
            APP_STRINGS.home.searchPlaceholder,
        );
        expect(input.props.returnKeyType).toBe('search');
    });

    it('should use the secondary color for placeholder', async () => {
        await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        const input = screen.getByPlaceholderText(
            APP_STRINGS.home.searchPlaceholder,
        );
        expect(input.props.placeholderTextColor).toBe(
            COLORS.secondary,
        );
    });

    it('should update the displayed value when props change', async () => {
        const { rerender } = await render(
            <SearchBar
                value=""
                onChangeText={onChangeTextMock}
            />,
        );
        await rerender(
            <SearchBar
                value="orange"
                onChangeText={onChangeTextMock}
            />,
        );
        expect(screen.getByDisplayValue('orange')).toBeTruthy();
    });
});
