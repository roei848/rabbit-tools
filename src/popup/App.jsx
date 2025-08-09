import React from "react";

function App() {
  const handleClick = () => {
    console.log("Hey");
  };

  return (
    <div style={{ padding: 12, fontFamily: "Inter, system-ui, sans-serif" }}>
      <button
        onClick={handleClick}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: "#111827",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Say Hey
      </button>
    </div>
  );
}

export default App; 