import React from "react";
import JsonTree from "./components/JsonTree.jsx";
import { useEffect } from "react";
import { useMemo } from "react";
import { useState } from "react";

function useQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

async function setStorage(key, value) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }
  localStorage.setItem(key, value);
}

async function getStorage(key) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => resolve(result[key]));
    });
  }
  return localStorage.getItem(key);
}

export default function App() {
  const token = useQueryParam("k");
  const storageKey = token ? `json-view:${token}` : undefined;

  const [raw, setRaw] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [defaultExpanded, setDefaultExpanded] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!storageKey) {
          setError("Missing token");
          return;
        }
        const value = await getStorage(storageKey);
        if (cancelled) return;
        if (!value) {
          setError("No JSON found for this token");
          return;
        }
        setRaw(value);
        const parsed = JSON.parse(value);
        setData(parsed);
      } catch (e) {
        setError(`Failed to parse JSON: ${e.message}`);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const pretty = useMemo(() => {
    try {
      return data ? JSON.stringify(data, null, 2) : "";
    } catch {
      return "";
    }
  }, [data]);

  const minified = useMemo(() => {
    try {
      return data ? JSON.stringify(data) : "";
    } catch {
      return "";
    }
  }, [data]);

  const handleExpandAll = () => {
    setDefaultExpanded(true);
    setResetSignal((n) => n + 1);
  };

  const handleCollapseAll = () => {
    setDefaultExpanded(false);
    setResetSignal((n) => n + 1);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="viewer-container">
      <div className="viewer-toolbar">
        <button className="btn" onClick={handleExpandAll}>Expand all</button>
        <button className="btn" onClick={handleCollapseAll}>Collapse all</button>
        <div className="spacer" />
        <button className="btn" onClick={() => copyToClipboard(pretty)}>Copy Pretty</button>
        <button className="btn" onClick={() => copyToClipboard(minified)}>Copy Minified</button>
      </div>

      {error && <div className="error-bar">{error}</div>}

      {!error && data && (
        <div className="viewer-content">
          <JsonTree data={data} defaultExpanded={defaultExpanded} resetSignal={resetSignal} />
        </div>
      )}
    </div>
  );
} 