import React, { useMemo, useState } from "react";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(firstNames, lastNames) {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}

export default function NameGeneratorTab({ inputValue, setInputValue }) {
  const [count, setCount] = useState(10);
  const [append, setAppend] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const firstNames = useMemo(
    () => [
      "Alex",
      "Amit",
      "Dana",
      "Eden",
      "Gal",
      "Jordan",
      "Lior",
      "Maya",
      "Noa",
      "Omer",
      "Roi",
      "Shai",
      "Taylor",
      "Yael",
      "Ziv",
    ],
    [],
  );

  const lastNames = useMemo(
    () => [
      "Cohen",
      "Levi",
      "Mizrahi",
      "Peretz",
      "Biton",
      "Dahan",
      "Azulay",
      "Friedman",
      "Weiss",
      "Katz",
      "Rosen",
      "Goldberg",
      "Shapiro",
      "Miller",
      "Smith",
    ],
    [],
  );

  const handleGenerate = () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const safeCount = Math.max(1, Math.min(200, Number(count) || 1));
      const lines = Array.from({ length: safeCount }, () =>
        generateName(firstNames, lastNames),
      );
      const next = lines.join("\n");
      setInputValue(append && inputValue ? `${inputValue}\n${next}` : next);
    } catch {
      setErrorMessage("Failed to generate names");
    }
  };

  const handleCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      await navigator.clipboard.writeText(inputValue);
      setCopied(true);
    } catch {
      setErrorMessage("Failed to copy");
    }
  };

  return (
    <>
      <div className="actions">
        <label className="field">
          Count
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="number-input"
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={append}
            onChange={(e) => setAppend(e.target.checked)}
          />
          Append
        </label>
        <button onClick={handleGenerate} className="btn btn-secondary">
          Generate
        </button>
        <button onClick={handleCopy} className="btn btn-secondary">
          Copy
        </button>
        {copied && <span className="copied">Copied!</span>}
      </div>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Generated names will appear here"
        spellCheck={false}
        className="json-input"
      />
      {errorMessage && <div className="error">{errorMessage}</div>}
    </>
  );
}


