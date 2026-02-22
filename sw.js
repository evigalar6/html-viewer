async function enableOpenOnActionClick() {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.warn("Failed to set side panel click behavior:", error);
  }
}

// Open the side panel when the extension action (toolbar icon) is clicked.
chrome.runtime.onInstalled.addListener(() => {
  enableOpenOnActionClick();
});

// Also apply behavior on startup in case extension state was restored.
chrome.runtime.onStartup.addListener(() => {
  enableOpenOnActionClick();
});
