const ENG_TO_HEB = {
  a: "ש",
  b: "נ",
  c: "ב",
  d: "ג",
  e: "ק",
  f: "כ",
  g: "ע",
  h: "י",
  i: "ן",
  j: "ח",
  k: "ל",
  l: "ך",
  m: "צ",
  n: "מ",
  o: "ם",
  p: "פ",
  q: "/",
  r: "ר",
  s: "ד",
  t: "א",
  u: "ו",
  v: "ה",
  w: "'",
  x: "ס",
  y: "ט",
  z: "ז",
  A: "ש",
  B: "נ",
  C: "ב",
  D: "ג",
  E: "ק",
  F: "כ",
  G: "ע",
  H: "י",
  I: "ן",
  J: "ח",
  K: "ל",
  L: "ך",
  M: "צ",
  N: "מ",
  O: "ם",
  P: "פ",
  Q: "/",
  R: "ר",
  S: "ד",
  T: "א",
  U: "ו",
  V: "ה",
  W: "'",
  X: "ס",
  Y: "ט",
  Z: "ז",
  // punctuation on Hebrew keyboard layout
  ",": "ת",
  ".": "ץ",
};

const HEB_TO_ENG = Object.entries(ENG_TO_HEB).reduce((acc, [eng, heb]) => {
  acc[heb] = eng.toLowerCase();
  return acc;
}, {});

export function translateJibrish(inputValue) {
  const englishCount = (inputValue.match(/[A-Za-z]/g) || []).length;
  const hebrewCount = (inputValue.match(/[\u0590-\u05FF]/g) || []).length;
  const direction = hebrewCount > englishCount ? "hebToEng" : "engToHeb";

  return direction === "engToHeb"
    ? inputValue
        .split("")
        .map((ch) => ENG_TO_HEB[ch] || ch)
        .join("")
    : inputValue
        .split("")
        .map((ch) => HEB_TO_ENG[ch] || ch)
        .join("");
}


