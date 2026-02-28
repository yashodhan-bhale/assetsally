import { cleanup } from "@testing-library/react-native";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock common React Native modules
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
