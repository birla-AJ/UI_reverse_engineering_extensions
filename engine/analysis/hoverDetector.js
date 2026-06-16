function detectHoverElements() {
  return [...document.querySelectorAll("button,a")].slice(0, 30).map((el) => ({
    selector: getSelector(el),
    text: el.innerText,
  }));
}

function getSelector(el) {
  if (el.id) {
    return "#" + el.id;
  }
  return el.tagName.toLowerCase();
}
