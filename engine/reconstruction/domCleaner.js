function cleanDOM(html) {
  if (!html) {
    return "";
  }
  let cleaned = html;
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  return cleaned;
}
