function extractComponents(project) {
  return {
    navbar: extractNavbar(project),
    hero: extractHero(project),
    footer: extractFooter(project),
    sections: extractSections(project),
  };
}

function extractNavbar(project) {
  const nav = document.querySelector("nav");
  return nav ? nav.outerHTML : "";
}

function extractHero(project) {
  const hero = document.querySelector("main section");
  return hero ? hero.outerHTML : "";
}

function extractFooter(project) {
  const footer = document.querySelector("footer");
  return footer ? footer.outerHTML : "";
}

function extractSections(project) {
  return Array.from(document.querySelectorAll("section"))
    .slice(0, 20)
    .map((section) => section.outerHTML);
}
