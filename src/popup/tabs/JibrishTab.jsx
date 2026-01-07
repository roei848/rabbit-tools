import React, { useState } from "react";

import { translateJibrish } from "../utils/jibrish.js";

export default function JibrishTab({ inputValue, setInputValue }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleTranslateAndCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const translated = translateJibrish(inputValue);
      await navigator.clipboard.writeText(translated);
      setInputValue(translated);
      setCopied(true);
    } catch {
      setErrorMessage("Failed to translate or copy text");
    }
  };

  return (
    <div className="jibrish-viewer">
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
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  );
}


