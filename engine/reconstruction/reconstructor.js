function reconstructWebsite(project) {
  if (!project || !project.dom) {
    return null;
  }
  let html = reconstructHtml(project);
  if (typeof mapAssetsToLocal === "function") {
    html = mapAssetsToLocal(project);
  }
  return {
    html,
    css: project.css || "",
    interactions: reconstructInteractions(project),
  };
}

function reconstructHtml(project) {
  if (!project.dom.html) {
    return "";
  }
  return sanitizeHtml(project.dom.html);
}

function reconstructInteractions(project) {
  return {
    hover: project.interactions?.hover || [],
    dropdowns: project.interactions?.dropdowns || 0,
    sticky: project.interactions?.sticky || 0,
  };
}
