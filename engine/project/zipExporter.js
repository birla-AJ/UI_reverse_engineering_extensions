async function buildZip(project) {
  if (typeof JSZip === "undefined") {
    console.log("JSZip missing");
    return;
  }
  const zip = new JSZip();
  zip.file("index.html", project.export.indexHtml);
  zip.file("styles.css", project.export.stylesCss);
  zip.file("interactions.js", project.export.interactionsJs);
  zip.file("launch.html", project.export.launchHtml);
  zip.file("reports/summary.md", project.export.summaryMd);
  zip.file("reports/analysis.json", project.export.analysisJson);
  zip.file("reports/design-system.json", project.export.designJson || "{}");
  zip.file("manifest/asset-manifest.json", project.export.assetManifest);
  zip.file("manifest/project-manifest.json", project.export.projectManifest);
  zip.file("ai/ai-index.html", project.export.aiHtml);
  zip.file("ai/ai-styles.css", project.export.aiCss);
  zip.file("ai/build-prompts.md", project.export.aiBuildPromptsMd || "");
  addReferenceScreenshot(zip, project);
  const src = zip.folder("src");
  src.file("app.js", project.export.appJs || "");
  src.file("app.css", project.export.appCss || "");
  if (project.downloadedAssets) {
    addImages(zip, project);
    addVideos(zip, project);
    addFonts(zip, project);
  }
  const blob = await zip.generateAsync({
    type: "blob",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "website-export.zip";
  a.click();
  URL.revokeObjectURL(url);
  console.log("ZIP CREATED");
}

function addImages(zip, project) {
  for (const file of project.downloadedAssets.images || []) {
    if (file.filename && file.blob) {
      zip.file("assets/images/" + file.filename, file.blob);
    }
  }
}

function addVideos(zip, project) {
  for (const file of project.downloadedAssets.videos || []) {
    if (file.filename && file.blob) {
      zip.file("assets/videos/" + file.filename, file.blob);
    }
  }
}

function addFonts(zip, project) {
  for (const file of project.downloadedAssets.fonts || []) {
    if (file.filename && file.blob) {
      zip.file("assets/fonts/" + file.filename, file.blob);
    }
  }
}

function addReferenceScreenshot(zip, project) {
  if (!project.referenceScreenshot?.dataUrl) {
    return;
  }

  const blob = dataUrlToBlob(project.referenceScreenshot.dataUrl);
  if (blob) {
    zip.file("reference/viewport.png", blob);
    zip.file(
      "reference/metadata.json",
      JSON.stringify(
        {
          title: project.referenceScreenshot.title || "",
          url: project.referenceScreenshot.url || "",
          capturedAt: project.referenceScreenshot.capturedAt || "",
          viewport: project.dom?.viewport || {},
        },
        null,
        2,
      ),
    );
  }
}

function dataUrlToBlob(dataUrl) {
  try {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], {
      type: mime,
    });
  } catch (error) {
    return null;
  }
}
