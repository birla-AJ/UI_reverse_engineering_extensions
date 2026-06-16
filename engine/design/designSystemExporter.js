function generateDesignSystem(project) {
  if (!project) {
    return {};
  }
  const colors = extractColors();
  const fonts = extractFonts();
  const radius = extractRadius();
  const shadows = extractShadows();
  return {
    colors,
    fonts,
    radius,
    shadows,
  };
}

function extractColors() {
  const colors = new Set();
  const elements = document.querySelectorAll("*");
  elements.forEach((el) => {
    const style = getComputedStyle(el);
    colors.add(style.color);
    colors.add(style.backgroundColor);
  });
  return [...colors].filter(Boolean);
}

function extractFonts() {
  const fonts = new Set();
  document.querySelectorAll("*").forEach((el) => {
    fonts.add(getComputedStyle(el).fontFamily);
  });
  return [...fonts].filter(Boolean);
}

function extractRadius() {
  const radius = new Set();
  document.querySelectorAll("*").forEach((el) => {
    radius.add(getComputedStyle(el).borderRadius);
  });
  return [...radius].filter(Boolean);
}

function extractShadows() {
  const shadows = new Set();
  document.querySelectorAll("*").forEach((el) => {
    shadows.add(getComputedStyle(el).boxShadow);
  });
  return [...shadows].filter(Boolean);
}
