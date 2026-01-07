import React, { useState } from "react";

import { openXmlViewer } from "../utils/viewer.js";
import { formatXml, minifyXml } from "../utils/xml.js";

export default function XmlTab({ inputValue, setInputValue }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleBeautifyAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const formatted = formatXml(inputValue, 2);
      await navigator.clipboard.writeText(formatted);
      setInputValue(formatted);
      setCopied(true);
    } catch (error) {
      setErrorMessage(`Invalid XML: ${error.message}`);
    }
  };

  const handleMinifyAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const minified = minifyXml(inputValue);
      await navigator.clipboard.writeText(minified);
      setInputValue(minified);
      setCopied(true);
    } catch (error) {
      setErrorMessage(`Invalid XML: ${error.message}`);
    }
  };

  const handleOpenViewer = async () => {
    setErrorMessage("");
    try {
      await openXmlViewer(inputValue);
    } catch (error) {
      setErrorMessage(`Invalid XML: ${error.message}`);
    }
  };

  return (
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
}


