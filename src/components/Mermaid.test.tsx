import { render, screen, waitFor } from "@testing-library/react";
import { Mermaid } from "./Mermaid";

// Mock mermaid module
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  render: jest.fn(),
}));

import mermaid from "mermaid";

const mockMermaid = mermaid as jest.Mocked<typeof mermaid>;

describe("Mermaid Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders successfully with valid chart", async () => {
    mockMermaid.render.mockResolvedValue({
      svg: '<svg data-testid="mermaid-svg">Test SVG</svg>',
      bindFunctions: jest.fn(),
    });

    render(<Mermaid chart="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(screen.getByLabelText("Mermaid diagram")).toBeInTheDocument();
    });
  });

  it("displays error message when rendering fails", async () => {
    mockMermaid.render.mockRejectedValue(new Error("Parse error"));

    render(<Mermaid chart="invalid syntax" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Error rendering diagram:")).toBeInTheDocument();
      expect(screen.getByText("Parse error")).toBeInTheDocument();
    });
  });

  it("applies custom className", async () => {
    mockMermaid.render.mockResolvedValue({
      svg: "<svg>Test</svg>",
      bindFunctions: jest.fn(),
    });

    render(<Mermaid chart="graph TD; A-->B;" className="custom-class" />);

    await waitFor(() => {
      const container = screen.getByLabelText("Mermaid diagram");
      expect(container).toHaveClass("mermaid");
      expect(container).toHaveClass("custom-class");
    });
  });

  it("uses provided id for rendering", async () => {
    mockMermaid.render.mockResolvedValue({
      svg: "<svg>Test</svg>",
      bindFunctions: jest.fn(),
    });

    render(<Mermaid chart="graph TD; A-->B;" id="my-chart" />);

    await waitFor(() => {
      expect(mockMermaid.render).toHaveBeenCalledWith(
        "my-chart",
        "graph TD; A-->B;"
      );
    });
  });

  it("re-renders when chart prop changes", async () => {
    mockMermaid.render.mockResolvedValue({
      svg: "<svg>Initial</svg>",
      bindFunctions: jest.fn(),
    });

    const { rerender } = render(<Mermaid chart="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(mockMermaid.render).toHaveBeenCalledTimes(1);
    });

    mockMermaid.render.mockResolvedValue({
      svg: "<svg>Updated</svg>",
      bindFunctions: jest.fn(),
    });

    rerender(<Mermaid chart="graph TD; X-->Y;" />);

    await waitFor(() => {
      expect(mockMermaid.render).toHaveBeenCalledTimes(2);
    });
  });

  it("handles non-Error exceptions", async () => {
    mockMermaid.render.mockRejectedValue("String error");

    render(<Mermaid chart="invalid" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Failed to render diagram")).toBeInTheDocument();
    });
  });

  it("calls mermaid.render with chart content", async () => {
    mockMermaid.render.mockResolvedValue({
      svg: "<svg>Test</svg>",
      bindFunctions: jest.fn(),
    });

    render(<Mermaid chart="graph LR; Start-->End;" />);

    await waitFor(() => {
      expect(mockMermaid.render).toHaveBeenCalledWith(
        expect.any(String),
        "graph LR; Start-->End;"
      );
    });
  });

  it("renders empty div while loading", () => {
    // Don't resolve the promise immediately
    mockMermaid.render.mockReturnValue(new Promise(() => {}));

    render(<Mermaid chart="graph TD; A-->B;" />);

    const container = screen.getByLabelText("Mermaid diagram");
    expect(container).toBeEmptyDOMElement();
  });
});
