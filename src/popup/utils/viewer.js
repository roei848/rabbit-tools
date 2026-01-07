import { getExtensionUrl, setStorage } from "./storage.js";

function makeToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function openJsonViewer(jsonString) {
  JSON.parse(jsonString);
  const token = makeToken();
  const storageKey = `json-view:${token}`;
  await setStorage(storageKey, jsonString);

  const base = getExtensionUrl("viewer.html");
  const url = `${base}?k=${encodeURIComponent(token)}`;
  window.open(url, "_blank");
}

export async function openXmlViewer(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML");
  }

  const token = makeToken();
  const storageKey = `xml-view:${token}`;
  await setStorage(storageKey, xmlString);

  const base = getExtensionUrl("xml-viewer.html");
  const url = `${base}?k=${encodeURIComponent(token)}`;
  window.open(url, "_blank");
}


