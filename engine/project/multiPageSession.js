// Multi-page capture session.
//
// Each "Add page" stores the captured page (HTML/CSS/JS + its asset blobs) into
// IndexedDB instead of downloading immediately. IndexedDB is per-origin, so all
// pages of the same site (same scheme+host+port, different paths) share one
// store automatically. "Finish & Download" combines every saved page into a
// single ZIP: one folder per page plus one shared, de-duplicated assets/ folder.
//
// NOTE: a different subdomain (www. vs app.) is a different origin and would not
// see the same session. The same-site guard in content.js warns when hostnames
// differ.

const UIRE_SESSION_DB = "uire-multipage-session";
const UIRE_SESSION_DB_VERSION = 1;

function openSessionDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(UIRE_SESSION_DB, UIRE_SESSION_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("pages")) {
        db.createObjectStore("pages", { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains("assets")) {
        db.createObjectStore("assets", { keyPath: "url" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function sessionStore(db, name, mode) {
  return db.transaction(name, mode).objectStore(name);
}

function sessionRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Saves the current page's generated files + downloaded asset blobs. Keyed by
// URL, so re-capturing the same page overwrites rather than duplicating it.
async function savePageToSession(project) {
  const db = await openSessionDb();
  const url = project.analysis?.metadata?.url || location.href;

  let screenshotDataUrl = "";
  try {
    const stored = await chrome.storage.local.get("referenceScreenshot");
    screenshotDataUrl = stored.referenceScreenshot?.dataUrl || "";
  } catch (error) {
    screenshotDataUrl = "";
  }

  const pageBundle = {
    url,
    hostname: location.hostname,
    title: project.analysis?.metadata?.title || document.title || url,
    html: project.export?.indexHtml || "",
    css: project.export?.stylesCss || "",
    js: project.export?.interactionsJs || "",
    analysisJson: project.export?.analysisJson || "{}",
    designSystemJson: project.export?.designSystemJson || "{}",
    screenshotDataUrl,
    capturedAt: new Date().toISOString(),
  };

  await sessionRequest(sessionStore(db, "pages", "readwrite").put(pageBundle));

  const groups = ["images", "videos", "fonts"];
  for (const group of groups) {
    for (const asset of project.downloadedAssets?.[group] || []) {
      if (!asset?.url || !asset?.blob || !asset?.filename) {
        continue;
      }
      await sessionRequest(
        sessionStore(db, "assets", "readwrite").put({
          url: asset.url,
          group,
          filename: asset.filename,
          blob: asset.blob,
        }),
      );
    }
  }

  const pages = await sessionRequest(sessionStore(db, "pages", "readonly").getAll());
  db.close();
  return { pageCount: pages.length, hostname: location.hostname };
}

async function getSessionStatus() {
  try {
    const db = await openSessionDb();
    const pages = await sessionRequest(
      sessionStore(db, "pages", "readonly").getAll(),
    );
    db.close();
    return {
      pageCount: pages.length,
      hostname: pages[0]?.hostname || location.hostname,
      pages: pages.map((page) => ({ url: page.url, title: page.title })),
    };
  } catch (error) {
    return { pageCount: 0, hostname: location.hostname, pages: [] };
  }
}

async function clearSession() {
  const db = await openSessionDb();
  await sessionRequest(sessionStore(db, "pages", "readwrite").clear());
  await sessionRequest(sessionStore(db, "assets", "readwrite").clear());
  db.close();
}

// Combines every saved page into one ZIP and triggers the download.
async function combineSessionToZip() {
  if (typeof JSZip === "undefined") {
    throw new Error("ZIP library unavailable. Reload the page and try again.");
  }

  const db = await openSessionDb();
  const pages = await sessionRequest(
    sessionStore(db, "pages", "readonly").getAll(),
  );
  const assets = await sessionRequest(
    sessionStore(db, "assets", "readonly").getAll(),
  );
  db.close();

  if (!pages.length) {
    throw new Error("No pages captured yet. Analyze and add a page first.");
  }

  const zip = new JSZip();

  // Shared, de-duplicated assets (keyed by URL in IndexedDB, so already unique).
  for (const asset of assets) {
    if (asset.blob && asset.filename) {
      zip.file(`assets/${asset.group}/${asset.filename}`, asset.blob);
    }
  }

  const usedSlugs = new Set();
  const pageLinks = [];

  for (const page of pages) {
    const slug = uniquePageSlug(page.url, usedSlugs);
    const folder = `pages/${slug}`;

    zip.file(`${folder}/index.html`, prefixSharedAssetPaths(page.html));
    zip.file(`${folder}/styles.css`, prefixSharedAssetPaths(page.css));
    zip.file(`${folder}/interactions.js`, page.js || "");
    zip.file(`${folder}/analysis.json`, page.analysisJson || "{}");

    if (page.screenshotDataUrl && typeof dataUrlToBlob === "function") {
      const shot = dataUrlToBlob(page.screenshotDataUrl);
      if (shot) {
        zip.file(`${folder}/reference.png`, shot);
      }
    }

    pageLinks.push({ slug, title: page.title, url: page.url });
  }

  zip.file("index.html", buildSiteLandingHtml(pages[0]?.hostname || "", pageLinks));
  zip.file("ai/build-prompts.md", buildMultiPagePrompts(pages[0]?.hostname || "", pageLinks));
  zip.file(
    "manifest/site-manifest.json",
    JSON.stringify(
      {
        hostname: pages[0]?.hostname || "",
        pageCount: pages.length,
        assetCount: assets.length,
        generatedAt: new Date().toISOString(),
        pages: pageLinks,
      },
      null,
      2,
    ),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${sanitizeHostname(pages[0]?.hostname)}-multipage-export.zip`;
  anchor.click();
  URL.revokeObjectURL(objectUrl);

  await clearSession();
  return { pageCount: pages.length };
}

// Pages live in pages/<slug>/, so asset references that point at the shared
// root assets/ folder need to climb two directories.
function prefixSharedAssetPaths(content) {
  if (!content) {
    return "";
  }
  return content
    .replaceAll("assets/images/", "../../assets/images/")
    .replaceAll("assets/videos/", "../../assets/videos/")
    .replaceAll("assets/fonts/", "../../assets/fonts/");
}

function uniquePageSlug(href, usedSlugs) {
  let base = "home";
  try {
    const path = new URL(href).pathname.replace(/^\/+|\/+$/g, "");
    if (path) {
      base =
        path
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || "home";
    }
  } catch (error) {
    base = "page";
  }

  let slug = base;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  usedSlugs.add(slug);
  return slug;
}

function sanitizeHostname(hostname) {
  return (hostname || "website").replace(/[^a-zA-Z0-9.-]+/g, "-");
}

function buildSiteLandingHtml(hostname, pageLinks) {
  const items = pageLinks
    .map(
      (page) =>
        `      <li><a href="pages/${page.slug}/index.html">${escapeHtmlText(
          page.title || page.url,
        )}</a><span>${escapeHtmlText(page.url)}</span></li>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtmlText(hostname || "Website Export")} — captured pages</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 40px; background: #0f172a; color: #e2e8f0; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  p.sub { color: #94a3b8; margin-top: 0; }
  ul { list-style: none; padding: 0; max-width: 720px; }
  li { padding: 14px 16px; margin-bottom: 10px; border-radius: 12px; background: rgba(255,255,255,0.05); }
  a { color: #60a5fa; font-weight: 600; text-decoration: none; font-size: 16px; }
  a:hover { text-decoration: underline; }
  span { display: block; color: #64748b; font-size: 12px; margin-top: 4px; word-break: break-all; }
</style>
</head>
<body>
  <h1>${escapeHtmlText(hostname || "Website Export")}</h1>
  <p class="sub">${pageLinks.length} captured page(s). Open any page below.</p>
  <ul>
${items}
  </ul>
</body>
</html>`;
}

function buildMultiPagePrompts(hostname, pageLinks) {
  const pageList = pageLinks
    .map((page) => `- pages/${page.slug}/index.html — ${page.title || page.url} (${page.url})`)
    .join("\n");

  return `# AI Build Prompts (multi-page export)

This export contains ${pageLinks.length} page(s) captured from ${hostname || "the source site"}.

Structure:
- index.html — landing page linking to every captured page.
- pages/<slug>/index.html, styles.css, interactions.js — one folder per captured page.
- assets/ — shared, de-duplicated images, fonts, and videos used across pages.
- pages/<slug>/reference.png — visual screenshot target for that page, when present.

Captured pages:
${pageList}

## Prompt

You are working inside an extracted multi-page website clone export folder.

Build a clean, production-ready multi-page site (React Router, Next.js routes, or
equivalent) that reproduces every page in pages/ as closely as possible.

Requirements:
- Treat each pages/<slug>/index.html + styles.css as the visual source of truth for that route.
- Preserve layout, spacing, typography, colors, images, icons, responsive behavior, and visible interactions.
- Share assets from the root assets/ folder; do not duplicate them per page.
- Wire navigation between pages so links work.
- Create or update package.json and make the project runnable (npm install + dev server).
- If pages/<slug>/reference.png exists, visually compare each route against it and fix mismatches.
- Add a README with setup and run commands.
- Do not stop after scaffolding; finish the runnable clone.`;
}

function escapeHtmlText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
