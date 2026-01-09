/**
 * Gantt Chart Type Definitions
 *
 * These types provide a structured way to define Gantt chart data
 * that can be converted to Mermaid.js syntax.
 */

/**
 * Status of a task in the Gantt chart.
 * - done: Task is completed
 * - active: Task is currently in progress
 * - crit: Task is critical/high priority
 * - milestone: Task is a milestone marker (zero duration)
 */
export type TaskStatus = "done" | "active" | "crit" | "milestone";

/**
 * Duration unit for task lengths.
 */
export type DurationUnit = "d" | "w" | "h" | "m";

/**
 * Represents a duration with a numeric value and unit.
 * Examples: { value: 5, unit: 'd' } = 5 days
 */
export interface Duration {
  value: number;
  unit: DurationUnit;
}

/**
 * Represents a single task in the Gantt chart.
 */
export interface GanttTask {
  /** Unique identifier for the task */
  id: string;

  /** Display name of the task */
  name: string;

  /**
   * Start date in ISO format (YYYY-MM-DD) or relative reference.
   * Can be:
   * - An ISO date string: "2024-01-15"
   * - "after" + task ID reference: "after task1" (starts after task1 ends)
   */
  start: string;

  /**
   * Duration of the task.
   * Either a Duration object or end date string.
   */
  duration: Duration | string;

  /** Optional status indicators */
  status?: TaskStatus[];

  /** Optional dependency - task ID that this task depends on */
  after?: string;
}

/**
 * Represents a section/group of related tasks.
 */
export interface GanttSection {
  /** Name of the section */
  name: string;

  /** Tasks within this section */
  tasks: GanttTask[];
}

/**
 * Date format options for Mermaid Gantt charts.
 */
export type DateFormat =
  | "YYYY-MM-DD"
  | "DD-MM-YYYY"
  | "MM-DD-YYYY"
  | "YYYY/MM/DD";

/**
 * Days of the week that can be excluded from the chart.
 */
export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/**
 * Configuration options for the Gantt chart.
 */
export interface GanttConfig {
  /** Title displayed at the top of the chart */
  title?: string;

  /** Date format for parsing and display */
  dateFormat?: DateFormat;

  /** Days to exclude from the chart (e.g., weekends) */
  excludes?: WeekDay[];

  /** Specific dates to exclude (holidays, etc.) in ISO format */
  excludeDates?: string[];

  /** Enable click interactions on tasks */
  enableClick?: boolean;

  /** Display mode: compact reduces vertical spacing */
  displayMode?: "default" | "compact";

  /** Axis format for the timeline */
  axisFormat?: string;

  /** Tick interval for the timeline axis */
  tickInterval?: string;
}

/**
 * Complete Gantt chart data structure.
 * This is the main type used to define a Gantt chart.
 */
export interface GanttData {
  /** Chart configuration */
  config?: GanttConfig;

  /** Sections containing tasks */
  sections: GanttSection[];
}

/**
 * Props for the GanttChart component.
 */
export interface GanttChartProps {
  /** The Gantt chart data */
  data: GanttData;

  /** Optional CSS class name */
  className?: string;

  /** Optional callback when a task is clicked */
  onTaskClick?: (taskId: string) => void;
}

/**
 * Props for the Mermaid renderer component.
 */
export interface MermaidProps {
  /** Mermaid diagram definition string */
  chart: string;

  /** Optional unique ID for the diagram */
  id?: string;

  /** Optional CSS class name */
  className?: string;
}

/**
 * Mermaid initialization configuration.
 */
export interface MermaidConfig {
  /** Start rendering on page load */
  startOnLoad?: boolean;

  /** Color theme */
  theme?: "default" | "forest" | "dark" | "neutral" | "base";

  /**
   * Security level for rendering.
   * - strict: Tags in text are encoded, click functionality disabled
   * - loose: Tags in text are allowed, click functionality enabled
   * - antiscript: HTML tags allowed (except script), click functionality enabled
   * - sandbox: Uses sandboxed iframe for rendering
   */
  securityLevel?: "strict" | "loose" | "antiscript" | "sandbox";

  /** Custom CSS for theming */
  themeCSS?: string;

  /** Font family for text */
  fontFamily?: string;

  /** Log level for debugging */
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}

/**
 * Result of converting GanttData to Mermaid syntax.
 */
export interface ConversionResult {
  /** Whether conversion was successful */
  success: boolean;

  /** The Mermaid syntax string (if successful) */
  syntax?: string;

  /** Error message (if unsuccessful) */
  error?: string;
}
