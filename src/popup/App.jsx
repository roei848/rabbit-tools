import React, { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("json");
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleBeautifyAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      if (activeTab === "json") {
        const parsed = JSON.parse(inputValue);
        const pretty = JSON.stringify(parsed, null, 2);
        await navigator.clipboard.writeText(pretty);
        setInputValue(pretty);
      } else if (activeTab === "xml") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputValue, "text/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
          throw new Error("Invalid XML");
        }
        const serializer = new XMLSerializer();
        const raw = serializer.serializeToString(xmlDoc);

        // Format XML with proper indentation
        const formatted = formatXml(raw, 2);
        await navigator.clipboard.writeText(formatted);
        setInputValue(formatted);
      }
      setCopied(true);
    } catch (error) {
      setErrorMessage(`Invalid ${activeTab.toUpperCase()}: ${error.message}`);
    }
  };

  const handleMinifyAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      if (activeTab === "json") {
        const parsed = JSON.parse(inputValue);
        const minified = JSON.stringify(parsed);
        await navigator.clipboard.writeText(minified);
        setInputValue(minified);
      } else if (activeTab === "xml") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputValue, "text/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
          throw new Error("Invalid XML");
        }
        const serializer = new XMLSerializer();
        const minified = serializer
          .serializeToString(xmlDoc)
          .replace(/>\s+</g, "><");
        await navigator.clipboard.writeText(minified);
        setInputValue(minified);
      }
      setCopied(true);
    } catch (error) {
      setErrorMessage(`Invalid ${activeTab.toUpperCase()}: ${error.message}`);
    }
  };

  const formatXml = (xml, indentSize) => {
    let formatted = "";
    let indent = "";
    const tab = " ".repeat(indentSize);

    xml.split(/>\s*</).forEach((node) => {
      if (node.match(/^\/\w/)) {
        // Closing tag
        indent = indent.substring(tab.length);
      }
      formatted += indent + "<" + node + ">\r\n";
      if (node.match(/^<?\w[^>]*[^\/]$/)) {
        // Opening tag
        indent += tab;
      }
    });

    return formatted.substring(1, formatted.length - 3);
  };

  const setStorage = async (key, value) => {
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }
    localStorage.setItem(key, value);
  };

  const handleOpenViewer = async () => {
    setErrorMessage("");
    try {
      if (activeTab === "json") {
        // Validate JSON
        JSON.parse(inputValue);
        const token = `${Date.now().toString(36)}${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const storageKey = `json-view:${token}`;
        await setStorage(storageKey, inputValue);
        const base =
          typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.getURL
            ? chrome.runtime.getURL("viewer.html")
            : "/viewer.html";
        const url = `${base}?k=${encodeURIComponent(token)}`;
        window.open(url, "_blank");
      } else if (activeTab === "xml") {
        // Validate XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputValue, "text/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
          throw new Error("Invalid XML");
        }
        const token = `${Date.now().toString(36)}${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const storageKey = `xml-view:${token}`;
        await setStorage(storageKey, inputValue);
        const base =
          typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.getURL
            ? chrome.runtime.getURL("xml-viewer.html")
            : "/xml-viewer.html";
        const url = `${base}?k=${encodeURIComponent(token)}`;
        window.open(url, "_blank");
      }
    } catch (error) {
      setErrorMessage(`Invalid ${activeTab.toUpperCase()}: ${error.message}`);
    }
  };

  const handleTranslateAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);

    const engToHeb = {
      a: "ש",
      b: "נ",
      c: "ב",
      d: "ג",
      e: "ק",
      f: "כ",
      g: "ע",
      h: "י",
      i: "ן",
      j: "ח",
      k: "ל",
      l: "ך",
      m: "צ",
      n: "מ",
      o: "ם",
      p: "פ",
      q: "/",
      r: "ר",
      s: "ד",
      t: "א",
      u: "ו",
      v: "ה",
      w: "'",
      x: "ס",
      y: "ט",
      z: "ז",
      // uppercase
      A: "ש",
      B: "נ",
      C: "ב",
      D: "ג",
      E: "ק",
      F: "כ",
      G: "ע",
      H: "י",
      I: "ן",
      J: "ח",
      K: "ל",
      L: "ך",
      M: "צ",
      N: "מ",
      O: "ם",
      P: "פ",
      Q: "/",
      R: "ר",
      S: "ד",
      T: "א",
      U: "ו",
      V: "ה",
      W: "'",
      X: "ס",
      Y: "ט",
      Z: "ז",
    };

    const hebToEng = {};
    // auto-generate reverse dictionary
    Object.entries(engToHeb).forEach(([eng, heb]) => {
      hebToEng[heb] = eng.toLowerCase();
    });

    // detection: which alphabet appears more?
    const englishCount = (inputValue.match(/[A-Za-z]/g) || []).length;
    const hebrewCount = (inputValue.match(/[\u0590-\u05FF]/g) || []).length;

    let direction = "engToHeb";
    if (hebrewCount > englishCount) direction = "hebToEng";

    try {
      const translated =
        direction === "engToHeb"
          ? inputValue
              .split("")
              .map((ch) => engToHeb[ch] || ch)
              .join("")
          : inputValue
              .split("")
              .map((ch) => hebToEng[ch] || ch)
              .join("");

      await navigator.clipboard.writeText(translated);
      setInputValue(translated);
      setCopied(true);
    } catch (error) {
      setErrorMessage("Failed to translate or copy text");
    }
  };

  const renderJsonTab = () => (
    <>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Paste JSON here"
        spellCheck={false}
        className="json-input"
      />
      <div className="actions">
        <button onClick={handleBeautifyAndCopy} className="btn btn-secondary">
          Beautify & Copy
        </button>
        <button onClick={handleMinifyAndCopy} className="btn btn-secondary">
          Minify & Copy
        </button>
        <button onClick={handleOpenViewer} className="btn btn-secondary">
          Open Viewer
        </button>
        {copied && <span className="copied">Copied!</span>}
      </div>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </>
  );

  const renderXmlTab = () => (
    <>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Paste XML here"
        spellCheck={false}
        className="json-input"
      />
      <div className="actions">
        <button onClick={handleBeautifyAndCopy} className="btn btn-secondary">
          Beautify & Copy
        </button>
        <button onClick={handleMinifyAndCopy} className="btn btn-secondary">
          Minify & Copy
        </button>
        <button onClick={handleOpenViewer} className="btn btn-secondary">
          Open Viewer
        </button>
        {copied && <span className="copied">Copied!</span>}
      </div>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </>
  );

  const renderHtmlTab = () => (
    <div className="html-viewer">
      <div className="html-input-section">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste HTML here"
          spellCheck={false}
          className="html-textarea"
        />
      </div>
      <div className="html-preview-section">
        <div className="preview-header">
          <span>Preview</span>
        </div>
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: inputValue }}
        />
      </div>
    </div>
  );

  const renderJibrishTab = () => (
    <div className="pdf-viewer">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Paste Jibrish here"
        spellCheck={false}
        className="json-input"
      />
      <div className="actions">
        <button onClick={handleTranslateAndCopy} className="btn btn-secondary">
          Translate and Copy
        </button>
        {copied && <span className="copied">Copied!</span>}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "json" ? "active" : ""}`}
          onClick={() => setActiveTab("json")}
        >
          JSON
        </button>
        <button
          className={`tab ${activeTab === "xml" ? "active" : ""}`}
          onClick={() => setActiveTab("xml")}
        >
          XML
        </button>
        <button
          className={`tab ${activeTab === "html" ? "active" : ""}`}
          onClick={() => setActiveTab("html")}
        >
          HTML
        </button>
        <button
          className={`tab ${activeTab === "jibris" ? "active" : ""}`}
          onClick={() => setActiveTab("jibris")}
        >
          Jibrish
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "json" && renderJsonTab()}
        {activeTab === "xml" && renderXmlTab()}
        {activeTab === "html" && renderHtmlTab()}
        {activeTab === "jibris" && renderJibrishTab()}
      </div>
    </div>
  );
}

export default App;
