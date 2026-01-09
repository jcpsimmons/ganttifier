import {
  GanttData,
  GanttTask,
  GanttSection,
  GanttConfig,
  Duration,
  ConversionResult,
} from "../types";

/**
 * Formats a Duration object to Mermaid duration string.
 * @param duration - Duration object with value and unit
 * @returns Formatted duration string (e.g., "5d", "2w")
 */
export function formatDuration(duration: Duration): string {
  return `${duration.value}${duration.unit}`;
}

/**
 * Determines if a string is a Duration-like string (e.g., "5d", "2w").
 */
function isDurationString(value: string): boolean {
  return /^\d+[dwmh]$/.test(value);
}

/**
 * Formats task status indicators for Mermaid syntax.
 * @param status - Array of status indicators
 * @returns Formatted status string
 */
export function formatTaskStatus(status?: GanttTask["status"]): string {
  if (!status || status.length === 0) {
    return "";
  }
  return status.join(", ");
}

/**
 * Converts a single GanttTask to Mermaid syntax.
 * @param task - The task to convert
 * @returns Mermaid task line
 */
export function convertTask(task: GanttTask): string {
  const parts: string[] = [];

  // Task name
  parts.push(task.name);

  // Status indicators (if any)
  const statusStr = formatTaskStatus(task.status);
  if (statusStr) {
    parts.push(statusStr);
  }

  // Task ID
  parts.push(task.id);

  // Start reference (either date or "after taskId")
  if (task.after) {
    parts.push(`after ${task.after}`);
  } else {
    parts.push(task.start);
  }

  // Duration
  if (typeof task.duration === "object") {
    parts.push(formatDuration(task.duration));
  } else if (isDurationString(task.duration)) {
    parts.push(task.duration);
  } else {
    // It's an end date
    parts.push(task.duration);
  }

  return `    ${parts.join(" : ")}`;
}

/**
 * Converts a GanttSection to Mermaid syntax lines.
 * @param section - The section to convert
 * @returns Array of Mermaid syntax lines
 */
export function convertSection(section: GanttSection): string[] {
  const lines: string[] = [];
  lines.push(`    section ${section.name}`);
  section.tasks.forEach((task) => {
    lines.push(convertTask(task));
  });
  return lines;
}

/**
 * Converts GanttConfig to Mermaid directive lines.
 * @param config - The configuration object
 * @returns Array of Mermaid directive lines
 */
export function convertConfig(config: GanttConfig): string[] {
  const lines: string[] = [];

  if (config.title) {
    lines.push(`    title ${config.title}`);
  }

  if (config.dateFormat) {
    lines.push(`    dateFormat ${config.dateFormat}`);
  }

  if (config.axisFormat) {
    lines.push(`    axisFormat ${config.axisFormat}`);
  }

  if (config.tickInterval) {
    lines.push(`    tickInterval ${config.tickInterval}`);
  }

  if (config.excludes && config.excludes.length > 0) {
    lines.push(`    excludes ${config.excludes.join(", ")}`);
  }

  return lines;
}

/**
 * Validates a GanttTask for required fields and consistency.
 * @param task - The task to validate
 * @param sectionName - Name of the containing section (for error messages)
 * @returns Error message if invalid, null if valid
 */
export function validateTask(
  task: GanttTask,
  sectionName: string
): string | null {
  if (!task.id || task.id.trim() === "") {
    return `Task in section "${sectionName}" is missing an ID`;
  }

  if (!task.name || task.name.trim() === "") {
    return `Task "${task.id}" in section "${sectionName}" is missing a name`;
  }

  if (!task.after && (!task.start || task.start.trim() === "")) {
    return `Task "${task.id}" in section "${sectionName}" is missing a start date or dependency`;
  }

  if (!task.duration) {
    return `Task "${task.id}" in section "${sectionName}" is missing a duration`;
  }

  // Validate duration format if it's a string
  if (
    typeof task.duration === "string" &&
    !isDurationString(task.duration) &&
    !/^\d{4}-\d{2}-\d{2}$/.test(task.duration)
  ) {
    return `Task "${task.id}" has invalid duration format: "${task.duration}"`;
  }

  // Validate duration object
  if (typeof task.duration === "object") {
    // Milestones can have zero duration, regular tasks must have positive duration
    const isMilestone = task.status?.includes("milestone");
    if (task.duration.value < 0 || (!isMilestone && task.duration.value === 0)) {
      return `Task "${task.id}" has invalid duration value: ${task.duration.value}`;
    }
    if (!["d", "w", "h", "m"].includes(task.duration.unit)) {
      return `Task "${task.id}" has invalid duration unit: ${task.duration.unit}`;
    }
  }

  return null;
}

