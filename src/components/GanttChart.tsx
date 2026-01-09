import { useMemo } from "react";
import { GanttChartProps } from "../types";
import { convertToMermaidSyntax } from "../utils";
import { Mermaid } from "./Mermaid";

/**
 * GanttChart component for rendering Gantt charts from structured data.
 *
 * This component takes structured GanttData and converts it to Mermaid syntax
 * for rendering. It provides a type-safe way to create Gantt charts without
 * writing raw Mermaid syntax.
 *
 * @example
 * ```tsx
 * const data: GanttData = {
 *   config: {
 *     title: "Project Timeline",
 *     dateFormat: "YYYY-MM-DD",
 *   },
 *   sections: [{
 *     name: "Development",
 *     tasks: [
 *       { id: "task1", name: "Design", start: "2024-01-01", duration: { value: 5, unit: "d" } }
 *     ]
 *   }]
 * };
 *
 * <GanttChart data={data} />
 * ```
 */
export function GanttChart({
  data,
  className = "",
  onTaskClick,
}: GanttChartProps): JSX.Element {
  // Memoize the conversion to avoid unnecessary recalculations
  const conversionResult = useMemo(() => convertToMermaidSyntax(data), [data]);

  if (!conversionResult.success) {
    return (
      <div
        className={`gantt-chart-error ${className}`}
        role="alert"
        aria-live="polite"
      >
        <p>Error creating Gantt chart:</p>
        <pre>{conversionResult.error}</pre>
      </div>
    );
  }

  // Note: onTaskClick would require Mermaid click callbacks which need
  // securityLevel: 'loose'. For now, we log a warning if provided.
  if (onTaskClick) {
    console.warn(
      "GanttChart: onTaskClick is not yet implemented. Task click handlers require additional Mermaid configuration."
    );
  }

  return (
    <div className={`gantt-chart ${className}`}>
      <Mermaid chart={conversionResult.syntax!} />
    </div>
  );
}

export default GanttChart;
