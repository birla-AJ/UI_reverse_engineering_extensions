function collectAssets() {
  return {
    images: collectImages(),
    svgs: collectSVGs(),
    videos: collectVideos(),
    icons: collectIcons(),
    fonts: collectFonts(),
  };
}

function collectImages() {
  return [...document.images].map((img) => img.src).filter(Boolean);
}

function collectSVGs() {
  return [...document.querySelectorAll("svg")].map((svg, index) => ({
    id: index,
  }));
}

function collectVideos() {
  return [...document.querySelectorAll("video")]
    .map((video) => video.src)
    .filter(Boolean);
}

function collectIcons() {
  return [...document.querySelectorAll('link[rel*="icon"]')]
    .map((icon) => icon.href)
    .filter(Boolean);
}

function collectFonts() {
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
