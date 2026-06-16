function generateProjectManifest(project) {
  return {
    title: project.analysis?.metadata?.title || "",
    url: project.analysis?.metadata?.url || "",
    generatedAt: new Date().toISOString(),
    assets: {
      images: project.assets?.images?.length || 0,
      svgs: project.assets?.svgs?.length || 0,
      fonts: project.assets?.fonts?.length || 0,
      videos: project.assets?.videos?.length || 0,
    },
    components: {
      navbar: !!project.components?.navbar,
      hero: !!project.components?.hero,
      footer: !!project.components?.footer,
      sections: project.components?.sections?.length || 0,
    },
    interactions: {
      buttons: project.recordedInteractions?.buttons?.length || 0,
      links: project.recordedInteractions?.links?.length || 0,
      forms: project.recordedInteractions?.forms?.length || 0,
      inputs: project.recordedInteractions?.inputs?.length || 0,
    },
  };
}