/**
 * Validates a GanttSection for required fields.
 * @param section - The section to validate
 * @returns Error message if invalid, null if valid
 */
export function validateSection(section: GanttSection): string | null {
  if (!section.name || section.name.trim() === "") {
    return "Section is missing a name";
  }

  if (!section.tasks || section.tasks.length === 0) {
    return `Section "${section.name}" has no tasks`;
  }

  for (const task of section.tasks) {
    const taskError = validateTask(task, section.name);
    if (taskError) {
      return taskError;
    }
  }

  return null;
}

/**
 * Validates complete GanttData structure.
 * @param data - The Gantt data to validate
 * @returns Error message if invalid, null if valid
 */
export function validateGanttData(data: GanttData): string | null {
  if (!data) {
    return "Gantt data is required";
  }

  if (!data.sections || data.sections.length === 0) {
    return "Gantt data must have at least one section";
  }

  // Check for duplicate task IDs
  const taskIds = new Set<string>();
  for (const section of data.sections) {
    const sectionError = validateSection(section);
    if (sectionError) {
      return sectionError;
    }

    for (const task of section.tasks) {
      if (taskIds.has(task.id)) {
        return `Duplicate task ID found: "${task.id}"`;
      }
      taskIds.add(task.id);
    }
  }

  // Validate task dependencies exist
  for (const section of data.sections) {
    for (const task of section.tasks) {
      if (task.after && !taskIds.has(task.after)) {
        return `Task "${task.id}" depends on non-existent task: "${task.after}"`;
      }
    }
  }

  return null;
}

/**
 * Converts GanttData to Mermaid Gantt chart syntax.
 * @param data - The Gantt data to convert
 * @returns ConversionResult with syntax or error
 */
export function convertToMermaidSyntax(data: GanttData): ConversionResult {
  // Validate input
  const validationError = validateGanttData(data);
  if (validationError) {
    return {
      success: false,
      error: validationError,
    };
  }

  const lines: string[] = ["gantt"];

  // Add configuration
  if (data.config) {
    lines.push(...convertConfig(data.config));
  }

  // Add sections
  for (const section of data.sections) {
    lines.push(...convertSection(section));
  }

  return {
    success: true,
    syntax: lines.join("\n"),
  };
}

/**
 * Creates a simple task with minimal required fields.
 * Utility function for easier task creation.
 */
export function createTask(
  id: string,
  name: string,
  start: string,
  durationValue: number,
  durationUnit: Duration["unit"] = "d",
  status?: GanttTask["status"]
): GanttTask {
  return {
    id,
    name,
    start,
    duration: { value: durationValue, unit: durationUnit },
    status,
  };
}

/**
 * Creates a task that depends on another task.
 */
export function createDependentTask(
  id: string,
  name: string,
  afterTaskId: string,
  durationValue: number,
  durationUnit: Duration["unit"] = "d",
  status?: GanttTask["status"]
): GanttTask {
  return {
    id,
    name,
    start: "",
    duration: { value: durationValue, unit: durationUnit },
    after: afterTaskId,
    status,
  };
}

/**
 * Creates a milestone task (zero duration marker).
 */
export function createMilestone(
  id: string,
  name: string,
  afterTaskId: string
): GanttTask {
  return {
    id,
    name,
    start: "",
    duration: { value: 0, unit: "d" },
    after: afterTaskId,
    status: ["milestone"],
  };
}
