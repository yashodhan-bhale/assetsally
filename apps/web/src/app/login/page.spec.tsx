import { render, screen } from "@testing-library/react";

import LoginPage from "./page";

// Mock the hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("../../contexts/auth-context", () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  it("renders login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText(/Welcome back, Admin/i)).toBeInTheDocument();
    expect(screen.getByTestId("login-email")).toBeInTheDocument();
    expect(screen.getByTestId("login-password")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit")).toBeInTheDocument();
  });

  it("shows branding", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("app-logo")).toHaveTextContent(/AssetsAlly/i);
  });
});
