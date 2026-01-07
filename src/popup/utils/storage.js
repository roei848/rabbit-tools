export async function setStorage(key, value) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return await new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }

  localStorage.setItem(key, value);
}

export function getExtensionUrl(path) {
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL(path);
  }

  return `/${path}`;
}


