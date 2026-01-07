import React, { useState } from "react";

import { openJsonViewer } from "../utils/viewer.js";

export default function JsonTab({ inputValue, setInputValue }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleBeautifyAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const parsed = JSON.parse(inputValue);
      const pretty = JSON.stringify(parsed, null, 2);
      await navigator.clipboard.writeText(pretty);
      setInputValue(pretty);
      setCopied(true);
    } catch (error) {
      setErrorMessage(`Invalid JSON: ${error.message}`);
    }
  };

  const handleMinifyAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const parsed = JSON.parse(inputValue);
      const minified = JSON.stringify(parsed);
      await navigator.clipboard.writeText(minified);
      setInputValue(minified);
      setCopied(true);
    } catch (error) {
      setErrorMessage(`Invalid JSON: ${error.message}`);
    }
  };

  const handleOpenViewer = async () => {
    setErrorMessage("");
    try {
      await openJsonViewer(inputValue);
    } catch (error) {
      setErrorMessage(`Invalid JSON: ${error.message}`);
    }
  };

  return (
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
}


