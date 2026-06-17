function isProtectedWebsite() {
  const protectedSites = [
    "stripe.com",
    "netflix.com",
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "x.com",
    "studio.youtube.com",
  ];

  return protectedSites.some((site) => location.hostname.includes(site));
}

function getProtectedWebsiteWarning() {
  if (!isProtectedWebsite()) {
    return "";
  }

  return "This website uses advanced rendering. Results may be limited.";
}
