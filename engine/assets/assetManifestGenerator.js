function generateAssetManifest(project) {
  return JSON.stringify(
    {
      images: project.assets?.images || [],
      fonts: project.assets?.fonts || [],
      videos: project.assets?.videos || [],
      svgs: project.assets?.svgs || [],
    },
    null,
    2,
  );
}
