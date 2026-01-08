import React, { useEffect, useState } from "react";

import { sendOpenRouterChat } from "../utils/openrouter.js";
import {
  ISRAELI_FIRST_NAMES,
  ISRAELI_LAST_NAMES,
  PROFESSIONS,
} from "../data/israeliData.js";

const MODEL = "google/gemini-2.0-flash-lite-001";
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const LATEST_PASSENGER_STORAGE_KEY = "mrrabbittools_latest_passenger";
const PASSENGER_TYPE_STORAGE_KEY = "mrrabbittools_passenger_type";
const CURRENT_YEAR = 2026;

function getProfessionForPassengerType(passengerType) {
  if (passengerType === "infant") return "Baby";
  if (passengerType === "child") return "Child labor worker";
  if (passengerType === "senior") return "Pensioner";
  return pick(PROFESSIONS);
}

const PASSENGER_TYPES = [
  { id: "adult", label: "Adult (18–65)" },
  { id: "child", label: "Child (2–17)" },
  { id: "senior", label: "Senior (above 65)" },
  { id: "infant", label: "Infant (under 2)" },
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function randomIntInclusive(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function getBirthYearRange(passengerType) {
  if (passengerType === "child") {
    return { min: CURRENT_YEAR - 17, max: CURRENT_YEAR - 5 };
  }
  if (passengerType === "senior") {
    return { min: CURRENT_YEAR - 90, max: CURRENT_YEAR - 66 };
  }
  if (passengerType === "infant") {
    return { min: CURRENT_YEAR - 2, max: CURRENT_YEAR };
  }
  // adult (default): 19-64
  return { min: CURRENT_YEAR - 64, max: CURRENT_YEAR - 19 };
}

function randomBirthdate(passengerType) {
  const { min, max } = getBirthYearRange(passengerType);
  const year = randomIntInclusive(min, max);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28); // keep simple/valid for all months
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

function buildBackgroundPrompt({
  firstName,
  lastName,
  birthdate,
  profession,
  passengerType,
  nonce,
}) {
  const ageHint =
    passengerType === "infant"
      ? "Age: infant (under 2)"
      : passengerType === "child"
        ? "Age: child (2–17)"
        : passengerType === "senior"
          ? "Age: senior (above 65)"
          : "Age: adult (18–65)";

  return `Generate a fictional character background story for this character:

FIRST_NAME: ${firstName}
LAST_NAME: ${lastName}
BIRTHDATE: ${birthdate}
PROFESSION: ${profession}
${ageHint}

Requirements:
- 2 sentences, no more than 12 words each.
- First sentence is about the character's name, profession, and age group.
- Second sentence is crazy, bizzare fact about the character.
- Must match the age group above (no adult job for infants, etc.).
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
  const findBestPassengerRoot = () => {
    // Find containers that look like a passenger section (contain both name inputs).
    const candidates = Array.from(
      document.querySelectorAll('input[name="first-name"]'),
    )
      .map((inp) => inp.parentElement)
      .map((el) => el?.closest?.("div"))
      .filter(Boolean)
      .map((el) => {
        let cur = el;
        while (cur && cur !== document.documentElement) {
          if (
            cur.querySelector?.('input[name="first-name"]') &&
            cur.querySelector?.('input[name="last-name"]')
          ) {
            return cur;
          }
          cur = cur.parentElement;
        }
        return null;
      })
      .filter(Boolean);

    // Prefer the first passenger block with empty name fields.
    const emptyOne = candidates.find((root) => {
      const fn = root.querySelector('input[name="first-name"]');
      const ln = root.querySelector('input[name="last-name"]');
      return (fn && !fn.value) || (ln && !ln.value);
    });

    return emptyOne || candidates[0] || document;
  };

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

  const passengerRoot = findBestPassengerRoot();
  const firstNameInput =
    passengerRoot.querySelector?.('input[name="first-name"]') ||
    passengerRoot.querySelector?.('input[nagish-text="passenger first name"]') ||
    document.querySelector('input[name="first-name"]') ||
    document.querySelector('input[nagish-text="passenger first name"]');
  const lastNameInput =
    passengerRoot.querySelector?.('input[name="last-name"]') ||
    passengerRoot.querySelector?.('input[nagish-text="passenger last name"]') ||
    document.querySelector('input[name="last-name"]') ||
    document.querySelector('input[nagish-text="passenger last name"]');

  const okFirst = setInputValueWithEvents(firstNameInput, firstName);
  const okLast = setInputValueWithEvents(lastNameInput, lastName);

  const [dd, mm, yyyy] = (birthdate || "").split("/");
  const birthPicker =
    passengerRoot.querySelector?.('[id$="birthdatePicker"]') || passengerRoot;
  const allSelects = Array.from(
    (birthPicker || document).querySelectorAll?.("select") ||
      document.querySelectorAll("select"),
  );
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
  const [passengerType, setPassengerType] = useState("adult");
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

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get([PASSENGER_TYPE_STORAGE_KEY], (res) => {
        const t = res?.[PASSENGER_TYPE_STORAGE_KEY];
        if (t && PASSENGER_TYPES.some((x) => x.id === t)) {
          setPassengerType(t);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ [PASSENGER_TYPE_STORAGE_KEY]: passengerType });
    }
  }, [passengerType]);

  const handleGenerate = async () => {
    setErrorMessage("");
    setFillMessage("");
    setIsLoading(true);
    try {
      const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nextFirstName = pick(ISRAELI_FIRST_NAMES);
      const nextLastName = pick(ISRAELI_LAST_NAMES);
      const nextBirthdate = randomBirthdate(passengerType);
      const nextProfession = getProfessionForPassengerType(passengerType);

      setFirstName(nextFirstName);
      setLastName(nextLastName);
      setBirthdate(nextBirthdate);
      setProfession(nextProfession);
      setBackground("");

      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({
          [LATEST_PASSENGER_STORAGE_KEY]: {
            firstName: nextFirstName,
            lastName: nextLastName,
            birthdate: nextBirthdate,
          },
        });
      }

      const content = await sendOpenRouterChat({
        apiKey: API_KEY,
        model: MODEL,
        prompt: buildBackgroundPrompt({
          firstName: nextFirstName,
          lastName: nextLastName,
          birthdate: nextBirthdate,
          profession: nextProfession,
          passengerType,
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

      <div className="radio-group">
        {PASSENGER_TYPES.map((t) => (
          <label key={t.id} className="radio-pill">
            <input
              type="radio"
              name="passenger-type"
              value={t.id}
              checked={passengerType === t.id}
              onChange={() => setPassengerType(t.id)}
            />
            <span>{t.label}</span>
          </label>
        ))}
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
