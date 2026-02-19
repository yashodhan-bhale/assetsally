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
    expect(
      screen.getByPlaceholderText(/admin@assetsally.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Login as Admin/i }),
    ).toBeInTheDocument();
  });

  it("shows branding", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /AssetsAlly/i,
    );
  });
});
