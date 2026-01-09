import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock mermaid module
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({
    svg: '<svg data-testid="gantt-svg">Gantt Chart</svg>',
    bindFunctions: jest.fn(),
  }),
}));

describe("App Component", () => {
  it("renders the application header", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /ganttifier/i })).toBeInTheDocument();
    expect(
      screen.getByText(/create beautiful gantt charts with structured data/i)
    ).toBeInTheDocument();
  });

  it("renders a GanttChart component", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText("Mermaid diagram")).toBeInTheDocument();
    });
  });

  it("has correct structure with header and main sections", () => {
    render(<App />);

    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("applies App class to root element", () => {
    const { container } = render(<App />);

    expect(container.querySelector(".App")).toBeInTheDocument();
  });

  it("renders example chart with correct class", async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector(".example-chart")).toBeInTheDocument();
    });
  });
});
