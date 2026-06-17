const analyze = document.getElementById("analyze");

const exportBtn = document.getElementById("export");

const aiPromptBtn = document.getElementById("aiPrompt");

const content = document.getElementById("tabContent");

const analysisWarning = document.getElementById("analysisWarning");

const statusLabel = document.getElementById("statusLabel");

const progressTrack = document.getElementById("progressTrack");

const progressBar = document.getElementById("progressBar");

const aiPromptPanel = document.getElementById("aiPromptPanel");

const closeAiPrompt = document.getElementById("closeAiPrompt");

const techSelect = document.getElementById("techSelect");

const promptOutput = document.getElementById("promptOutput");

const copyPrompt = document.getElementById("copyPrompt");

const sessionPanel = document.getElementById("sessionPanel");

const sessionInfo = document.getElementById("sessionInfo");

const finishExport = document.getElementById("finishExport");

const resetSession = document.getElementById("resetSession");

const tabs = document.querySelectorAll(".tab");

let progressTimer = null;

let progressValue = 0;

let hasCompletedAnalysis = false;

let hasCompletedExport = false;

tabs.forEach((tab) => {
  tab.addEventListener(
    "click",

    () => {
      openTab(tab.dataset.tab);
    },
  );
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== "EXPORT_PROGRESS") {
    return;
  }

  setStatus(message.label || "Creating ZIP...", true, message.progress || progressValue);
});

analyze.addEventListener(
  "click",

  async () => {
    try {
      setProgressState("analyzing");

      const [tab] = await chrome.tabs.query({
        active: true,

        currentWindow: true,
      });

      const response = await chrome.tabs.sendMessage(
        tab.id,

        {
          action: "START_ANALYSIS",
        },
      );

      setAnalysisWarning(response?.warning || "");
      await captureReferenceScreenshot(tab);

      await loadDashboard();
      await refreshSessionStatus();

      hasCompletedAnalysis = true;
      setProgressState("ready");
    } catch (error) {
      console.error(error);
      setProgressState("ready", "Analysis failed");
      setAnalysisWarning(error?.message || "Analysis failed. Please try again.");
    }
  },
);

exportBtn.addEventListener(
  "click",

  async () => {
    try {
      setProgressState("exporting", "Capturing page...");

      const [tab] = await chrome.tabs.query({
        active: true,

        currentWindow: true,
      });

      const response = await chrome.tabs.sendMessage(
        tab.id,

        {
          action: "EXPORT_ADD_PAGE",
        },
      );

      setAnalysisWarning(response?.success ? "" : response?.message || "");
      if (response?.success) {
        hasCompletedAnalysis = false;
        hasCompletedExport = true;
        renderSession(response.pageCount, response.hostname);
        setProgressState("ready", `Page added (${response.pageCount} captured)`);
        return;
      }
      setProgressState("ready");
    } catch (error) {
      console.error(error);
      setProgressState("ready", "Capture failed");
      setAnalysisWarning(error?.message || "Capture failed. Please try again.");
    }
  },
);

finishExport.addEventListener("click", async () => {
  try {
    setProgressState("exporting", "Building ZIP...");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "EXPORT_FINISH",
    });

    if (response?.success) {
      hideSession();
      hasCompletedExport = false;
      setProgressState("ready", `Downloaded ${response.pageCount} page(s)`);
      setAnalysisWarning("");
    } else {
      setProgressState("ready");
      setAnalysisWarning(response?.message || "Download failed.");
    }
  } catch (error) {
    console.error(error);
    setProgressState("ready", "Download failed");
    setAnalysisWarning(error?.message || "Download failed. Please try again.");
  }
});

resetSession.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    await chrome.tabs.sendMessage(tab.id, { action: "SESSION_RESET" });
    hideSession();
    hasCompletedExport = false;
    setAnalysisWarning("");
    setProgressState("ready", "Session cleared");
  } catch (error) {
    console.error(error);
    setAnalysisWarning("Could not reset the session.");
  }
});

aiPromptBtn.addEventListener("click", () => {
  if (aiPromptBtn.disabled) {
    return;
  }

  aiPromptPanel.hidden = false;
  updateAiPrompt();
});

closeAiPrompt.addEventListener("click", () => {
  aiPromptPanel.hidden = true;
});

techSelect.addEventListener("change", updateAiPrompt);

copyPrompt.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(promptOutput.value);
    setStatus("Prompt copied", false, 100);
    setTimeout(() => setProgressState("ready"), 1200);
  } catch (error) {
    promptOutput.select();
    setAnalysisWarning("Copy failed. Select the prompt text and copy it manually.");
  }
});

