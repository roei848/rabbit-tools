const MENU_ID = "mrrabbittools_autofill_passenger";
const STORAGE_KEY = "mrrabbittools_latest_passenger";

// Local fallback generator (no AI) for right-click autofill.
// Note: duplicated from popup static data on purpose to keep background.js standalone.
const ISRAELI_FIRST_NAMES = [
  "Noa",
  "Maya",
  "Yael",
  "Tamar",
  "Shira",
  "Noya",
  "Lia",
  "Eden",
  "Hila",
  "Adi",
  "Roni",
  "Dana",
  "Gal",
  "Tal",
  "Shani",
  "Omer",
  "Yaara",
  "Avigail",
  "Hadas",
  "Michal",
  "Or",
  "Sapir",
  "Yuval",
  "Lior",
  "Neta",
  "Shaked",
  "Bar",
  "Moran",
  "Rotem",
  "Ofri",
  "Einav",
  "Rivka",
  "Leah",
  "Rachel",
  "Sara",
  "Miri",
  "Orly",
  "Keren",
  "Shoshana",
  "Talia",
  "Nili",
  "Gili",
  "Sivan",
  "Shir",
  "Hani",
  "Batya",
  "Rina",
  "Orit",
  "Hagit",
  "Vered",
  "Nadav",
  "Itai",
  "Eitan",
  "Amit",
  "Yarden",
  "Yonatan",
  "Yehonatan",
  "Shai",
  "Roi",
  "Roy",
  "Ari",
  "Uri",
  "Oran",
  "Ilan",
  "Erez",
  "Asaf",
  "Yotam",
  "Idan",
  "Alon",
  "Ariel",
  "Daniel",
  "David",
  "Moshe",
  "Yosef",
  "Aharon",
  "Oren",
  "Nir",
  "Omri",
  "Yair",
  "Ran",
  "Doron",
  "Gilad",
  "Elad",
  "Amir",
  "Matan",
  "Netanel",
  "Shlomo",
  "Eli",
  "Eyal",
  "Kobi",
  "Avi",
  "Aviv",
  "Barak",
  "Natan",
  "Haim",
  "Chen",
  "Tom",
  "Meital",
  "Lihi",
  "Yossi",
];

const ISRAELI_LAST_NAMES = [
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
  "Ben-David",
  "Ben-Ari",
  "Ben-Amram",
  "Ben-Zion",
  "Ben-Nun",
  "Ben-Yosef",
  "Sharabi",
  "Malka",
  "Halevi",
  "Gabay",
  "Amar",
  "Sasson",
  "Nachum",
  "Baron",
  "Barkat",
  "Dayan",
  "Galili",
  "Keren",
  "Shalev",
  "Shamir",
  "Ben-Shimon",
  "Harari",
  "Ravid",
  "Shani",
  "Kahana",
  "Efrati",
  "Zohar",
  "Aharoni",
  "Mor",
  "Hadad",
  "Ohayon",
  "Attias",
  "Buzaglo",
  "Turgeman",
  "Edri",
  "Vaknin",
  "Masika",
  "Nahum",
  "Regev",
  "Ashkenazi",
  "Sela",
  "Sivan",
  "Raviv",
  "Peleg",
  "Noy",
  "Avraham",
  "Yitzhaki",
  "Harel",
  "Carmi",
  "Kereni",
  "Lev",
  "Barak",
  "Carmon",
  "Golan",
  "Zamir",
  "Tal",
  "Sharon",
  "Koren",
  "Navon",
  "Nissan",
  "Dori",
  "Ron",
  "Noyman",
  "Berg",
  "Stern",
  "Gross",
  "Segal",
  "Kaplan",
  "Klein",
  "Eisenberg",
  "Roth",
  "Silver",
  "Bachar",
  "Hazan",
  "Lahav",
  "Almog",
  "Tzion",
  "Sorek",
  "Boaron",
  "Guez",
  "Sason",
  "Tayeb",
  "Haddad",
  "Israeli",
  "Barzilai",
];

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
  const day = 1 + Math.floor(Math.random() * 28);
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

function generatePassenger() {
  return {
    firstName: pick(ISRAELI_FIRST_NAMES),
    lastName: pick(ISRAELI_LAST_NAMES),
    birthdate: randomBirthdate(),
  };
}

function ensureMenu() {
  try {
    chrome.contextMenus.remove(MENU_ID, () => {
      chrome.contextMenus.create({
        id: MENU_ID,
        title: "MrRabbitTools: Autofill passenger",
        contexts: ["editable"],
      });
    });
  } catch {
    // ignore
  }
}

