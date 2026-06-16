function remapAssets(html, project) {
  if (!html || !project || !project.downloadedAssets) {
    return html;
  }
  let output = html;
  const images = project.downloadedAssets.images || [];
  for (const image of images) {
    output = output.replaceAll(image.url, "assets/" + image.filename);
  }
  const videos = project.downloadedAssets.videos || [];
  for (const video of videos) {
    output = output.replaceAll(video.url, "assets/" + video.filename);
  }
  return output;
}