function openTab(name) {
  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  document

    .querySelector(`[data-tab="${name}"]`)

    .classList.add("active");

  if (name === "dashboard") {
    renderDashboard();
  }

  if (name === "exports") {
    renderExports();
  }

  if (name === "design") {
    renderDesign();
  }

  if (name === "settings") {
    renderSettings();
  }
}

async function loadDashboard() {
  const data = await chrome.storage.local.get("lastAnalysis");

  window.dashboardData = data.lastAnalysis || {};

  hasCompletedAnalysis = false;
  hasCompletedExport = false;
  exportBtn.disabled = true;
  updateExportButtonState();
  updateAiButtonState();

  setAnalysisWarning(window.dashboardData.warning || "");

  renderDashboard();
}

function setAnalysisWarning(message) {
  if (!analysisWarning) {
    return;
  }

  analysisWarning.textContent = message;
  analysisWarning.hidden = !message;
}

function renderSession(pageCount, hostname) {
  if (!sessionPanel) {
    return;
  }

  if (!pageCount) {
    hideSession();
    return;
  }

  const host = hostname ? ` from ${hostname}` : "";
  sessionInfo.textContent = `${pageCount} page(s) captured${host}. Navigate to another page of this site and click Add Page, or finish below.`;
  sessionPanel.hidden = false;
}

function hideSession() {
  if (sessionPanel) {
    sessionPanel.hidden = true;
  }
}

async function refreshSessionStatus() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const status = await chrome.tabs.sendMessage(tab.id, {
      action: "SESSION_STATUS",
    });

    if (status?.success && status.pageCount > 0) {
      hasCompletedExport = true;
      aiPromptBtn.disabled = false;
      renderSession(status.pageCount, status.hostname);
      updateAiButtonState();
    } else {
      hideSession();
    }
  } catch (error) {
    hideSession();
  }
}

function setProgressState(state, labelOverride) {
  stopProgress();

  if (state === "analyzing") {
    analyze.disabled = true;
    exportBtn.disabled = true;
    aiPromptBtn.disabled = true;
    updateExportButtonState();
    updateAiButtonState();
    setStatus(labelOverride || "Analyzing website...", true, 12);
    startProgress(12, 88);
    return;
  }

  if (state === "exporting") {
    analyze.disabled = true;
    exportBtn.disabled = true;
    aiPromptBtn.disabled = true;
    updateExportButtonState();
    updateAiButtonState();
    setStatus(labelOverride || "Creating ZIP...", true, 18);
    startProgress(18, 92);
    return;
  }

  analyze.disabled = false;
  exportBtn.disabled = !hasCompletedAnalysis;
  aiPromptBtn.disabled = !hasCompletedExport;
  updateExportButtonState();
  updateAiButtonState();
  setStatus(labelOverride || "Ready", false, 100);
}

function setStatus(label, showProgress, progress) {
  statusLabel.textContent = label;
  progressTrack.hidden = !showProgress;
  progressValue = progress;
  progressBar.style.width = `${progress}%`;
}

function startProgress(start, max) {
  progressValue = start;
  progressTimer = setInterval(() => {
    const remaining = max - progressValue;
    const step = Math.max(0.5, remaining * 0.12);
    progressValue = Math.min(max, progressValue + step);
    progressBar.style.width = `${progressValue}%`;
  }, 450);
}

function stopProgress() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function updateExportButtonState() {
  exportBtn.classList.toggle("ready", !exportBtn.disabled);
}

function updateAiButtonState() {
  aiPromptBtn.classList.toggle("ready", !aiPromptBtn.disabled);
}

