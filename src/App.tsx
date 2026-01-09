import "./App.css";
import { GanttChart } from "./components";
import { GanttData } from "./types";

/**
 * Example Gantt chart data demonstrating a software development project.
 */
const exampleGanttData: GanttData = {
  config: {
    title: "Software Development Project",
    dateFormat: "YYYY-MM-DD",
    excludes: ["saturday", "sunday"],
  },
  sections: [
    {
      name: "Planning",
      tasks: [
        {
          id: "requirements",
          name: "Gather Requirements",
          start: "2024-01-01",
          duration: { value: 5, unit: "d" },
          status: ["done"],
        },
        {
          id: "design",
          name: "System Design",
          start: "",
          duration: { value: 7, unit: "d" },
          after: "requirements",
          status: ["done"],
        },
      ],
    },
    {
      name: "Development",
      tasks: [
        {
          id: "backend",
          name: "Backend Development",
          start: "",
          duration: { value: 14, unit: "d" },
          after: "design",
          status: ["active"],
        },
        {
          id: "frontend",
          name: "Frontend Development",
          start: "",
          duration: { value: 14, unit: "d" },
          after: "design",
          status: ["active"],
        },
        {
          id: "integration",
          name: "Integration",
          start: "",
          duration: { value: 5, unit: "d" },
          after: "backend",
          status: ["crit"],
        },
      ],
    },
    {
      name: "Testing & Deployment",
      tasks: [
        {
          id: "testing",
          name: "QA Testing",
          start: "",
          duration: { value: 7, unit: "d" },
          after: "integration",
        },
        {
          id: "deployment",
          name: "Production Deployment",
          start: "",
          duration: { value: 2, unit: "d" },
          after: "testing",
          status: ["crit"],
        },
        {
          id: "launch",
          name: "Launch",
          start: "",
          duration: { value: 0, unit: "d" },
          after: "deployment",
          status: ["milestone"],
        },
      ],
    },
  ],
};

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ganttifier</h1>
        <p>Create beautiful Gantt charts with structured data</p>
      </header>
      <main className="App-main">
        <GanttChart data={exampleGanttData} className="example-chart" />
      </main>
    </div>
  );
}

export default App;
