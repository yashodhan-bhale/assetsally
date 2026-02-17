import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';
import { afterEach, vi } from 'vitest';

// Automatically cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock common React Native modules
vi.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
vi.mock('expo-router', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
    }),
    useLocalSearchParams: () => ({}),
    Stack: ({ children }: any) => children,
    Tabs: ({ children }: any) => children,
}));

vi.mock('expo-secure-store', () => ({
    setItemAsync: vi.fn(),
    getItemAsync: vi.fn(),
    deleteItemAsync: vi.fn(),
}));
