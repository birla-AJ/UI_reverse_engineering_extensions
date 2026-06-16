function validateExport(project) {
  return {
    html: !!project.dom?.html,
    css: !!project.css,
    assets: validateAssets(project),
    reconstruction: !!project.reconstruction,
    components: !!project.components,
    blueprint: !!project.blueprint,
    interactions: !!project.recordedInteractions,
    manifest: !!project.manifest,
  };
}

function validateAssets(project) {
  return {
    images: project.assets?.images?.length || 0,
    fonts: project.assets?.fonts?.length || 0,
    svgs: project.assets?.svgs?.length || 0,
    videos: project.assets?.videos?.length || 0,
  };
}
