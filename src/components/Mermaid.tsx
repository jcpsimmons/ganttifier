import mermaid from "mermaid";
import { useEffect, useRef, useCallback, useState } from "react";
import { MermaidProps, MermaidConfig } from "../types";

/**
 * Default Mermaid configuration.
 * Using 'strict' security level for production safety.
 */
const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false, // We control rendering manually
  theme: "default",
  securityLevel: "strict",
  fontFamily: "Fira Code, monospace",
  logLevel: "error",
};

/**
 * Dracula-inspired theme CSS for Mermaid diagrams.
 */
const DRACULA_THEME_CSS = `
  g.classGroup rect {
    fill: #282a36;
    stroke: #6272a4;
  }
  g.classGroup text {
    fill: #f8f8f2;
  }
  g.classGroup line {
    stroke: #f8f8f2;
    stroke-width: 0.5;
  }
  .classLabel .box {
    stroke: #21222c;
    stroke-width: 3;
    fill: #21222c;
    opacity: 1;
  }
  .classLabel .label {
    fill: #f1fa8c;
  }
  .relation {
    stroke: #ff79c6;
    stroke-width: 1;
  }
  #compositionStart, #compositionEnd {
    fill: #bd93f9;
    stroke: #bd93f9;
    stroke-width: 1;
  }
  #aggregationEnd, #aggregationStart {
    fill: #21222c;
    stroke: #50fa7b;
    stroke-width: 1;
  }
  #dependencyStart, #dependencyEnd {
    fill: #00bcd4;
    stroke: #00bcd4;
    stroke-width: 1;
  }
  #extensionStart, #extensionEnd {
    fill: #f8f8f2;
    stroke: #f8f8f2;
    stroke-width: 1;
  }
`;

// Initialize mermaid once with default config
let isInitialized = false;

function initializeMermaid(config?: Partial<MermaidConfig>): void {
  if (!isInitialized) {
    mermaid.initialize({
      ...DEFAULT_CONFIG,
      ...config,
      themeCSS: config?.themeCSS || DRACULA_THEME_CSS,
    });
    isInitialized = true;
  }
}

/**
 * Generates a unique ID for Mermaid diagrams.
 */
function generateId(): string {
  return `mermaid-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Mermaid component for rendering diagrams.
 *
 * This component properly handles:
 * - Dynamic chart updates (re-renders when chart prop changes)
 * - Unique IDs for multiple diagrams on the same page
 * - Error handling for invalid Mermaid syntax
 * - Secure rendering with strict security level
 *
 * @example
 * ```tsx
 * <Mermaid chart="graph TD; A-->B;" />
 * ```
 */
export function Mermaid({
  chart,
  id,
  className = "",
}: MermaidProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>("");
  const uniqueId = useRef(id || generateId());

  const renderChart = useCallback(async () => {
    if (!containerRef.current || !chart) {
      return;
    }

    try {
      initializeMermaid();
      setError(null);

      // Use mermaid.render for controlled rendering
      const { svg } = await mermaid.render(uniqueId.current, chart);
      setRenderedSvg(svg);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to render diagram";
      setError(errorMessage);
      setRenderedSvg("");
      console.error("Mermaid rendering error:", err);
    }
  }, [chart]);

  // Re-render when chart changes
  useEffect(() => {
    // Generate new unique ID on chart change to avoid mermaid caching issues
    uniqueId.current = id || generateId();
    renderChart();
  }, [chart, id, renderChart]);

  if (error) {
    return (
      <div
        className={`mermaid-error ${className}`}
        role="alert"
        aria-live="polite"
      >
        <p>Error rendering diagram:</p>
        <pre>{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
      aria-label="Mermaid diagram"
    />
  );
}

export default Mermaid;
