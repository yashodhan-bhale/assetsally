import { render, screen } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import LoginScreen from './login';

// Mock the context
vi.mock('../../contexts/auth-context', () => ({
    useAuth: () => ({
        login: vi.fn(),
    }),
}));

describe('LoginScreen', () => {
    it('renders correctly', () => {
        render(<LoginScreen />);

        expect(screen.getByText('Sign In')).toBeTruthy();
        expect(screen.getByPlaceholderText('auditor@demo.com')).toBeTruthy();
    });
});
