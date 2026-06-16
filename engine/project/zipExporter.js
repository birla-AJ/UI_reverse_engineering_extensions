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
  const src = zip.folder("src");
  src.file("app.js", project.export.appJs || "");
  src.file("app.css", project.export.appCss || "");
  if (project.downloadedAssets) {
    addImages(zip, project);
    addVideos(zip, project);
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
