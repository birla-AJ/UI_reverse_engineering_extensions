function generateSummary(data) {
  const summary = [];
  summary.push("Website Summary");
  summary.push("");
  if (data.navbar) {
    summary.push("✓ Navbar");
  }
  if (data.hero) {
    summary.push("✓ Hero");
  }
  if (data.footer) {
    summary.push("✓ Footer");
  }
  if (data.behaviors) {
    summary.push("✓ Behaviors");
  }
  if (data.hover) {
    summary.push("✓ Hover Elements");
  }
  return summary.join("\n");
}