async function captureReferenceScreenshot(tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    await chrome.storage.local.set({
      referenceScreenshot: {
        dataUrl,
        title: tab.title || "",
        url: tab.url || "",
        capturedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn("Reference screenshot unavailable", error);
  }
}

function updateAiPrompt() {
  promptOutput.value = buildAiPrompt(techSelect.value, window.dashboardData || {});
}

function buildAiPrompt(technology, data) {
  const title = data.title || "Exported Website Clone";
  const sourceUrl = data.url || "Unknown";
  const componentCount = data.components || 0;
  const assetCount = data.assets || 0;
  const tech = getTechnologyConfig(technology);

  return `You are working inside an extracted website clone export folder generated by UI Reverse Engineer Pro.

Goal:
Create a production-ready ${tech.label} project from this export. The result must visually and functionally match the exported clone as closely as possible.

Project context:
- Original page title: ${title}
- Original URL: ${sourceUrl}
- Detected components: ${componentCount}
- Detected assets: ${assetCount}
- The folder contains index.html, styles.css, interactions.js, assets/, reports/, manifest/, and ai/.
- If present, reference/viewport.png is the visual screenshot target.

Important requirements:
1. Treat index.html and styles.css as the visual source of truth.
2. Use the existing exported HTML/CSS/assets as the visual source of truth.
3. Preserve layout, spacing, colors, typography, images, icons, tables, cards, form states, dropdowns, tabs, hover states, and responsive behavior.
4. Rebuild the UI into idiomatic ${tech.label} structure, not a single messy file.
5. Keep all local assets working from the assets/ folder.
6. Preserve interactions from interactions.js where possible: dropdowns, tabs, forms, hash links, hover states, sticky elements.
7. Remove unsafe scripts and browser-extension artifacts if present, but keep visual markup and behavior.
8. Add accessibility basics: semantic landmarks, alt text where possible, keyboard-safe controls, and readable focus states.
9. Create a runnable project with these commands:
   ${tech.installCommand}
   ${tech.runCommand}
10. After implementation, run the app locally and compare against index.html and reference/viewport.png at desktop and mobile widths. Fix visible differences before stopping.

Preferred output:
- Create or update package.json.
- Create the ${tech.entryFiles} files needed for the app.
- Keep a short README with setup and run commands.
- Do not fetch remote assets unless absolutely necessary; use local exported assets first.
- Keep generated code maintainable, but prioritize exact visual fidelity over refactoring elegance.
- Do not stop after scaffolding. Finish until npm install and ${tech.runCommand} work.

Technology-specific instructions:
${tech.instructions}

Validation checklist before final response:
- App starts successfully.
- No broken local asset paths.
- If reference/viewport.png exists, the rendered app visually matches it.
- Header/nav, hero/title area, content cards/tables, buttons, icons, forms, and footer/widget areas match index.html.
- Major interactions work or have static fallback behavior.
- README includes exact run commands.

Start by inspecting index.html, styles.css, interactions.js, reports/analysis.json, manifest/asset-manifest.json, ai/build-prompts.md, and assets/. Then build the runnable clone completely.`;
}

function getTechnologyConfig(technology) {
  const configs = {
    react: {
      label: "React + Vite",
      installCommand: "npm install",
      runCommand: "npm run dev",
      entryFiles: "src/App.jsx, src/main.jsx, and src/App.css",
      instructions:
        "Use functional React components. Split the page into Header, HeroTitle, DashboardSection, DataCard/Table, and HelpWidget components when they exist. Prefer CSS modules or plain CSS imported into React.",
    },
    next: {
      label: "Next.js",
      installCommand: "npm install",
      runCommand: "npm run dev",
      entryFiles: "app/page.jsx, app/layout.jsx, and app/globals.css",
      instructions:
        "Use the App Router. Keep this as a client-safe static UI unless interaction needs client components. Use public/assets for exported assets and preserve file paths cleanly.",
    },
    angular: {
      label: "Angular",
      installCommand: "npm install",
      runCommand: "npm start",
      entryFiles: "src/app/app.component.ts, app.component.html, and app.component.css",
      instructions:
        "Create Angular components for major layout regions. Use Angular templates and component CSS. Keep data-driven repeated table/card rows as arrays in the component where practical.",
    },
    vue: {
      label: "Vue + Vite",
      installCommand: "npm install",
      runCommand: "npm run dev",
      entryFiles: "src/App.vue, src/main.js, and src/style.css",
      instructions:
        "Use Vue single-file components. Split major sections into components if the page has repeated blocks. Keep static data in component state or simple arrays.",
    },
    html: {
      label: "HTML/CSS/JavaScript",
      installCommand: "npm install",
      runCommand: "npm run dev",
      entryFiles: "index.html, src/styles.css, and src/main.js",
      instructions:
        "Create a clean Vite static project. Keep semantic HTML, move styles into organized CSS files, and move small interactions into src/main.js.",
    },
  };

  return configs[technology] || configs.react;
}

async function loadAppVersion() {
  const versionEl = document.getElementById("appVersion");
  if (!versionEl) {
    return;
  }

  try {
    const response = await fetch(chrome.runtime.getURL("version.json"));
    const data = await response.json();
    if (data?.version) {
      versionEl.textContent = `v${data.version}`;
      return;
    }
  } catch (error) {
    // Fall back to the manifest version below.
  }

  try {
    versionEl.textContent = `v${chrome.runtime.getManifest().version}`;
  } catch (error) {
    // Leave the static fallback already in the markup.
  }
}

loadDashboard();
refreshSessionStatus();
loadAppVersion();
