import React from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { useState } from "react";

function useQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

async function getStorage(key) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => resolve(result[key]));
    });
  }
  return localStorage.getItem(key);
}

function XmlNode({ node, depth = 0, defaultExpanded = true, resetSignal = 0 }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isElement = node.nodeType === Node.ELEMENT_NODE;
  const hasChildren = node.childNodes && node.childNodes.length > 0;
  const nodeName = node.nodeName;
  const nodeValue = node.nodeValue;

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded, resetSignal]);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = nodeValue?.trim();
    if (!text) return null;
    return (
      <div className="xml-text" style={{ paddingLeft: depth * 12 }}>
        <span className="value-string">"{text}"</span>
      </div>
    );
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return (
      <div className="xml-cdata" style={{ paddingLeft: depth * 12 }}>
        <span className="cdata">&lt;![CDATA[{nodeValue}]]&gt;</span>
      </div>
    );
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return (
      <div className="xml-comment" style={{ paddingLeft: depth * 12 }}>
        <span className="comment">&lt;!-- {nodeValue} --&gt;</span>
      </div>
    );
  }

  if (isElement) {
    const attributes = Array.from(node.attributes || []);
    const children = Array.from(node.childNodes || []);
    const hasTextContent = children.some(child => 
      child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim()
    );

    return (
      <div className="xml-element">
        <div className="node" style={{ paddingLeft: depth * 12 }}>
          {hasChildren && (
            <button className="toggle" onClick={() => setExpanded(!expanded)}>
              <span className={`chevron ${expanded ? "expanded" : ""}`}>▶</span>
            </button>
          )}
          <span className="tag-open">&lt;</span>
          <span className="tag-name">{nodeName}</span>
          {attributes.map(attr => (
            <span key={attr.name}>
              <span className="attr-name"> {attr.name}</span>
              <span className="attr-equals">=</span>
              <span className="attr-value">"{attr.value}"</span>
            </span>
          ))}
          {!hasChildren && !hasTextContent ? (
            <span className="tag-close"> /&gt;</span>
          ) : (
            <span className="tag-close">&gt;</span>
          )}
        </div>
        
        {expanded && hasChildren && (
          <div className="children">
            {children.map((child, index) => (
              <XmlNode
                key={index}
                node={child}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
                resetSignal={resetSignal}
              />
            ))}
          </div>
        )}
        
        {expanded && isElement && hasChildren && (
          <div className="node" style={{ paddingLeft: depth * 12 }}>
            <span className="tag-close">&lt;/{nodeName}&gt;</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function App() {
  const token = useQueryParam("k");
  const storageKey = token ? `xml-view:${token}` : undefined;

  const [raw, setRaw] = useState("");
  const [xmlDoc, setXmlDoc] = useState(null);
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
          setError("No XML found for this token");
          return;
        }
        setRaw(value);
        const parser = new DOMParser();
        const doc = parser.parseFromString(value, "text/xml");
        if (doc.getElementsByTagName("parsererror").length > 0) {
          setError("Invalid XML");
          return;
        }
        setXmlDoc(doc);
      } catch (e) {
        setError(`Failed to parse XML: ${e.message}`);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const formatXml = (xml, indentSize) => {
    let formatted = '';
    let indent = '';
    const tab = ' '.repeat(indentSize);
    
    xml.split(/>\s*</).forEach(node => {
      if (node.match(/^\/\w/)) { // Closing tag
        indent = indent.substring(tab.length);
      }
      formatted += indent + '<' + node + '>\r\n';
      if (node.match(/^<?\w[^>]*[^\/]$/)) { // Opening tag
        indent += tab;
      }
    });
    
    return formatted.substring(1, formatted.length - 3);
  };

  const pretty = useMemo(() => {
    try {
      if (!xmlDoc) return "";
      const serializer = new XMLSerializer();
      const raw = serializer.serializeToString(xmlDoc);
      return formatXml(raw, 2);
    } catch {
      return "";
    }
  }, [xmlDoc]);

  const minified = useMemo(() => {
    try {
      if (!xmlDoc) return "";
      const serializer = new XMLSerializer();
      return serializer.serializeToString(xmlDoc).replace(/>\s+</g, "><");
    } catch {
      return "";
    }
  }, [xmlDoc]);

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

      {!error && xmlDoc && (
        <div className="viewer-content">
          <XmlNode 
            node={xmlDoc.documentElement} 
            defaultExpanded={defaultExpanded} 
            resetSignal={resetSignal} 
          />
        </div>
      )}
    </div>
  );
} 