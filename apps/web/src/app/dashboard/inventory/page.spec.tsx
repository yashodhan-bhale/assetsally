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

describe("InventoryPage Formatting", () => {
  it("formats dates as MM/DD/YYYY with mono font", async () => {
    const mockData = [
      {
        id: "1",
        assetNumber: "AST001",
        assetName: "Test Asset",
        location: { locationName: "Loc 1", locationCode: "LC1" },
        capitalizationDate: "2024-01-05T00:00:00.000Z",
      },
    ];
    (api.getInventory as any).mockResolvedValue({ items: mockData });

    render(<InventoryPage />);

    const dateCell = await screen.findByText("01/05/2024");
    expect(dateCell).toBeDefined();
    expect(dateCell.className).toContain("font-mono");
  });

  it("formats currency without symbols and right-aligned", async () => {
    const mockData = [
      {
        id: "1",
        assetNumber: "AST001",
        assetName: "Test Asset",
        location: { locationName: "Loc 1", locationCode: "LC1" },
        acquisitionCost: 1250000,
      },
    ];
    (api.getInventory as any).mockResolvedValue({ items: mockData });

    render(<InventoryPage />);

    // In India, 12,50,000
    const costCell = await screen.findByText("12,50,000");
    expect(costCell).toBeDefined();
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
        acquisitionCost: null,
        capitalizationDate: null,
      },
    ];
    (api.getInventory as any).mockResolvedValue({ items: mockData });

    render(<InventoryPage />);

    const placeholders = await screen.findAllByText("-");
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
