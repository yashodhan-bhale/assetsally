import { render } from "@testing-library/react-native";

import LoginScreen from "../app/(auth)/login";

// Mock the context
jest.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

describe("LoginScreen", () => {
  it("renders correctly", () => {
    const { getAllByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getAllByText("Sign In")[0]).toBeTruthy();
    expect(getByPlaceholderText("auditor@demo.com")).toBeTruthy();
  });
});
