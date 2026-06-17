function captureCSS() {
  let css = "";
  for (const sheet of document.styleSheets) {
    css += readCssRules(sheet);
  }

  for (const sheet of document.adoptedStyleSheets || []) {
    css += readCssRules(sheet);
  }

  return css;
}

function readCssRules(sheet) {
  let css = "";
  try {
    for (const rule of sheet.cssRules || []) {
      css += rule.cssText + "\n";
    }
  } catch (error) {}
  return css;
}
