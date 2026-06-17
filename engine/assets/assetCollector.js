function collectWebsiteAssets() {
  return {
    images: getImages(),
    svgs: getSvgs(),
    fonts: getFonts(),
    videos: getVideos(),
  };
}

function getImages() {
  return [
    ...new Set(
      [
        ...Array.from(document.images).flatMap((img) => [
          resolveCollectedAssetUrl(img.currentSrc),
          resolveCollectedAssetUrl(img.src),
          ...parseSrcset(img.srcset),
        ]),
        ...Array.from(document.querySelectorAll("source[srcset]")).flatMap(
          (source) => parseSrcset(source.srcset),
        ),
        ...getBackgroundImageUrls(),
      ].filter(Boolean),
    ),
  ];
}

function getSvgs() {
  return [
    ...new Set(
      Array.from(document.querySelectorAll("svg")).map((svg) => svg.outerHTML),
    ),
  ];
}

function getFonts() {
  const fonts = [];
  for (const sheet of document.styleSheets) {
    collectFontRules(sheet, fonts);
  }
  for (const sheet of document.adoptedStyleSheets || []) {
    collectFontRules(sheet, fonts);
  }
  return fonts;
}

function getVideos() {
  return [
    ...new Set(
      Array.from(document.querySelectorAll("video"))
        .map((v) => v.src)
      .filter(Boolean),
    ),
  ];
}

function collectFontRules(sheet, fonts) {
  try {
    for (const rule of sheet.cssRules || []) {
      if (rule.cssText.includes("@font-face")) {
        fonts.push(rule.cssText);
      }
    }
  } catch (error) {}
}

function parseSrcset(srcset) {
  if (!srcset) {
    return [];
  }

  return srcset
    .split(",")
    .map((candidate) =>
      resolveCollectedAssetUrl(candidate.trim().split(/\s+/)[0]),
    )
    .filter(Boolean);
}

function extractUrls(value) {
  if (!value || value === "none") {
    return [];
  }

  return Array.from(value.matchAll(/url\(["']?([^"')]+)["']?\)/g)).map((match) =>
    resolveCollectedAssetUrl(match[1]),
  );
}

function getBackgroundImageUrls() {
  return Array.from(document.querySelectorAll("*"))
    .slice(0, 4000)
    .flatMap((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        return [];
      }
      return extractUrls(getComputedStyle(el).backgroundImage);
    });
}

function resolveCollectedAssetUrl(url) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url, document.baseURI).href;
  } catch (error) {
    return url;
  }
}

// Deterministic short hash so the same URL always yields the same name.
function hashAssetUrl(value) {
  let hash = 5381;
  const text = String(value);
  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

// Builds a globally unique filename for an asset URL. Uniqueness matters once
// multiple pages share one assets/ folder: two different URLs may have the same
// basename (e.g. "logo.png"), so the URL hash keeps them from colliding.
function uniqueAssetFilename(url) {
  try {
    const parsed = new URL(url, document.baseURI);
    const base = parsed.pathname.split("/").pop() || "";
    const hash = hashAssetUrl(parsed.href);
    if (!base) {
      return `asset-${hash}.bin`;
    }
    const dot = base.lastIndexOf(".");
    if (dot > 0) {
      const name = base.slice(0, dot).replace(/[^a-zA-Z0-9_-]+/g, "-");
      const ext = base.slice(dot + 1).replace(/[^a-zA-Z0-9]+/g, "");
      return `${name}-${hash}.${ext}`;
    }
    return `${base.replace(/[^a-zA-Z0-9_-]+/g, "-")}-${hash}`;
  } catch (error) {
    return `asset-${hashAssetUrl(url)}.bin`;
  }
}
