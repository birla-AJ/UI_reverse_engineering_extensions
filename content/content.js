console.log("UI Reverse Engineer Loaded");

let currentProject = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true;
});

async function handleMessage(message, sendResponse) {
  try {
    if (message.action === "START_ANALYSIS") {
      const timer =
        typeof startTimer === "function" ? startTimer() : performance.now();
      const result = {
        metadata: {
          title: document.title,
          url: location.href,
          timestamp: new Date().toISOString(),
        },
        navbar: detectNavbar(),
        hero: detectHero(),
        footer: detectFooter(),
        behaviors:
          typeof detectBehaviors === "function" ? detectBehaviors() : {},
        hover:
          typeof detectHoverElements === "function"
            ? detectHoverElements()
            : [],
      };
      if (typeof logInfo === "function") {
        logInfo("Analysis Result", result);
      }
      if (typeof generateProject === "function") {
        currentProject = generateProject(result);
      }
      await chrome.storage.local.set({
        lastAnalysis: {
          components: countComponents(result),
          assets: countAssets(),
          exports: 1,
          title: result.metadata.title,
          time: new Date().toLocaleTimeString(),
        },
      });
      if (typeof endTimer === "function") {
        endTimer(timer, "Analysis");
      }
      console.log("Analysis Complete");
      sendResponse({
        success: true,
      });
    } else if (message.action === "EXPORT_PROJECT") {
      if (!currentProject) {
        alert("Please analyze the website first.");
        sendResponse({
          success: false,
        });
        return;
      }
      if (typeof exportProject === "function") {
        await exportProject(currentProject);
      }
      sendResponse({
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    sendResponse({
      success: false,
    });
  }
}

function detectNavbar() {
  const nav = document.querySelector("nav");
  if (!nav) {
    return null;
  }
  return {
    selector: getSelector(nav),
    links: nav.querySelectorAll("a").length,
  };
}

function detectHero() {
  const hero = document.querySelector("main section");
  if (!hero) {
    return null;
  }
  return {
    selector: getSelector(hero),
  };
}

function detectFooter() {
  const footer = document.querySelector("footer");
  if (!footer) {
    return null;
  }
  return {
    selector: getSelector(footer),
  };
}

function getSelector(el) {
  if (!el) {
    return "";
  }
  if (el.id) {
    return "#" + el.id;
  }
  return el.tagName.toLowerCase();
}

function countComponents(result) {
  let total = 0;
  if (result.navbar) {
    total++;
  }
  if (result.hero) {
    total++;
  }
  if (result.footer) {
    total++;
  }
  return total;
}

function countAssets() {
  return document.images.length;
}
