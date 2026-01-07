import React from "react";

export default function HtmlTab({ inputValue, setInputValue }) {
  return (
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
}


