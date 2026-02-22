// Shared viewer logic for side panel and standalone tab pages.
const out = document.getElementById('out');
const q = document.getElementById('q');
const grabBtn = document.getElementById('grab');
const openTabBtn = document.getElementById('openTab');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');

const params = new URLSearchParams(window.location.search);
const initialSourceTabId = Number.parseInt(params.get("sourceTabId") || "", 10);

let lastHtml = "";
let sourceTabId = Number.isInteger(initialSourceTabId) ? initialSourceTabId : null;
const extensionPagePrefix = chrome.runtime.getURL("");

// Filter rendered output with a simple text search.
function render() {
  const needle = q.value.trim();
  const view = needle ? lastHtml.split(needle).join(`<<<${needle}>>>`) : lastHtml;
  out.textContent = view;
}

async function resolveSourceTabId() {
  if (sourceTabId) {
    return sourceTabId;
  }

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isExtensionPage = !!activeTab?.url?.startsWith(extensionPagePrefix);

  if (activeTab?.id && !isExtensionPage) {
    sourceTabId = activeTab.id;
    return sourceTabId;
  }

  return null;
}

async function captureHtml() {
  const tabId = await resolveSourceTabId();
  if (!tabId) {
    out.textContent = "No source tab found.";
    return;
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.documentElement.outerHTML
  });

  lastHtml = result || "";
  render();
}

grabBtn.addEventListener('click', async () => {
  try {
    await captureHtml();
  } catch (error) {
    out.textContent = `Failed to capture HTML: ${error?.message || "Unknown error"}`;
  }
});

openTabBtn.addEventListener('click', async () => {
  try {
    const tabId = await resolveSourceTabId();
    const url = new URL(chrome.runtime.getURL("viewer.html"));

    if (tabId) {
      url.searchParams.set("sourceTabId", String(tabId));
    }

    await chrome.tabs.create({
      url: url.toString(),
      openerTabId: tabId || undefined
    });
  } catch (error) {
    out.textContent = `Failed to open tab viewer: ${error?.message || "Unknown error"}`;
  }
});

q.addEventListener('input', () => {
  // Search runs locally on the captured snapshot.
  render();
});

copyBtn.addEventListener('click', async () => {
  try {
    if (!lastHtml) {
      out.textContent = "Nothing to copy. Capture HTML first.";
      return;
    }
    await navigator.clipboard.writeText(lastHtml);
  } catch (error) {
    out.textContent = `Failed to copy HTML: ${error?.message || "Unknown error"}`;
  }
});

downloadBtn.addEventListener('click', async () => {
  try {
    if (!lastHtml) {
      out.textContent = "Nothing to download. Capture HTML first.";
      return;
    }

    const blob = new Blob([lastHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url,
      filename: "page.html",
      saveAs: true
    });
    URL.revokeObjectURL(url);
  } catch (error) {
    out.textContent = `Failed to download HTML: ${error?.message || "Unknown error"}`;
  }
});
