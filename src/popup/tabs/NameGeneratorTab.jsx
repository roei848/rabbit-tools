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

function fillPassengerForm({ firstName, lastName, birthdate }) {
  const setInputValueWithEvents = (el, value) => {
    if (!el) return false;
    el.focus?.();
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };

  const setSelectValueWithEvents = (el, value) => {
    if (!el) return false;
    el.focus?.();
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };

  const firstNameInput =
    document.querySelector('input[name="first-name"]') ||
    document.querySelector('input[nagish-text="passenger first name"]');
  const lastNameInput =
    document.querySelector('input[name="last-name"]') ||
    document.querySelector('input[nagish-text="passenger last name"]');

  const okFirst = setInputValueWithEvents(firstNameInput, firstName);
  const okLast = setInputValueWithEvents(lastNameInput, lastName);

  const [dd, mm, yyyy] = (birthdate || "").split("/");
  const allSelects = Array.from(document.querySelectorAll("select"));
  const yearSelect = allSelects.find((s) => s.querySelector('option[value="YYYY"]'));
  const monthSelect = allSelects.find((s) => s.querySelector('option[value="MM"]'));
  const daySelect = allSelects.find((s) => s.querySelector('option[value="DD"]'));

  const okYear = yyyy ? setSelectValueWithEvents(yearSelect, yyyy) : false;
  const okMonth = mm ? setSelectValueWithEvents(monthSelect, mm) : false;
  const okDay = dd ? setSelectValueWithEvents(daySelect, dd) : false;

  return {
    okFirst,
    okLast,
    okYear,
    okMonth,
    okDay,
  };
}

export default function NameGeneratorTab({ inputValue, setInputValue }) {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fillMessage, setFillMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [profession, setProfession] = useState("");
  const [background, setBackground] = useState("");
  const isFillReady =
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(birthdate.trim());

  useEffect(() => {
    if (!API_KEY) {
      setErrorMessage(
        "Missing OpenRouter API key. Add VITE_OPENROUTER_API_KEY to .env.local and rebuild."
      );
    }
  }, []);

  const handleGenerate = async () => {
    setErrorMessage("");
    setFillMessage("");
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

  const handleFillForm = async () => {
    setErrorMessage("");
    setFillMessage("");
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.tabs ||
        !chrome.scripting ||
        !chrome.tabs.query
      ) {
        throw new Error("Fill Form is only available in the Chrome extension.");
      }

      if (!firstName || !lastName || !birthdate) {
        throw new Error("Generate a character first.");
      }

      const tabId = await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const err = chrome.runtime?.lastError;
          if (err) return reject(err);
          const id = tabs?.[0]?.id;
          if (!id) return reject(new Error("No active tab found"));
          return resolve(id);
        });
      });

      const results = await new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: fillPassengerForm,
            args: [{ firstName, lastName, birthdate }],
          },
          (res) => {
            const err = chrome.runtime?.lastError;
            if (err) return reject(err);
            return resolve(res);
          },
        );
      });

      const result = results?.[0]?.result;
      if (!result) {
        setFillMessage("Tried to fill form (no result).");
        return;
      }

      const okAll =
        result.okFirst &&
        result.okLast &&
        result.okYear &&
        result.okMonth &&
        result.okDay;

      setFillMessage(okAll ? "Form filled!" : "Partially filled (check fields).");
    } catch (error) {
      setErrorMessage(error?.message || "Failed to fill form");
    }
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
        <button
          onClick={handleFillForm}
          className="btn btn-secondary"
          disabled={isLoading || !isFillReady}
        >
          Fill Form
        </button>
        {fillMessage && <span className="copied">{fillMessage}</span>}
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
