import React from "react";
import { useEffect } from "react";
import { useState } from "react";

function isObjectLike(value) {
  return value !== null && typeof value === "object";
}

function getEntries(value) {
  if (Array.isArray(value)) {
    return value.map((v, i) => [i, v]);
  }
  return Object.entries(value || {});
}

function formatPrimitive(value) {
  if (typeof value === "string") return `"${value}"`;
  if (value === null) return "null";
  return String(value);
}

function Chevron({ expanded }) {
  return (
    <span className={`chevron ${expanded ? "expanded" : ""}`}>▶</span>
  );
}

function JsonNode({ label, value, depth, defaultExpanded, resetSignal }) {
  const isBranch = isObjectLike(value);
  const [expanded, setExpanded] = useState(Boolean(defaultExpanded));

  useEffect(() => {
    setExpanded(Boolean(defaultExpanded));
  }, [defaultExpanded, resetSignal]);

  if (!isBranch) {
    return (
      <div className="node" style={{ paddingLeft: depth * 12 }}>
        <span className="label">{label !== undefined ? `${label}: ` : ""}</span>
        <span className={`value value-${typeof value}`}>{formatPrimitive(value)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = getEntries(value);
  const summary = isArray ? `Array(${entries.length})` : `Object(${entries.length})`;

  return (
    <div className="branch">
      <div className="node" style={{ paddingLeft: depth * 12 }}>
        <button className="toggle" onClick={() => setExpanded((v) => !v)}>
          <Chevron expanded={expanded} />
        </button>
        <span className="label">
          {label !== undefined ? `${label}: ` : ""}
        </span>
        <span className="summary">{summary}</span>
      </div>
      {expanded && (
        <div className="children">
          {entries.map(([k, v]) => (
            <JsonNode
              key={String(k)}
              label={k}
              value={v}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
              resetSignal={resetSignal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JsonTree({ data, defaultExpanded, resetSignal }) {
  return (
    <div className="json-tree">
      <JsonNode
        label={undefined}
        value={data}
        depth={0}
        defaultExpanded={defaultExpanded}
        resetSignal={resetSignal}
      />
    </div>
  );
} 