import {
  formatDuration,
  formatTaskStatus,
  convertTask,
  convertSection,
  convertConfig,
  validateTask,
  validateSection,
  validateGanttData,
  convertToMermaidSyntax,
  createTask,
  createDependentTask,
  createMilestone,
} from "./ganttConverter";
import { GanttTask, GanttSection, GanttData, GanttConfig } from "../types";

describe("ganttConverter", () => {
  describe("formatDuration", () => {
    it("formats days correctly", () => {
      expect(formatDuration({ value: 5, unit: "d" })).toBe("5d");
    });

    it("formats weeks correctly", () => {
      expect(formatDuration({ value: 2, unit: "w" })).toBe("2w");
    });

    it("formats hours correctly", () => {
      expect(formatDuration({ value: 8, unit: "h" })).toBe("8h");
    });

    it("formats minutes correctly", () => {
      expect(formatDuration({ value: 30, unit: "m" })).toBe("30m");
    });
  });

  describe("formatTaskStatus", () => {
    it("returns empty string for undefined status", () => {
      expect(formatTaskStatus(undefined)).toBe("");
    });

    it("returns empty string for empty array", () => {
      expect(formatTaskStatus([])).toBe("");
    });

    it("formats single status", () => {
      expect(formatTaskStatus(["done"])).toBe("done");
    });

    it("formats multiple statuses", () => {
      expect(formatTaskStatus(["crit", "active"])).toBe("crit, active");
    });
  });

  describe("convertTask", () => {
    it("converts a basic task with duration object", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task One",
        start: "2024-01-01",
        duration: { value: 5, unit: "d" },
      };
      expect(convertTask(task)).toBe("    Task One : task1 : 2024-01-01 : 5d");
    });

    it("converts a task with status", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task One",
        start: "2024-01-01",
        duration: { value: 5, unit: "d" },
        status: ["done"],
      };
      expect(convertTask(task)).toBe(
        "    Task One : done : task1 : 2024-01-01 : 5d"
      );
    });

    it("converts a task with multiple statuses", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task One",
        start: "2024-01-01",
        duration: { value: 5, unit: "d" },
        status: ["crit", "active"],
      };
      expect(convertTask(task)).toBe(
        "    Task One : crit, active : task1 : 2024-01-01 : 5d"
      );
    });

    it("converts a task with dependency (after)", () => {
      const task: GanttTask = {
        id: "task2",
        name: "Task Two",
        start: "",
        duration: { value: 3, unit: "d" },
        after: "task1",
      };
      expect(convertTask(task)).toBe(
        "    Task Two : task2 : after task1 : 3d"
      );
    });

    it("converts a task with string duration", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task One",
        start: "2024-01-01",
        duration: "5d",
      };
      expect(convertTask(task)).toBe("    Task One : task1 : 2024-01-01 : 5d");
    });

    it("converts a task with end date as duration", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task One",
        start: "2024-01-01",
        duration: "2024-01-10",
      };
      expect(convertTask(task)).toBe(
        "    Task One : task1 : 2024-01-01 : 2024-01-10"
      );
    });
  });

  describe("convertSection", () => {
    it("converts a section with tasks", () => {
      const section: GanttSection = {
        name: "Development",
        tasks: [
          {
            id: "task1",
            name: "Task One",
            start: "2024-01-01",
            duration: { value: 5, unit: "d" },
          },
          {
            id: "task2",
            name: "Task Two",
            start: "",
            duration: { value: 3, unit: "d" },
            after: "task1",
          },
        ],
      };
      const lines = convertSection(section);
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe("    section Development");
      expect(lines[1]).toBe("    Task One : task1 : 2024-01-01 : 5d");
      expect(lines[2]).toBe("    Task Two : task2 : after task1 : 3d");
    });
  });

  describe("convertConfig", () => {
    it("converts title", () => {
      const config: GanttConfig = { title: "My Project" };
      expect(convertConfig(config)).toContain("    title My Project");
    });

    it("converts dateFormat", () => {
      const config: GanttConfig = { dateFormat: "YYYY-MM-DD" };
      expect(convertConfig(config)).toContain("    dateFormat YYYY-MM-DD");
    });

    it("converts excludes", () => {
      const config: GanttConfig = { excludes: ["saturday", "sunday"] };
      expect(convertConfig(config)).toContain("    excludes saturday, sunday");
    });

    it("converts axisFormat", () => {
      const config: GanttConfig = { axisFormat: "%Y-%m-%d" };
      expect(convertConfig(config)).toContain("    axisFormat %Y-%m-%d");
    });

    it("converts tickInterval", () => {
      const config: GanttConfig = { tickInterval: "1week" };
      expect(convertConfig(config)).toContain("    tickInterval 1week");
    });

    it("returns empty array for empty config", () => {
      expect(convertConfig({})).toHaveLength(0);
    });

    it("combines multiple config options", () => {
      const config: GanttConfig = {
        title: "Project",
        dateFormat: "YYYY-MM-DD",
        excludes: ["sunday"],
      };
      const lines = convertConfig(config);
      expect(lines).toHaveLength(3);
    });
  });

  describe("validateTask", () => {
    it("returns null for valid task", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task",
        start: "2024-01-01",
        duration: { value: 5, unit: "d" },
      };
      expect(validateTask(task, "Test")).toBeNull();
    });

    it("returns error for missing id", () => {
      const task = {
        id: "",
        name: "Task",
        start: "2024-01-01",
        duration: { value: 5, unit: "d" },
      } as GanttTask;
      expect(validateTask(task, "Test")).toContain("missing an ID");
    });

    it("returns error for missing name", () => {
      const task = {
        id: "task1",
        name: "",
        start: "2024-01-01",
        duration: { value: 5, unit: "d" },
      } as GanttTask;
      expect(validateTask(task, "Test")).toContain("missing a name");
    });

    it("returns error for missing start without dependency", () => {
      const task = {
        id: "task1",
        name: "Task",
        start: "",
        duration: { value: 5, unit: "d" },
      } as GanttTask;
      expect(validateTask(task, "Test")).toContain("missing a start date");
    });

    it("accepts task with after instead of start", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task",
        start: "",
        duration: { value: 5, unit: "d" },
        after: "task0",
      };
      expect(validateTask(task, "Test")).toBeNull();
    });

    it("returns error for invalid duration string", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task",
        start: "2024-01-01",
        duration: "invalid",
      };
      expect(validateTask(task, "Test")).toContain("invalid duration format");
    });

    it("returns error for invalid duration value", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Task",
        start: "2024-01-01",
        duration: { value: -5, unit: "d" },
      };
      expect(validateTask(task, "Test")).toContain("invalid duration value");
    });

    it("accepts zero duration for milestones", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Milestone",
        start: "2024-01-01",
        duration: { value: 0, unit: "d" },
        status: ["milestone"],
      };
      // Milestones are allowed to have zero duration
      expect(validateTask(task, "Test")).toBeNull();
    });

    it("rejects zero duration for non-milestone tasks", () => {
      const task: GanttTask = {
        id: "task1",
        name: "Regular Task",
        start: "2024-01-01",
        duration: { value: 0, unit: "d" },
      };
      expect(validateTask(task, "Test")).toContain("invalid duration value");
    });
  });

  describe("validateSection", () => {
    it("returns null for valid section", () => {
      const section: GanttSection = {
        name: "Development",
        tasks: [
          {
            id: "task1",
            name: "Task",
            start: "2024-01-01",
            duration: { value: 5, unit: "d" },
          },
        ],
      };
      expect(validateSection(section)).toBeNull();
    });

    it("returns error for missing name", () => {
      const section = {
        name: "",
        tasks: [
          {
            id: "task1",
            name: "Task",
            start: "2024-01-01",
            duration: { value: 5, unit: "d" },
          },
        ],
      } as GanttSection;
      expect(validateSection(section)).toContain("missing a name");
    });

    it("returns error for empty tasks", () => {
      const section: GanttSection = {
        name: "Empty",
        tasks: [],
      };
      expect(validateSection(section)).toContain("has no tasks");
    });

    it("returns task validation error", () => {
      const section: GanttSection = {
        name: "Development",
        tasks: [
          {
            id: "",
            name: "Task",
            start: "2024-01-01",
            duration: { value: 5, unit: "d" },
          },
        ],
      };
      expect(validateSection(section)).toContain("missing an ID");
    });
  });

  describe("validateGanttData", () => {
    it("returns null for valid data", () => {
      const data: GanttData = {
        sections: [
          {
            name: "Development",
            tasks: [
              {
                id: "task1",
                name: "Task",
                start: "2024-01-01",
                duration: { value: 5, unit: "d" },
              },
            ],
          },
        ],
      };
      expect(validateGanttData(data)).toBeNull();
    });

    it("returns error for null data", () => {
      expect(validateGanttData(null as unknown as GanttData)).toContain(
        "required"
      );
    });

    it("returns error for empty sections", () => {
      const data: GanttData = { sections: [] };
      expect(validateGanttData(data)).toContain("at least one section");
    });

    it("returns error for duplicate task IDs", () => {
      const data: GanttData = {
        sections: [
          {
            name: "Section 1",
            tasks: [
              {
                id: "task1",
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
                id: "task1",
                name: "Task 2",
                start: "2024-01-05",
                duration: { value: 3, unit: "d" },
              },
            ],
          },
        ],
      };
      expect(validateGanttData(data)).toContain("Duplicate task ID");
    });

    it("returns error for invalid dependency", () => {
      const data: GanttData = {
        sections: [
          {
            name: "Development",
            tasks: [
              {
                id: "task1",
                name: "Task",
                start: "",
                duration: { value: 5, unit: "d" },
                after: "nonexistent",
              },
            ],
          },
        ],
      };
      expect(validateGanttData(data)).toContain("non-existent task");
    });
  });

  describe("convertToMermaidSyntax", () => {
    it("converts simple gantt data", () => {
      const data: GanttData = {
        sections: [
          {
            name: "Development",
            tasks: [
              {
                id: "task1",
                name: "Task One",
                start: "2024-01-01",
                duration: { value: 5, unit: "d" },
              },
            ],
          },
        ],
      };
      const result = convertToMermaidSyntax(data);
      expect(result.success).toBe(true);
      expect(result.syntax).toContain("gantt");
      expect(result.syntax).toContain("section Development");
      expect(result.syntax).toContain("Task One");
    });

    it("includes config options", () => {
      const data: GanttData = {
        config: {
          title: "My Project",
          dateFormat: "YYYY-MM-DD",
        },
        sections: [
          {
            name: "Development",
            tasks: [
              {
                id: "task1",
                name: "Task",
                start: "2024-01-01",
                duration: { value: 5, unit: "d" },
              },
            ],
          },
        ],
      };
      const result = convertToMermaidSyntax(data);
      expect(result.success).toBe(true);
      expect(result.syntax).toContain("title My Project");
      expect(result.syntax).toContain("dateFormat YYYY-MM-DD");
    });

    it("returns error for invalid data", () => {
      const data: GanttData = { sections: [] };
      const result = convertToMermaidSyntax(data);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("converts multiple sections", () => {
      const data: GanttData = {
        sections: [
          {
            name: "Planning",
            tasks: [
              {
                id: "plan",
                name: "Planning",
                start: "2024-01-01",
                duration: { value: 5, unit: "d" },
              },
            ],
          },
          {
            name: "Development",
            tasks: [
              {
                id: "dev",
                name: "Development",
                start: "",
                duration: { value: 10, unit: "d" },
                after: "plan",
              },
            ],
          },
        ],
      };
      const result = convertToMermaidSyntax(data);
      expect(result.success).toBe(true);
      expect(result.syntax).toContain("section Planning");
      expect(result.syntax).toContain("section Development");
    });
  });

  describe("helper functions", () => {
    describe("createTask", () => {
      it("creates a basic task", () => {
        const task = createTask("task1", "My Task", "2024-01-01", 5);
        expect(task.id).toBe("task1");
        expect(task.name).toBe("My Task");
        expect(task.start).toBe("2024-01-01");
        expect(task.duration).toEqual({ value: 5, unit: "d" });
        expect(task.status).toBeUndefined();
      });

      it("creates a task with custom unit", () => {
        const task = createTask("task1", "My Task", "2024-01-01", 2, "w");
        expect(task.duration).toEqual({ value: 2, unit: "w" });
      });

      it("creates a task with status", () => {
        const task = createTask("task1", "My Task", "2024-01-01", 5, "d", [
          "done",
        ]);
        expect(task.status).toEqual(["done"]);
      });
    });

    describe("createDependentTask", () => {
      it("creates a dependent task", () => {
        const task = createDependentTask("task2", "Dependent", "task1", 3);
        expect(task.id).toBe("task2");
        expect(task.name).toBe("Dependent");
        expect(task.after).toBe("task1");
        expect(task.start).toBe("");
        expect(task.duration).toEqual({ value: 3, unit: "d" });
      });

      it("creates a dependent task with status", () => {
        const task = createDependentTask("task2", "Dependent", "task1", 3, "d", [
          "crit",
        ]);
        expect(task.status).toEqual(["crit"]);
      });
    });

    describe("createMilestone", () => {
      it("creates a milestone", () => {
        const milestone = createMilestone("m1", "Release", "task1");
        expect(milestone.id).toBe("m1");
        expect(milestone.name).toBe("Release");
        expect(milestone.after).toBe("task1");
        expect(milestone.duration).toEqual({ value: 0, unit: "d" });
        expect(milestone.status).toEqual(["milestone"]);
      });
    });
  });
});
