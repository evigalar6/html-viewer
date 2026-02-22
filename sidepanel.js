// Shared viewer logic for side panel and standalone tab pages.
const out = document.getElementById('out');
const q = document.getElementById('q');
const grabBtn = document.getElementById('grab');
const openTabBtn = document.getElementById('openTab');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');
const status = document.getElementById('status');

const params = new URLSearchParams(window.location.search);
const initialSourceTabId = Number.parseInt(params.get("sourceTabId") || "", 10);

let lastHtml = "";
let sourceTabId = Number.isInteger(initialSourceTabId) ? initialSourceTabId : null;
const extensionPagePrefix = chrome.runtime.getURL("");
let statusTimer = null;

function setStatus(message, tone = "info") {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.className = `status ${tone}`;
  if (statusTimer) {
    clearTimeout(statusTimer);
  }
  statusTimer = setTimeout(() => {
    status.textContent = "";
    status.className = "status";
  }, 2800);
}

function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Render as escaped text and highlight current matches.
function render() {
  const needle = q.value.trim();
  const escapedHtml = escapeHtml(lastHtml);

  if (!needle) {
    out.textContent = lastHtml;
    return;
  }

  const escapedNeedle = escapeHtml(needle);
  const pattern = new RegExp(escapeRegExp(escapedNeedle), "gi");
  out.innerHTML = escapedHtml.replace(pattern, "<mark>$&</mark>");
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
    setStatus("No source tab found.", "error");
    return;
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.documentElement.outerHTML
  });

  lastHtml = result || "";
  render();
  setStatus("HTML captured.", "success");
}

grabBtn.addEventListener('click', async () => {
  try {
    await captureHtml();
  } catch (error) {
    out.textContent = `Failed to capture HTML: ${error?.message || "Unknown error"}`;
    setStatus("Capture failed.", "error");
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
    setStatus("Opened in a new tab.", "success");
  } catch (error) {
    out.textContent = `Failed to open tab viewer: ${error?.message || "Unknown error"}`;
    setStatus("Could not open tab viewer.", "error");
  }
});

q.addEventListener('input', () => {
  // Search runs locally on the captured snapshot.
  render();
});

copyBtn.addEventListener('click', async () => {
  try {
    if (!lastHtml) {
      setStatus("Nothing to copy. Capture HTML first.", "error");
      return;
    }
    await navigator.clipboard.writeText(lastHtml);
    setStatus("Copied to clipboard.", "success");
  } catch (error) {
    out.textContent = `Failed to copy HTML: ${error?.message || "Unknown error"}`;
    setStatus("Copy failed.", "error");
  }
});

downloadBtn.addEventListener('click', async () => {
  try {
    if (!lastHtml) {
      setStatus("Nothing to download. Capture HTML first.", "error");
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
    setStatus("Download started.", "success");
  } catch (error) {
    out.textContent = `Failed to download HTML: ${error?.message || "Unknown error"}`;
    setStatus("Download failed.", "error");
  }
});
