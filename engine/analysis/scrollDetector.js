function captureInteractions() {
  return {
    hover: detectHover(),
    sticky: detectSticky(),
    dropdowns: detectDropdowns(),
  };
}

function detectHover() {
  return [...document.querySelectorAll("button,a")].slice(0, 20).map((el) => ({
    text: el.innerText,
  }));
}

function detectSticky() {
  return [...document.querySelectorAll("*")]
    .filter((el) => {
      return getComputedStyle(el).position === "sticky";
    })
    .slice(0, 20).length;
}

function detectDropdowns() {
  return [...document.querySelectorAll("[aria-expanded]")].slice(0, 20).length;
}
