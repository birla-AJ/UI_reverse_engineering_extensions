function detectFramework() {
  const html = document.documentElement.outerHTML;
  if (html.includes("__NEXT_DATA__")) {
    return "nextjs";
  }
  if (html.includes("data-reactroot")) {
    return "react";
  }
  if (html.includes("__NUXT__")) {
    return "nuxt";
  }
  if (html.includes("ng-version")) {
    return "angular";
  }
  if (document.querySelector("[data-v-app]")) {
    return "vue";
  }
  return "static";
}
