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
    aiBuildPromptsMd: generateAiBuildPromptsMd(project),
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
  css += generateVisualSnapshotCss(project);
  css += generatePrecisionFixesCss(project);
  css = remapCssAssetUrls(css, project);
  if (typeof optimizeCss === "function") {
    css = optimizeCss(css);
  }
  return css;
}

function generatePrecisionFixesCss(project) {
  return `

/* Precision fallbacks for common cloned UI patterns. */
.navbar .nav-link,
.navbar .dropdown-toggle,
nav .nav-link,
nav .dropdown-toggle {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  white-space: nowrap !important;
  line-height: 1.2 !important;
}

.navbar .nav-link .down,
.navbar .dropdown-toggle .down,
nav .nav-link .down,
nav .dropdown-toggle .down {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 12px !important;
  height: 12px !important;
  margin-left: 2px !important;
  line-height: 1 !important;
  vertical-align: middle !important;
}

.navbar .nav-link .down i,
.navbar .dropdown-toggle .down i,
nav .nav-link .down i,
nav .dropdown-toggle .down i {
  display: none !important;
}

.navbar .nav-link .down::before,
.navbar .dropdown-toggle .down::before,
nav .nav-link .down::before,
nav .dropdown-toggle .down::before {
  content: "" !important;
  display: inline-block !important;
  width: 7px !important;
  height: 7px !important;
  border-right: 2px solid currentColor !important;
  border-bottom: 2px solid currentColor !important;
  transform: rotate(45deg) translateY(-2px) !important;
}

.navbar .dropdown-toggle::after,
nav .dropdown-toggle::after {
  display: none !important;
}

`;
}

function remapCssAssetUrls(css, project) {
  if (!css || !project?.localAssets) {
    return css;
  }

  const assets = {
    ...(project.localAssets.images || {}),
    ...(project.localAssets.videos || {}),
    ...(project.localAssets.fonts || {}),
  };

  return Object.entries(assets).reduce((output, [source, localPath]) => {
    return output.replaceAll(source, localPath);
  }, css);
}

function generateVisualSnapshotCss(project) {
  const snapshot = project.dom?.visualSnapshot;
  if (!snapshot) {
    return "";
  }

  const lines = [
    "",
    "/* Computed visual snapshot fallback. */",
    "* { box-sizing: border-box; }",
    "img, video, canvas, svg { max-width: 100%; }",
  ];

  if (snapshot.body && Object.keys(snapshot.body).length) {
    lines.push(`body { ${styleObjectToCss(snapshot.body)} }`);
  }

  for (const element of snapshot.elements || []) {
    if (!element?.id || !element.styles) {
      continue;
    }

    const selector = `[data-ui-clone-id="${escapeCssAttribute(element.id)}"]`;
    lines.push(`${selector} { ${styleObjectToCss(element.styles)} }`);

    if (element.before) {
      lines.push(
        `${selector}::before { content: ${element.before.content}; ${styleObjectToCss(
          element.before.styles
        )} }`
      );
    }

    if (element.after) {
      lines.push(
        `${selector}::after { content: ${element.after.content}; ${styleObjectToCss(
          element.after.styles
        )} }`
      );
    }
  }

  return lines.join("\n");
}

function styleObjectToCss(styles) {
  return Object.entries(styles || {})
    .filter(([, value]) => value)
    .map(([property, value]) => `${property}: ${value};`)
    .join(" ");
}

function escapeCssAttribute(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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

function generateAiBuildPromptsMd(project) {
  const title = project.analysis?.metadata?.title || "Exported Website Clone";
  const url = project.analysis?.metadata?.url || "";
  const prompts = [
    ["React + Vite", "src/App.jsx, src/main.jsx, src/App.css", "npm install", "npm run dev"],
    ["Next.js", "app/page.jsx, app/layout.jsx, app/globals.css", "npm install", "npm run dev"],
    ["Angular", "src/app/app.component.ts, app.component.html, app.component.css", "npm install", "npm start"],
    ["Vue + Vite", "src/App.vue, src/main.js, src/style.css", "npm install", "npm run dev"],
  ];

  return `# AI Build Prompts

Use one of these prompts in Codex, Claude, or another coding assistant after extracting this ZIP.

Original title: ${title}
Original URL: ${url}
Visual reference: reference/viewport.png, when present.

${prompts
  .map(
    ([tech, files, install, run]) => `## ${tech}

You are working inside an extracted website clone export folder.

Create a clean, production-ready ${tech} project from this export. The result must visually and functionally match the exported clone as closely as possible.

Use index.html, styles.css, interactions.js, assets/, reports/analysis.json, manifest/asset-manifest.json, and reference/viewport.png as the source of truth.

Requirements:
- Preserve layout, spacing, typography, colors, images, icons, responsive behavior, and visible interactions.
- Preserve dropdowns, tabs, forms, hash links, hover states, sticky elements, and local asset paths where possible.
- Use local assets from assets/ first.
- Create or update package.json.
- Create the main app files: ${files}.
- Make the project runnable with:
  ${install}
  ${run}
- Compare the result against index.html at desktop and mobile widths.
- If reference/viewport.png exists, visually compare the running app against it and fix mismatches.
- Fix visible differences before stopping.
- Add a README with setup and run commands.
- Do not stop after scaffolding; finish the runnable clone.`
  )
  .join("\n\n")}`;
}
