import React, { useState } from "react";

import XmlTab from "./tabs/XmlTab.jsx";
import HtmlTab from "./tabs/HtmlTab.jsx";
import JsonTab from "./tabs/JsonTab.jsx";
import JibrishTab from "./tabs/JibrishTab.jsx";
import NameGeneratorTab from "./tabs/NameGeneratorTab.jsx";

import "./App.css";

const TABS = [
  { id: "json", label: "JSON" },
  { id: "xml", label: "XML" },
  { id: "html", label: "HTML" },
  { id: "jibris", label: "Jibrish" },
  { id: "name-generator", label: "Name Generator" },
];

function App() {
  const [activeTab, setActiveTab] = useState("json");
  const [inputValue, setInputValue] = useState("");

  const renderTab = () => {
    if (activeTab === "json") {
      return <JsonTab inputValue={inputValue} setInputValue={setInputValue} />;
    }

    if (activeTab === "xml") {
      return <XmlTab inputValue={inputValue} setInputValue={setInputValue} />;
    }

    if (activeTab === "html") {
      return <HtmlTab inputValue={inputValue} setInputValue={setInputValue} />;
    }

    if (activeTab === "jibris") {
      return (
        <JibrishTab inputValue={inputValue} setInputValue={setInputValue} />
      );
    }

    if (activeTab === "name-generator") {
      return (
        <NameGeneratorTab
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      );
    }

    return null;
  };

  return (
    <div className="app-container">
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">{renderTab()}</div>
    </div>
  );
}

export default App;
