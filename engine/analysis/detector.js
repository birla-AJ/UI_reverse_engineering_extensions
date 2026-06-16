function detectBehaviors() {
  return {
    dropdowns: detectDropdowns(),
    accordions: detectAccordions(),
    tabs: detectTabs(),
    stickyHeaders: detectSticky(),
    modals: detectModals(),
    carousels: detectCarousels(),
    scrollContainers: detectScrollContainers(),
  };
}

function detectDropdowns() {
  return [...document.querySelectorAll("[aria-expanded]")]
    .slice(0, 20)
    .map((el) => ({
      selector: getSelector(el),
    }));
}

function detectAccordions() {
  return [...document.querySelectorAll("[id*=accordion]")]
    .slice(0, 20)
    .map((el) => ({
      selector: getSelector(el),
    }));
}

function detectTabs() {
  return [...document.querySelectorAll('[role="tab"]')]
    .slice(0, 20)
    .map((el) => ({
      text: el.innerText,
      selector: getSelector(el),
    }));
}

function detectSticky() {
  return [...document.querySelectorAll("*")]
    .filter((el) => {
      return getComputedStyle(el).position === "sticky";
    })
    .slice(0, 20)
    .map((el) => ({
      selector: getSelector(el),
    }));
}

function detectModals() {
  return [...document.querySelectorAll('[role="dialog"]')]
    .slice(0, 20)
    .map((el) => ({
      selector: getSelector(el),
    }));
}

function detectCarousels() {
  return [...document.querySelectorAll("[class*=carousel],[class*=slider]")]
    .slice(0, 20)
    .map((el) => ({
      selector: getSelector(el),
    }));
}

function detectScrollContainers() {
  return [...document.querySelectorAll("*")]
    .filter((el) => {
      const style = getComputedStyle(el);
      return style.overflow === "auto";
    })
    .slice(0, 20)
    .map((el) => ({
      selector: getSelector(el),
    }));
}

function getSelector(el) {
  if (el.id) {
    return "#" + el.id;
  }
  return el.tagName.toLowerCase();
}
