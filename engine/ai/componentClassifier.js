function classifyComponents(project) {
  if (!project.components) {
    return {};
  }
  return {
    navbar: classify(project.components.navbar),
    hero: classify(project.components.hero),
    footer: classify(project.components.footer),
    sections: (project.components.sections || []).map(classify),
  };
}

function classify(component) {
  if (!component) {
    return null;
  }
  return {
    type: component.type || "generic",
    reusable: true,
  };
}
