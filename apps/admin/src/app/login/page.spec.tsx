import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

// Mock the hooks
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('../../contexts/auth-context', () => ({
    useAuth: () => ({
        login: vi.fn(),
    }),
}));

describe('LoginPage', () => {
    it('renders login form correctly', () => {
        render(<LoginPage />);

        expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/admin@assetsally.com/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('shows branding', () => {
        render(<LoginPage />);
        expect(screen.getByText(/Assets/i)).toBeInTheDocument();
        expect(screen.getByText(/Ally/i)).toBeInTheDocument();
    });
});