chrome.runtime.onInstalled.addListener(() => {
  ensureMenu();
});

chrome.runtime.onStartup?.addListener(() => {
  ensureMenu();
});

function fillPassengerForm({ firstName, lastName, birthdate }) {
  const findPassengerContainerFromActive = () => {
    const active = document.activeElement;
    if (!active || active === document.body) return null;

    // Walk up until we find a container that includes both name inputs and the birthdate picker.
    let el = active;
    while (el && el !== document.documentElement) {
      if (el.querySelector) {
        const hasFirst = el.querySelector('input[name="first-name"]');
        const hasLast = el.querySelector('input[name="last-name"]');
        const hasBirth =
          el.querySelector('[id$="birthdatePicker"]') ||
          (el.querySelector('select option[value="YYYY"]') &&
            el.querySelector('select option[value="MM"]') &&
            el.querySelector('select option[value="DD"]'));
        if (hasFirst && hasLast && hasBirth) return el;
      }
      el = el.parentElement;
    }

    return null;
  };

  const findByTabIndexGroup = () => {
    const active = document.activeElement;
    const t = Number(active?.getAttribute?.("tabindex") ?? active?.tabIndex);
    if (!Number.isFinite(t) || t < 0) return null;

    // Try a few possible bases, depending on whether active is first/last/day/month/year.
    const candidateBases = [t, t - 1, t - 2, t - 3, t - 4].filter((n) =>
      Number.isFinite(n),
    );

    for (const base of candidateBases) {
      const fn = document.querySelector(
        `input[name="first-name"][tabindex="${base}"]`,
      );
      const ln = document.querySelector(
        `input[name="last-name"][tabindex="${base + 1}"]`,
      );
      const day = document.querySelector(`select[tabindex="${base + 2}"]`);
      const month = document.querySelector(`select[tabindex="${base + 3}"]`);
      const year = document.querySelector(`select[tabindex="${base + 4}"]`);
      if (fn && ln && day && month && year) {
        return { fn, ln, day, month, year };
      }
    }

    return null;
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

  const passengerRoot = findPassengerContainerFromActive();
  const tabGroup = findByTabIndexGroup();

  const firstNameInput =
    tabGroup?.fn ||
    passengerRoot?.querySelector?.('input[name="first-name"]') ||
    passengerRoot?.querySelector?.('input[nagish-text="passenger first name"]') ||
    document.querySelector('input[name="first-name"]') ||
    document.querySelector('input[nagish-text="passenger first name"]');
  const lastNameInput =
    tabGroup?.ln ||
    passengerRoot?.querySelector?.('input[name="last-name"]') ||
    passengerRoot?.querySelector?.('input[nagish-text="passenger last name"]') ||
    document.querySelector('input[name="last-name"]') ||
    document.querySelector('input[nagish-text="passenger last name"]');

  const okFirst = setInputValueWithEvents(firstNameInput, firstName);
  const okLast = setInputValueWithEvents(lastNameInput, lastName);

  const [dd, mm, yyyy] = (birthdate || "").split("/");
  const birthPicker =
    passengerRoot?.querySelector?.('[id$="birthdatePicker"]') ||
    passengerRoot ||
    document;
  const allSelects = Array.from(
    birthPicker.querySelectorAll?.("select") || document.querySelectorAll("select"),
  );

  const yearSelect =
    tabGroup?.year ||
    allSelects.find((s) => s.querySelector('option[value="YYYY"]'));
  const monthSelect =
    tabGroup?.month ||
    allSelects.find((s) => s.querySelector('option[value="MM"]'));
  const daySelect =
    tabGroup?.day ||
    allSelects.find((s) => s.querySelector('option[value="DD"]'));

  const okYear = yyyy ? setSelectValueWithEvents(yearSelect, yyyy) : false;
  const okMonth = mm ? setSelectValueWithEvents(monthSelect, mm) : false;
  const okDay = dd ? setSelectValueWithEvents(daySelect, dd) : false;

  return { okFirst, okLast, okYear, okMonth, okDay };
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  const tabId = tab?.id;
  if (!tabId) return;

  // Always generate a fresh passenger per right-click action.
  const passenger = generatePassenger();
  chrome.storage.local.set({ [STORAGE_KEY]: passenger }, () => {
    chrome.scripting.executeScript({
      target: { tabId },
      func: fillPassengerForm,
      args: [passenger],
    });
  });
});
