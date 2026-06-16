function buildProjectStructure(project) {
  return {
    root: "website-export",
    folders: {
      assets: {
        images: project.assets?.images || [],
        fonts: project.assets?.fonts || [],
        videos: project.assets?.videos || [],
      },
      manifest: {},
      reports: {},
    },
    files: {
      index: "index.html",
      css: "styles.css",
      js: "interactions.js",
      launch: "launch.html",
      analysis: "reports/analysis.json",
      summary: "reports/summary.md",
      assetManifest: "manifest/asset-manifest.json",
      projectManifest: "manifest/project-manifest.json",
    },
  };
}
