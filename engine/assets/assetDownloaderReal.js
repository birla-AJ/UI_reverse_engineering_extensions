async function downloadAssets(project) {
  if (!project.assets) {
    return;
  }
  const downloaded = {
    images: [],
    videos: [],
  };
  for (const url of project.assets.images || []) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = createFilename(url, "image");
      downloaded.images.push({
        url: url,
        filename: filename,
        blob: blob,
        size: blob.size,
      });
    } catch (error) {}
  }
  for (const url of project.assets.videos || []) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = createFilename(url, "video");
      downloaded.videos.push({
        url: url,
        filename: filename,
        blob: blob,
        size: blob.size,
      });
    } catch (error) {}
  }
  project.downloadedAssets = downloaded;
}

function createFilename(url, prefix) {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").pop();
    return name || `${prefix}.bin`;
  } catch (error) {
    return `${prefix}.bin`;
  }
}
