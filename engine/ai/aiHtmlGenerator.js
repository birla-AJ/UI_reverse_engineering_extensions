function generateAiHtml(project) {
  if (!project) {
    return "";
  }

  const title = project.analysis?.metadata?.title || "Website";

  return `

<div class="container">

<header>

<h1>

${title}

</h1>

</header>

<main>

<!-- AI Generated Structure -->

</main>

</div>

`;
}
