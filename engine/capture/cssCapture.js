function captureCSS() {
  let css = "";
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        css += rule.cssText + "\n";
      }
    } catch (error) {}
  }
  return css;
}
