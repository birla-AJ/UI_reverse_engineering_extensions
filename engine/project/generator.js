function generateExportFiles(project) {
  if (!project) {
    return {};
  }
  return {
    indexHtml: generateIndexHtml(project),
    stylesCss: generateStylesCss(project),
    interactionsJs: generateInteractionsJs(project),
    summaryMd: generateSummary(project),
    analysisJson: JSON.stringify(project.analysis || {}, null, 2),
    designJson: JSON.stringify(project.design || {}, null, 2),
    assetManifest: generateAssetManifest(project),
    projectManifest: JSON.stringify(project.manifest || {}, null, 2),
    launchHtml: generateLaunchHtml(project),
    appJs: project.source?.appJs || "",
    appCss: project.source?.appCss || "",
    designSystemJson: JSON.stringify(project.designSystem || {}, null, 2),
    designSystemMd: generateDesignSystemMd(project),
    aiHtml: project.ai?.html || "",
    aiCss: project.ai?.css || "",
  };
}

function generateIndexHtml(project) {
  const title =
    project.analysis?.metadata?.title || document.title || "Website Export";
  let html = "";
  if (project.reconstruction?.html) {
    html = project.reconstruction.html;
  } else {
    html = project.dom?.html || "";
  }
  html = sanitizeHtml(html);
  if (typeof cleanDOM === "function") {
    html = cleanDOM(html);
  }
  if (typeof remapAssets === "function") {
    html = remapAssets(html, project);
  }
  return `<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"

content="width=device-width, initial-scale=1">

<title>${title}</title>

<link rel="stylesheet"

href="styles.css">

</head>

<body>

${html}

<script src="interactions.js"></script>

</body>

</html>`;
}

function sanitizeHtml(html) {
  if (!html) {
    return "";
  }
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(
      /onclick="[^"]*"/gi,

      "",
    )

    .replace(/onmouseover="[^"]*"/gi, "");
}
function generateStylesCss(project) {
  let css = project.css || "";
  if (typeof optimizeCss === "function") {
    css = optimizeCss(css);
  }
  return css;
}

function generateInteractionsJs(project) {
  if (typeof generateReplayJs === "function") {
    return generateReplayJs(project);
  }
  return `

console.log(

 "Interactions Loaded"

)

`;
}

function generateSummary(project) {
  const title = project.analysis?.metadata?.title || "";
  const url = project.analysis?.metadata?.url || "";
  const assetCount = project.assets ? Object.keys(project.assets).length : 0;
  return `

# Website Summary

Title:

${title}

URL:

${url}

Assets:

${assetCount}

`;
}
function generateDesignSystemMd(project) {
  const ds = project.designSystem || {};
  return `

# Design System

## Colors

${(ds.colors || []).join("\n")}

## Fonts

${(ds.fonts || []).join("\n")}

## Radius

${(ds.radius || []).join("\n")}

## Shadows

${(ds.shadows || []).join("\n")}

`;
}
function generateLaunchHtml(project) {
  return `<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>

Launch Clone

</title>

</head>

<body>

<h1>

${project.analysis?.metadata?.title || "Website Clone"}

</h1>

<button id="open">

Open Website Clone

</button>

<script>

document

.getElementById(

 "open"

)

.onclick=function(){

 location.href=

 "index.html"

}

</script>

</body>

</html>`;
}
