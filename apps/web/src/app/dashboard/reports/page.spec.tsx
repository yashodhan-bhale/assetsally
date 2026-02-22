import { render, screen } from "@testing-library/react";

import ReportsPage from "./page";

describe("ReportsPage", () => {
  it("renders reports engine title", () => {
    render(<ReportsPage />);
    expect(screen.getByText(/Reports Engine/i)).toBeInTheDocument();
  });

  it("renders report parameters section", () => {
    render(<ReportsPage />);
    expect(screen.getByText(/Report Parameters/i)).toBeInTheDocument();
  });

  it("renders executive summary", () => {
    render(<ReportsPage />);
    expect(screen.getByText(/Executive Summary/i)).toBeInTheDocument();
  });

  it("renders data table with zone information", () => {
    render(<ReportsPage />);
    expect(screen.getAllByText(/Amravati Zone/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Karad Zone/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nagpur Zone/i).length).toBeGreaterThan(0);
  });
});
