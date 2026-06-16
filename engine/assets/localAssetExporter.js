function exportLocalAssets(project) {
  if (!project) {
    return;
  }
  if (!project.assets?.images) {
    return;
  }
  for (const font of project.assets.fonts || []) {
    try {
      const match = font.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        const url = match[1];
        const filename = getFilename(url);
        project.localAssets.fonts[url] = "assets/fonts/" + filename;
      }
    } catch (error) {}
  }
  for (const url of project.assets.images) {
    try {
      const filename = getFilename(url);
      project.localAssets.images[url] = "assets/images/" + filename;
    } catch (error) {}
  }
  for (const url of project.assets.videos || []) {
    try {
      const filename = getFilename(url);
      project.localAssets.videos[url] = "assets/videos/" + filename;
    } catch (error) {}
  }
}

function getFilename(url) {
  try {
    return url.split("?")[0].split("/").pop();
  } catch (error) {
    return Date.now();
  }
}
