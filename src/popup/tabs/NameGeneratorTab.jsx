import React, { useEffect, useState } from "react";

import { sendOpenRouterChat } from "../utils/openrouter.js";
import {
  ISRAELI_FIRST_NAMES,
  ISRAELI_LAST_NAMES,
  PROFESSIONS,
} from "../data/israeliData.js";

const MODEL = "google/gemini-2.0-flash-lite-001";
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function randomBirthdate() {
  // Must be over 18 in 2026 => born on/before 2007-12-31.
  const year = 1950 + Math.floor(Math.random() * (2007 - 1950 + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28); // keep simple/valid for all months
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

function buildBackgroundPrompt({ firstName, lastName, birthdate, profession, nonce }) {
  return `Generate a fictional character background story for this character:

FIRST_NAME: ${firstName}
LAST_NAME: ${lastName}
BIRTHDATE: ${birthdate}
PROFESSION: ${profession}

Requirements:
- 2 sentences, no more than 12 words each.
- First sentence is about the character's name and profession.
- Second sentence is crazy, bizzare fact about the character.
- The character must be over 18 years old (current year is 2026).
- No intro text, no labels, no markdown. Output ONLY the background story text.

INTERNAL_REQUEST_ID (do not output): ${nonce}`;
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 7C8 5.89543 8.89543 5 10 5H18C19.1046 5 20 5.89543 20 7V18C20 19.1046 19.1046 20 18 20H10C8.89543 20 8 19.1046 8 18V7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M6 17H5C3.89543 17 3 16.1046 3 15V6C3 4.89543 3.89543 4 5 4H15C16.1046 4 17 4.89543 17 6V7"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function NameGeneratorTab({ inputValue, setInputValue }) {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [profession, setProfession] = useState("");
  const [background, setBackground] = useState("");

  useEffect(() => {
    if (!API_KEY) {
      setErrorMessage(
        "Missing OpenRouter API key. Add VITE_OPENROUTER_API_KEY to .env.local and rebuild."
      );
    }
  }, []);

  const handleGenerate = async () => {
    setErrorMessage("");
    setCopied(false);
    setIsLoading(true);
    try {
      const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nextFirstName = pick(ISRAELI_FIRST_NAMES);
      const nextLastName = pick(ISRAELI_LAST_NAMES);
      const nextBirthdate = randomBirthdate();
      const nextProfession = pick(PROFESSIONS);

      setFirstName(nextFirstName);
      setLastName(nextLastName);
      setBirthdate(nextBirthdate);
      setProfession(nextProfession);
      setBackground("");

      const content = await sendOpenRouterChat({
        apiKey: API_KEY,
        model: MODEL,
        prompt: buildBackgroundPrompt({
          firstName: nextFirstName,
          lastName: nextLastName,
          birthdate: nextBirthdate,
          profession: nextProfession,
          nonce,
        }),
        maxTokens: 500,
        temperature: 0.9,
      });

      const nextBackground = content.trim();
      setBackground(nextBackground);

      const fullText = `FIRST_NAME: ${nextFirstName} LAST_NAME: ${nextLastName} BIRTHDATE: ${nextBirthdate}\nPROFESSION: ${nextProfession}\nBACKGROUND: ${nextBackground}`;
      setInputValue(fullText);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to generate background story");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const fullText = `FIRST_NAME: ${firstName} LAST_NAME: ${lastName} BIRTHDATE: ${birthdate}\nPROFESSION: ${profession}\nBACKGROUND: ${background}`;
      await navigator.clipboard.writeText(fullText.trim());
      setCopied(true);
    } catch {
      setErrorMessage("Failed to copy");
    }
  };

  const handleOpenInTab = () => {
    const base =
      typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL
        ? chrome.runtime.getURL("popup.html")
        : "/popup.html";
    window.open(base, "_blank");
  };

  const handleCopyField = async (value, fieldId) => {
    setErrorMessage("");
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldId);
      window.clearTimeout(handleCopyField._t);
      handleCopyField._t = window.setTimeout(() => setCopiedField(""), 1200);
    } catch {
      setErrorMessage("Failed to copy");
    }
  };

  return (
    <>
      <div className="actions">
        <button
          onClick={handleGenerate}
          className="btn btn-secondary"
          disabled={!API_KEY || isLoading}
        >
          {isLoading ? "Generating..." : "Generate Character (AI)"}
        </button>
        <button onClick={handleOpenInTab} className="btn btn-secondary">
          Open in Tab
        </button>
        <button onClick={handleCopy} className="btn btn-secondary">
          Copy
        </button>
        {copied && <span className="copied">Copied!</span>}
      </div>
      <div className="profile-grid">
        <div className="profile-field">
          <div className="profile-label-row">
            <div className="profile-label">First name</div>
            <button
              type="button"
              className="copy-icon-btn"
              onClick={() => handleCopyField(firstName, "firstName")}
              disabled={!firstName}
              aria-label="Copy first name"
              title={copiedField === "firstName" ? "Copied!" : "Copy"}
            >
              <CopyIcon />
            </button>
          </div>
          <input
            value={firstName}
            readOnly
            className="profile-value"
            placeholder="—"
          />
        </div>
        <div className="profile-field">
          <div className="profile-label-row">
            <div className="profile-label">Last name</div>
            <button
              type="button"
              className="copy-icon-btn"
              onClick={() => handleCopyField(lastName, "lastName")}
              disabled={!lastName}
              aria-label="Copy last name"
              title={copiedField === "lastName" ? "Copied!" : "Copy"}
            >
              <CopyIcon />
            </button>
          </div>
          <input
            value={lastName}
            readOnly
            className="profile-value"
            placeholder="—"
          />
        </div>
        <div className="profile-field">
          <div className="profile-label-row">
            <div className="profile-label">Birthdate</div>
            <button
              type="button"
              className="copy-icon-btn"
              onClick={() => handleCopyField(birthdate, "birthdate")}
              disabled={!birthdate}
              aria-label="Copy birthdate"
              title={copiedField === "birthdate" ? "Copied!" : "Copy"}
            >
              <CopyIcon />
            </button>
          </div>
          <input
            value={birthdate}
            readOnly
            className="profile-value"
            placeholder="—"
          />
        </div>
        <div className="profile-background">
          <div className="profile-label-row">
            <div className="profile-label">Profession</div>
            <button
              type="button"
              className="copy-icon-btn"
              onClick={() => handleCopyField(profession, "profession")}
              disabled={!profession}
              aria-label="Copy profession"
              title={copiedField === "profession" ? "Copied!" : "Copy"}
            >
              <CopyIcon />
            </button>
          </div>
          <div className="profile-meta-text">{profession || "—"}</div>
          <div className="profile-label-row">
            <div className="profile-label">Background</div>
            <button
              type="button"
              className="copy-icon-btn"
              onClick={() => handleCopyField(background, "background")}
              disabled={!background}
              aria-label="Copy background"
              title={copiedField === "background" ? "Copied!" : "Copy"}
            >
              <CopyIcon />
            </button>
          </div>
          <div className="profile-background-text">{background || "—"}</div>
        </div>
      </div>

      {errorMessage && <div className="error">{errorMessage}</div>}
    </>
  );
}
