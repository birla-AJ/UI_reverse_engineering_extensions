const analyze = document.getElementById("analyze");

const exportBtn = document.getElementById("export");

const content = document.getElementById("tabContent");

const tabs = document.querySelectorAll(".tab");

tabs.forEach((tab) => {
  tab.addEventListener(
    "click",

    () => {
      openTab(tab.dataset.tab);
    },
  );
});

analyze.addEventListener(
  "click",

  async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,

        currentWindow: true,
      });

      await chrome.tabs.sendMessage(
        tab.id,

        {
          action: "START_ANALYSIS",
        },
      );

      exportBtn.disabled = false;

      loadDashboard();
    } catch (error) {
      console.error(error);
    }
  },
);

exportBtn.addEventListener(
  "click",

  async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,

        currentWindow: true,
      });

      await chrome.tabs.sendMessage(
        tab.id,

        {
          action: "EXPORT_PROJECT",
        },
      );
    } catch (error) {
      console.error(error);
    }
  },
);

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

  renderDashboard();
}

loadDashboard();
