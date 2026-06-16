async function exportProject(project) {
  if (typeof captureDOM === "function") {
    project.dom = captureDOM();
  }
  if (typeof captureCSS === "function") {
    project.css = captureCSS();
  }
  if (typeof captureInteractions === "function") {
    project.interactions = captureInteractions();
  }
  if (typeof collectWebsiteAssets === "function") {
    project.assets = collectWebsiteAssets();
  }
  if (typeof downloadAssets === "function") {
    await downloadAssets(project);
  }
  if (typeof exportLocalAssets === "function") {
    exportLocalAssets(project);
  }
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
  if (typeof normalizeLayout === "function") {
    normalizeLayout(project);
  }
  if (typeof generateResponsiveCss === "function") {
    project.css += generateResponsiveCss();
  }
  if (typeof generateAiProject === "function") {
    project.ai = generateAiProject(project);
  }
  if (typeof generateExportFiles === "function") {
    project.export = generateExportFiles(project);
  }
  if (typeof buildZip === "function") {
    await buildZip(project);
  }
}
