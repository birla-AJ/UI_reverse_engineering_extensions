function generateAiProject(project) {
  if (!project) {
    return {};
  }

  return {
    html: generateAiHtml(project),

    css: generateAiCss(project),
  };
}
