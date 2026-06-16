function remapAssets(html, project) {
  if (!html) {
    return "";
  }
  if (!project?.localAssets) {
    return html;
  }
  for (const url in project.localAssets.images) {
    html = html.replaceAll(url, project.localAssets.images[url]);
  }
  for (const url in project.localAssets.videos) {
    html = html.replaceAll(url, project.localAssets.videos[url]);
  }
  return html;
}
