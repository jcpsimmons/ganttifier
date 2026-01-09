# Ganttifier

A React application for creating and visualizing Gantt charts using structured data and Mermaid.js.

## Features

- **Type-safe Gantt chart creation** - Define charts using TypeScript interfaces
- **Automatic Mermaid syntax generation** - Convert structured data to Mermaid diagram syntax
- **Validation** - Built-in validation for task dependencies, duplicate IDs, and required fields
- **React components** - Ready-to-use `GanttChart` and `Mermaid` components
- **Customizable** - Support for task statuses, dependencies, sections, and more

## Installation

```bash
npm install
```

## Usage

### Quick Start

```tsx
import { GanttChart } from './components';
import { GanttData } from './types';

const projectData: GanttData = {
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
          name: "Implementation",
          start: "2024-01-01",
          duration: { value: 10, unit: "d" },
        },
      ],
    },
  ],
};

function App() {
  return <GanttChart data={projectData} />;
}
```

### Task Dependencies

Tasks can depend on other tasks using the `after` property:

```tsx
const data: GanttData = {
  sections: [
    {
      name: "Project",
      tasks: [
        {
          id: "planning",
          name: "Planning",
          start: "2024-01-01",
          duration: { value: 5, unit: "d" },
        },
        {
          id: "development",
          name: "Development",
          start: "",
          duration: { value: 14, unit: "d" },
          after: "planning", // Starts after planning completes
        },
      ],
    },
  ],
};
```

### Task Statuses

Tasks support multiple status indicators:

- `done` - Task is completed
- `active` - Task is in progress
- `crit` - Task is critical/high priority
- `milestone` - Task is a milestone marker

```tsx
{
  id: "task1",
  name: "Critical Task",
  start: "2024-01-01",
  duration: { value: 5, unit: "d" },
  status: ["crit", "active"],
}
```

### Duration Units

Supported duration units:
- `d` - days
- `w` - weeks
- `h` - hours
- `m` - minutes

```tsx
// 5 days
duration: { value: 5, unit: "d" }

// 2 weeks
duration: { value: 2, unit: "w" }
```

### Configuration Options

```tsx
const config: GanttConfig = {
  title: "Project Timeline",
  dateFormat: "YYYY-MM-DD",
  excludes: ["saturday", "sunday"], // Skip weekends
  axisFormat: "%Y-%m-%d",
  tickInterval: "1week",
};
```

## API Reference

### Types

#### `GanttData`

Main data structure for defining a Gantt chart.

```typescript
interface GanttData {
  config?: GanttConfig;
  sections: GanttSection[];
}
```

#### `GanttSection`

A group of related tasks.

```typescript
interface GanttSection {
  name: string;
  tasks: GanttTask[];
}
```

#### `GanttTask`

A single task in the chart.

```typescript
interface GanttTask {
  id: string;
  name: string;
  start: string;
  duration: Duration | string;
  status?: TaskStatus[];
  after?: string;
}
```

### Components

#### `<GanttChart />`

Renders a Gantt chart from structured data.

```tsx
<GanttChart
  data={ganttData}
  className="my-chart"
  onTaskClick={(taskId) => console.log(taskId)}
/>
```

#### `<Mermaid />`

Low-level component for rendering any Mermaid diagram.

```tsx
<Mermaid chart="graph TD; A-->B;" />
```

### Utility Functions

#### `convertToMermaidSyntax(data: GanttData): ConversionResult`

Converts GanttData to Mermaid syntax string.

#### `createTask(id, name, start, durationValue, durationUnit?, status?): GanttTask`

Helper function to create a basic task.

#### `createDependentTask(id, name, afterTaskId, durationValue, durationUnit?, status?): GanttTask`

Helper function to create a task that depends on another.

#### `createMilestone(id, name, afterTaskId): GanttTask`

Helper function to create a milestone.

## Development

### Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:ci

# Type check
npm run lint

# Build for production
npm run build
```

### Project Structure

```
src/
├── components/
│   ├── GanttChart.tsx    # High-level Gantt chart component
│   ├── Mermaid.tsx       # Mermaid diagram renderer
│   └── index.ts
├── types/
│   ├── gantt.ts          # TypeScript type definitions
│   └── index.ts
├── utils/
│   ├── ganttConverter.ts # Data to Mermaid syntax conversion
│   └── index.ts
├── App.tsx               # Example application
└── index.tsx             # Entry point
```

## Testing

The project includes comprehensive tests for:

- Type validation
- Data conversion
- Component rendering
- Error handling

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:ci
```

## License

MIT
