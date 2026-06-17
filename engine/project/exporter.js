async function exportProject(project) {
  await attachReferenceScreenshot(project);
  reportExportProgress("Capturing DOM", 8);
  if (typeof captureDOM === "function") {
    project.dom = captureDOM();
  }
  reportExportProgress("Capturing CSS", 14);
  if (typeof captureCSS === "function") {
    project.css = captureCSS();
  }
  reportExportProgress("Capturing interactions", 20);
  if (typeof captureInteractions === "function") {
    project.interactions = captureInteractions();
  }
  reportExportProgress("Collecting assets", 28);
  if (typeof collectWebsiteAssets === "function") {
    project.assets = collectWebsiteAssets();
  }
  reportExportProgress("Downloading assets", 38);
  if (typeof downloadAssets === "function") {
    await downloadAssets(project);
  }
  reportExportProgress("Mapping local assets", 52);
  if (typeof exportLocalAssets === "function") {
    exportLocalAssets(project);
  }
  reportExportProgress("Reconstructing page", 60);
  if (typeof reconstructWebsite === "function") {
    project.reconstruction = reconstructWebsite(project);
  }
  if (typeof detectFramework === "function") {
    project.framework = detectFramework();
  }
  if (typeof extractComponents === "function") {
    project.components = extractComponents(project);
  }
  if (typeof extractDesignSystem === "function") {
    project.design = extractDesignSystem();
  }
  if (typeof classifyComponents === "function") {
    project.aiComponents = classifyComponents(project);
  }
  if (typeof generateAiPrompt === "function") {
    project.aiPrompt = generateAiPrompt(project);
  }
  if (typeof generateCodeSuggestions === "function") {
    project.aiSuggestions = generateCodeSuggestions(project);
  }
  if (typeof generatePageBlueprint === "function") {
    project.blueprint = generatePageBlueprint(project);
  }
  if (typeof recordInteractions === "function") {
    project.recordedInteractions = recordInteractions(project);
  }
  if (typeof generateProjectManifest === "function") {
    project.manifest = generateProjectManifest(project);
  }
  if (typeof buildProjectStructure === "function") {
    project.structure = buildProjectStructure(project);
  }
  if (typeof validateExport === "function") {
    project.validation = validateExport(project);
  }
  if (typeof generateDesignSystem === "function") {
    project.designSystem = generateDesignSystem(project);
  }
  if (typeof generateSourceFiles === "function") {
    project.source = generateSourceFiles(project);
  }
  reportExportProgress("Normalizing layout", 72);
  if (typeof normalizeLayout === "function") {
    normalizeLayout(project);
  }
  if (typeof generateResponsiveCss === "function") {
    project.css += generateResponsiveCss();
  }
  if (typeof generateAiProject === "function") {
    project.ai = generateAiProject(project);
  }
  if (typeof optimizeCss === "function") {
    project.css = optimizeCss(project.css)
  }
  if (typeof normalizeFonts === "function") {
    normalizeFonts(project)
  }

  if (typeof normalizeButtons === "function") {
    normalizeButtons(project)
  }
  reportExportProgress("Generating files", 84);
  if (typeof generateExportFiles === "function") {
    project.export = generateExportFiles(project);
  }
  // NOTE: the ZIP is no longer built here. Each captured page is saved into the
  // multi-page session (see savePageToSession) and the combined ZIP is built
  // only when the user clicks "Finish & Download" (see combineSessionToZip).
  reportExportProgress("Page captured", 100);
}

async function attachReferenceScreenshot(project) {
  try {
    const data = await chrome.storage.local.get("referenceScreenshot");
    project.referenceScreenshot = data.referenceScreenshot || null;
  } catch (error) {
    project.referenceScreenshot = null;
  }
}

function reportExportProgress(label, progress) {
  try {
    chrome.runtime.sendMessage({
      action: "EXPORT_PROGRESS",
      label,
      progress,
    });
  } catch (error) {}
}
