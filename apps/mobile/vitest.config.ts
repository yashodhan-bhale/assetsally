import { defineConfig } from 'vitest/config';
import reactNative from 'vitest-react-native';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        deps: {
            inline: ['react-native', 'expo-router', 'expo-modules-core'],
        },
    },
    plugins: [reactNative()],
});
