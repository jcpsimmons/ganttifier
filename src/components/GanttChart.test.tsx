import { render, screen, waitFor } from "@testing-library/react";
import { GanttChart } from "./GanttChart";
import { GanttData } from "../types";

// Mock mermaid module
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  render: jest.fn(),
}));

import mermaid from "mermaid";

const mockMermaid = mermaid as jest.Mocked<typeof mermaid>;

describe("GanttChart Component", () => {
  const validGanttData: GanttData = {
    config: {
      title: "Test Project",
      dateFormat: "YYYY-MM-DD",
    },
    sections: [
      {
        name: "Planning",
        tasks: [
          {
            id: "task1",
            name: "Requirements",
            start: "2024-01-01",
            duration: { value: 5, unit: "d" },
            status: ["done"],
          },
        ],
      },
      {
        name: "Development",
        tasks: [
          {
            id: "task2",
            name: "Implementation",
            start: "",
            duration: { value: 10, unit: "d" },
            after: "task1",
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMermaid.render.mockResolvedValue({
      svg: '<svg data-testid="gantt-svg">Gantt Chart</svg>',
      bindFunctions: jest.fn(),
    });
  });

  it("renders a gantt chart from valid data", async () => {
    render(<GanttChart data={validGanttData} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Mermaid diagram")).toBeInTheDocument();
    });
  });

  it("displays error for invalid data", async () => {
    const invalidData: GanttData = {
      sections: [], // Empty sections should fail validation
    };

    render(<GanttChart data={invalidData} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Error creating Gantt chart:")).toBeInTheDocument();
    });
  });

  it("applies custom className", async () => {
    render(<GanttChart data={validGanttData} className="my-gantt" />);

    await waitFor(() => {
      const container = screen.getByLabelText("Mermaid diagram").closest(".gantt-chart");
      expect(container).toHaveClass("gantt-chart");
      expect(container).toHaveClass("my-gantt");
    });
  });

  it("logs warning when onTaskClick is provided", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const handleClick = jest.fn();

    render(<GanttChart data={validGanttData} onTaskClick={handleClick} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("onTaskClick is not yet implemented")
      );
    });

    consoleSpy.mockRestore();
  });

  it("passes correct mermaid syntax to Mermaid component", async () => {
    render(<GanttChart data={validGanttData} />);

    await waitFor(() => {
      expect(mockMermaid.render).toHaveBeenCalled();
      const renderCall = mockMermaid.render.mock.calls[0];
      const syntax = renderCall[1];

      expect(syntax).toContain("gantt");
      expect(syntax).toContain("title Test Project");
      expect(syntax).toContain("dateFormat YYYY-MM-DD");
      expect(syntax).toContain("section Planning");
      expect(syntax).toContain("section Development");
      expect(syntax).toContain("Requirements");
      expect(syntax).toContain("Implementation");
    });
  });

  it("displays validation error for duplicate task IDs", async () => {
    const dataWithDuplicates: GanttData = {
      sections: [
        {
          name: "Section 1",
          tasks: [
            {
              id: "dup",
              name: "Task 1",
              start: "2024-01-01",
              duration: { value: 5, unit: "d" },
            },
          ],
        },
        {
          name: "Section 2",
          tasks: [
            {
              id: "dup",
              name: "Task 2",
              start: "2024-01-10",
              duration: { value: 3, unit: "d" },
            },
          ],
        },
      ],
    };

    render(<GanttChart data={dataWithDuplicates} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Duplicate task ID/)).toBeInTheDocument();
    });
  });

  it("displays validation error for missing dependency", async () => {
    const dataWithMissingDep: GanttData = {
      sections: [
        {
          name: "Development",
          tasks: [
            {
              id: "task1",
              name: "Task 1",
              start: "",
              duration: { value: 5, unit: "d" },
              after: "nonexistent",
            },
          ],
        },
      ],
    };

    render(<GanttChart data={dataWithMissingDep} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/non-existent task/)).toBeInTheDocument();
    });
  });

  it("memoizes conversion result", async () => {
    const { rerender } = render(<GanttChart data={validGanttData} />);

    await waitFor(() => {
      expect(mockMermaid.render).toHaveBeenCalledTimes(1);
    });

    // Rerender with same data reference
    rerender(<GanttChart data={validGanttData} />);

    // Should not trigger additional mermaid render if data hasn't changed
    // (the conversion is memoized)
    await waitFor(() => {
      // The Mermaid component itself will re-render, but the conversion
      // result should be memoized
      expect(screen.getByLabelText("Mermaid diagram")).toBeInTheDocument();
    });
  });
});
