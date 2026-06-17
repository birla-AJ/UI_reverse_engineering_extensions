console.log("UI Reverse Engineer Loaded");

let currentProject = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true;
});

async function handleMessage(message, sendResponse) {
  try {
    if (message.action === "START_ANALYSIS") {
      const siteWarning =
        typeof getProtectedWebsiteWarning === "function"
          ? getProtectedWebsiteWarning()
          : "";

      await waitForPageToStabilize();

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
          url: result.metadata.url,
          timestamp: result.metadata.timestamp,
          time: new Date().toLocaleTimeString(),
          warning: siteWarning,
        },
      });
      if (typeof endTimer === "function") {
        endTimer(timer, "Analysis");
      }
      console.log("Analysis Complete");
      sendResponse({
        success: true,
        warning: siteWarning,
      });
    } else if (message.action === "EXPORT_ADD_PAGE") {
      if (!currentProject) {
        sendResponse({
          success: false,
          message: "Please analyze this page first.",
        });
        return;
      }

      // Same-site guard: a session may only mix pages from one hostname.
      const status =
        typeof getSessionStatus === "function"
          ? await getSessionStatus()
          : { pageCount: 0, hostname: location.hostname };
      if (
        status.pageCount > 0 &&
        status.hostname &&
        status.hostname !== location.hostname
      ) {
        sendResponse({
          success: false,
          needsReset: true,
          message: `This clone already has ${status.pageCount} page(s) from ${status.hostname}. Finish & download it, or reset, before capturing ${location.hostname}.`,
        });
        return;
      }

      if (typeof exportProject === "function") {
        await exportProject(currentProject);
      }

      let result = { pageCount: 1, hostname: location.hostname };
      if (typeof savePageToSession === "function") {
        result = await savePageToSession(currentProject);
      }

      await chrome.storage.local.set({
        lastExport: {
          title: currentProject.analysis?.metadata?.title || document.title,
          url: location.href,
          time: new Date().toLocaleTimeString(),
        },
      });

      sendResponse({
        success: true,
        pageCount: result.pageCount,
        hostname: result.hostname,
      });
    } else if (message.action === "EXPORT_FINISH") {
      if (typeof combineSessionToZip !== "function") {
        sendResponse({ success: false, message: "Export engine unavailable." });
        return;
      }
      const result = await combineSessionToZip();
      sendResponse({ success: true, pageCount: result.pageCount });
    } else if (message.action === "SESSION_STATUS") {
      const status =
        typeof getSessionStatus === "function"
          ? await getSessionStatus()
          : { pageCount: 0, hostname: location.hostname, pages: [] };
      sendResponse({ success: true, ...status });
    } else if (message.action === "SESSION_RESET") {
      if (typeof clearSession === "function") {
        await clearSession();
      }
      sendResponse({ success: true });
    }
  } catch (error) {
    let response = {
      success: false,
      message: error?.message || "Unknown error"
    }
    if (typeof handleError === "function") {
      const result = handleError(error, "Analysis")
      response.message = result.message
    }
    else {
      console.error(error)
    }
    sendResponse(response)
  }
}

function waitForPageToStabilize() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
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
