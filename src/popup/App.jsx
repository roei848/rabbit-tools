import React, { useState } from "react";
import "./App.css";

function App() {
  const [inputValue, setInputValue] = useState("");
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

  return (
    <div className="app-container">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Paste JSON here"
        spellCheck={false}
        className="json-input"
      />
      <div className="actions">
        <button onClick={handleBeautifyAndCopy} className="btn btn-primary">
          Beautify & Copy
        </button>
        <button onClick={handleMinifyAndCopy} className="btn btn-secondary">
          Minify & Copy
        </button>
        {copied && <span className="copied">Copied!</span>}
      </div>
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  );
}

export default App;
