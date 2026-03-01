import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { api } from "../../../lib/api";

import ReportsPage from "./page";

// Mock the API
vi.mock("../../../lib/api", () => ({
  api: {
    getInventory: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQuery = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getInventory as any).mockResolvedValue({
      items: [
        {
          id: "1",
          assetNumber: "A001",
          assetName: "Test Asset",
          location: { id: "loc1", locationName: "Amravati Zone" },
          inventoryStatus: "Found OK",
          quantityAsPerBooks: 10,
          quantityAsPerPhysical: 10,
          quantityDifference: 0,
        },
      ],
    });
  });

  it("renders reports engine title", async () => {
    renderWithQuery(<ReportsPage />);
    expect(await screen.findByText(/Reports Engine/i)).toBeInTheDocument();
  });

  it("renders summary cards", async () => {
    renderWithQuery(<ReportsPage />);
    expect(await screen.findByText(/Total Assets/i)).toBeInTheDocument();
    expect(await screen.findByText(/Acquisition Cost/i)).toBeInTheDocument();
  });

  it("renders location breakdown table", async () => {
    renderWithQuery(<ReportsPage />);
    expect(await screen.findByText(/Location Breakdown/i)).toBeInTheDocument();
    expect(await screen.findByText(/Amravati Zone/i)).toBeInTheDocument();
  });

  it("shows found ok and discrepancies counts", async () => {
    renderWithQuery(<ReportsPage />);
    expect(await screen.findByText(/Total Found OK/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total Discrepancies/i)).toBeInTheDocument();
  });
});
