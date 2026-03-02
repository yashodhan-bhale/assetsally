import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import { api } from "../../../lib/api";

import InventoryPage from "./page";

vi.mock("../../../lib/api", () => ({
  api: {
    getInventory: vi.fn(),
    getLocation: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn().mockReturnValue(null),
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock("../../../contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    user: { appType: "ADMIN" },
  })),
}));

describe("InventoryPage Formatting", () => {
  it("formats dates as MM/DD/YYYY with mono font", async () => {
    const mockData = [
      {
        id: "1",
        assetNumber: "AST001",
        assetName: "Test Asset",
        location: { locationName: "Loc 1", locationCode: "LC1" },
        department: { name: "Dept 1", code: "D1" },
        category: { name: "Cat 1", code: "C1" },
        capitalizationDate: "2024-01-05T00:00:00.000Z",
      },
    ];
    (api.getInventory as any).mockResolvedValue({ items: mockData });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>,
    );

    const dateCell = await screen.findByTestId("inventory-date");
    expect(dateCell).toBeDefined();
    expect(dateCell.textContent).toBe("01/05/2024");
    expect(dateCell.className).toContain("font-mono");
  });

  it("formats currency without symbols and right-aligned", async () => {
    const mockData = [
      {
        id: "1",
        assetNumber: "AST001",
        assetName: "Test Asset",
        location: { locationName: "Loc 1", locationCode: "LC1" },
        department: { name: "Dept 1", code: "D1" },
        category: { name: "Cat 1", code: "C1" },
        acquisitionCost: 1250000,
      },
    ];
    (api.getInventory as any).mockResolvedValue({ items: mockData });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>,
    );

    // In India, 12,50,000. Use findAllByTestId because multiple columns use formatCurrency.
    const costCells = await screen.findAllByTestId("inventory-currency");
    const costCell = costCells[0];
    expect(costCell).toBeDefined();
    expect(costCell.textContent).toBe("12,50,000");
    // The formatCurrency function wraps the number in <div className="text-right font-mono">
    expect(costCell.className).toContain("text-right");
    expect(costCell.className).toContain("font-mono");
  });

  it("handles null values with placeholders", async () => {
    const mockData = [
      {
        id: "1",
        assetNumber: "AST001",
        assetName: "Test Asset",
        location: { locationName: "Loc 1", locationCode: "LC1" },
        department: { name: "Dept 1", code: "D1" },
        category: { name: "Cat 1", code: "C1" },
        acquisitionCost: null,
        capitalizationDate: null,
      },
    ];
    (api.getInventory as any).mockResolvedValue({ items: mockData });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <InventoryPage />
      </QueryClientProvider>,
    );

    const placeholders = await screen.findAllByText("-");
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
