async function downloadAssets(project) {
  if (!project.assets) {
    return;
  }

  const images = await downloadAssetGroup(project.assets.images || [], "image", 6);
  const videos = await downloadAssetGroup(project.assets.videos || [], "video", 2);
  const fonts = await downloadAssetGroup(getFontUrls(project.assets.fonts || []), "font", 6);

  project.downloadedAssets = {
    images,
    videos,
    fonts,
  };
}

async function downloadAssetGroup(urls, prefix, concurrency) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < uniqueUrls.length) {
      const url = uniqueUrls[cursor];
      cursor++;
      const asset = await downloadSingleAsset(url, prefix);
      if (asset) {
        results.push(asset);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, worker),
  );

  return results;
}

async function downloadSingleAsset(url, prefix) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Asset request failed: ${response.status}`);
      }
      const blob = await response.blob();
      const filename = createFilename(url, prefix);
      // filename is URL-hashed (createFilename -> uniqueAssetFilename) so it stays
      // unique across pages that share one assets/ folder.
      return {
        url: url,
        filename: filename,
        blob: blob,
        size: blob.size,
      };
    } catch (error) {
      handleError(error, "Asset")
      return null;
    }
}

function createFilename(url, prefix) {
  if (typeof uniqueAssetFilename === "function") {
    return uniqueAssetFilename(url);
  }
  try {
    const pathname = new URL(url, document.baseURI).pathname;
    const name = pathname.split("/").pop();
    return name || `${prefix}.bin`;
  } catch (error) {
    return `${prefix}.bin`;
  }
}

function getFontUrls(fontRules) {
  return [
    ...new Set(
      fontRules.flatMap((rule) =>
        Array.from(rule.matchAll(/url\(["']?([^"')]+)["']?\)/g)).map(
          (match) => match[1],
        ),
      ),
    ),
  ];
}
