# HTML Side Viewer

Chrome extension that captures the current page HTML and shows it as plain text in a side panel or standalone tab.

## Features

- Capture `document.documentElement.outerHTML` from a page
- View HTML safely as text (not rendered/executed)
- Search within captured HTML
- Copy captured HTML to clipboard
- Download captured HTML as `page.html`
- Open the same viewer in a separate tab

## Project Files

- `manifest.json` - Extension manifest (MV3)
- `sidepanel.html` - Side panel UI
- `viewer.html` - Standalone tab UI
- `sidepanel.js` - Shared viewer logic for both UIs
- `sw.js` - Minimal background service worker

## Load In Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

## Usage

1. Open any webpage
2. Open the extension side panel
3. Click **Capture HTML**
4. Optionally use:
   - **Search HTML (text)**
   - **Copy**
   - **Download**
   - **Open in Tab** (opens standalone viewer with same functionality)

## Notes

- Some restricted pages (for example Chrome internal pages) do not allow script injection, so capture can fail there.
