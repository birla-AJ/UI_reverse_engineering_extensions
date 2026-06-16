function optimizeCss(css) {
  if (!css) {
    return "";
  }
  css = removeComments(css);
  css = removeEmptyRules(css);
  css = removeDuplicateRules(css);
  css = compressCss(css);
  return css;
}

function removeComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function removeEmptyRules(css) {
  return css.replace(/[^{}]+\{\s*\}/g, "");
}

function removeDuplicateRules(css) {
  const seen = new Set();
  const output = [];
  const rules = css.split("}");
  for (let rule of rules) {
    rule = rule.trim();
    if (!rule || seen.has(rule)) {
      continue;
    }
    seen.add(rule);
    output.push(rule);
  }
  return output.join("}\n") + "}";
}

function compressCss(css) {
  return css
    .replace(/\n+/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}
