import {
    render,
    screen,
} from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import lexiconLogo from '../../../../../assets/images/lexicon-logo.png';
import { Header } from '../index';
import { styles } from '../styles';
import { APP_STRINGS } from '@/shared/constants/app-strings';

describe('Header', () => {
    it('should render the application title', async () => {
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.home.title),
        ).toBeTruthy();
    });

    it('should render the application subtitle', async () => {
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.appSubtitle),
        ).toBeTruthy();
    });

    it('should render the application logo', async () => {
        await render(<Header />);
        const logo = screen.getByTestId('header-logo');
        expect(logo.props.source).toEqual(lexiconLogo);
    });

    it('should use contain resize mode for the logo', async () => {
        await render(<Header />);
        const logo = screen.getByTestId('header-logo');
        expect(logo.props.resizeMode).toBe('contain');
    });

    it('should apply the configured logo styles', async () => {
        await render(<Header />);
        const logo = screen.getByTestId('header-logo');
        expect(
            StyleSheet.flatten(logo.props.style),
        ).toEqual(styles.logo);
    });

    it('should render the title and subtitle together', async () => {
        await render(<Header />);
        expect(
            screen.getByText(APP_STRINGS.home.title),
        ).toBeTruthy();
        expect(
            screen.getByText(APP_STRINGS.appSubtitle),
        ).toBeTruthy();
    });
});
