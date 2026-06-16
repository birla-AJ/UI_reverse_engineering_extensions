function extractDesignSystem() {
  return {
    colors: extractColors(),
    typography: extractTypography(),
    spacing: extractSpacing(),
    radius: extractRadius(),
    shadows: extractShadows(),
  };
}

function extractColors() {
  const colors = new Set();
  document.querySelectorAll("*").forEach((el) => {
    const style = getComputedStyle(el);
    colors.add(style.color);
    colors.add(style.backgroundColor);
  });
  return [...colors].filter(Boolean);
}

function extractTypography() {
  const fonts = new Set();
  document.querySelectorAll("*").forEach((el) => {
    fonts.add(getComputedStyle(el).fontFamily);
  });
  return [...fonts].filter(Boolean);
}

function extractSpacing() {
  const spacing = new Set();
  document.querySelectorAll("*").forEach((el) => {
    const style = getComputedStyle(el);
    spacing.add(style.padding);
    spacing.add(style.margin);
  });
  return [...spacing].filter(Boolean);
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
  return [...shadows].filter((shadow) => shadow !== "none");
}
