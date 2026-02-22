# HTML Side Viewer

Chrome extension that captures the current page HTML and shows it as plain text in a side panel or standalone tab.

## Features

- Capture `document.documentElement.outerHTML` from a page
- View HTML safely as text (not rendered/executed)
- Search within captured HTML with colored match highlighting
- Copy captured HTML to clipboard
- Download captured HTML as `page.html`
- Open the viewer in a separate tab while keeping full functionality
- Action feedback messages for capture/copy/download/open-tab actions
- Improved UI styling and readability in both side panel and tab mode
- Click the pinned extension icon to open the side panel directly

## Project Files

- `manifest.json` - Extension manifest (MV3)
- `sidepanel.html` - Side panel UI
- `viewer.html` - Standalone tab UI
- `sidepanel.js` - Shared viewer logic for both UIs
- `sw.js` - Minimal background service worker
- `icons/` - Extension logos (`.svg` sources + Chrome PNG sizes)

## Recent Improvements

- Added standalone `viewer.html` mode with source-tab targeting support
- Replaced `<<<...>>>` marker search output with real `<mark>` highlighting
- Added status line feedback for success/error events after button actions
- Improved visual theme (buttons, colors, spacing)
- Improved code readability in output area (monospace + preserved indentation/newlines)

## Load In Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

## Usage

1. Open any webpage
2. Open the extension side panel
3. Click **Capture HTML**
4. Use **Search HTML (text)** to highlight matches in the captured snapshot
5. Use **Copy** to copy HTML to clipboard
6. Use **Download** to save HTML as `page.html`
7. Use **Open in Tab** to open the same viewer workflow in a standalone tab

## Search Behavior

- Search runs against the last captured HTML snapshot (not the live page)
- Matching is case-insensitive
- Matches are highlighted in color using `<mark>`
- Rendering preserves original indentation and line breaks

## Notes

- Some restricted pages (for example Chrome internal pages) do not allow script injection, so capture can fail there.
