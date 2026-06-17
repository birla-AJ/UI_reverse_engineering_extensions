function exportLocalAssets(project) {
  if (!project) {
    return;
  }
  if (!project.assets) {
    return;
  }
  project.localAssets = project.localAssets || {
    images: {},
    videos: {},
    fonts: {},
  };

  for (const image of project.downloadedAssets?.images || []) {
    project.localAssets.images[image.url] = "assets/images/" + image.filename;
  }
  for (const video of project.downloadedAssets?.videos || []) {
    project.localAssets.videos[video.url] = "assets/videos/" + video.filename;
  }
  for (const font of project.downloadedAssets?.fonts || []) {
    project.localAssets.fonts[font.url] = "assets/fonts/" + font.filename;
  }

  for (const font of project.assets.fonts || []) {
    try {
      const match = font.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        const url = resolveLocalAssetUrl(match[1]);
        if (project.localAssets.fonts[url]) {
          continue;
        }
        const filename = getFilename(url);
        project.localAssets.fonts[url] = "assets/fonts/" + filename;
      }
    } catch (error) {}
  }
  for (const url of project.assets.images || []) {
    try {
      if (project.localAssets.images[url]) {
        continue;
      }
      const filename = getFilename(url);
      project.localAssets.images[url] = "assets/images/" + filename;
    } catch (error) {}
  }
  for (const url of project.assets.videos || []) {
    try {
      if (project.localAssets.videos[url]) {
        continue;
      }
      const filename = getFilename(url);
      project.localAssets.videos[url] = "assets/videos/" + filename;
    } catch (error) {}
  }
}

function getFilename(url) {
  // Must match createFilename() so remapped HTML/CSS paths line up with the
  // downloaded blob filenames (shared across pages in the multi-page export).
  if (typeof uniqueAssetFilename === "function") {
    return uniqueAssetFilename(url);
  }
  try {
    return new URL(url, document.baseURI).pathname.split("/").pop();
  } catch (error) {
    return Date.now();
  }
}

function resolveLocalAssetUrl(url) {
  try {
    return new URL(url, document.baseURI).href;
  } catch (error) {
    return url;
  }
}
