# MrRabbitTools

A minimal Chrome Extension (Manifest V3) with a React popup built using Vite. The popup contains a single button that logs "Hey" to the console.

## Development

- Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:5173/popup.html` for local development.

## Build

```bash
npm run build
```

This outputs the extension into `dist/`.

## Load in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist/` folder.
4. Click the extension icon to open the popup; press the button and check the DevTools console to see `Hey` logged.
