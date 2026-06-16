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
      Array.from(document.images)
        .map((img) => img.src)
        .filter(Boolean),
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
    try {
      for (const rule of sheet.cssRules) {
        if (rule.cssText.includes("@font-face")) {
          fonts.push(rule.cssText);
        }
      }
    } catch (error) {}
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
