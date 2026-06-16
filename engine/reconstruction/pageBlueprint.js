function generatePageBlueprint(project) {
  return {
    title: document.title,
    order: detectPageOrder(),
    sections: detectSections(),
    navigation: detectNavigation(),
  };
}

function detectPageOrder() {
  return Array.from(document.body.children)
    .slice(0, 100)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || "",
      class: el.className || "",
    }));
}

function detectSections() {
  return Array.from(document.querySelectorAll("section")).map((section) => ({
    id: section.id || "",
    class: section.className || "",
  }));
}

function detectNavigation() {
  const nav = document.querySelector("nav");
  if (!nav) {
    return null;
  }
  return {
    links: nav.querySelectorAll("a").length,
  };
}
