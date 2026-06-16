function recordInteractions(project) {
  return {
    buttons: getButtons(),
    links: getLinks(),
    forms: getForms(),
    inputs: getInputs(),
  };
}

function getButtons() {
  return Array.from(document.querySelectorAll("button"))
    .slice(0, 100)
    .map((btn) => ({
      text: btn.innerText,
      id: btn.id || "",
      class: btn.className || "",
    }));
}

function getLinks() {
  return Array.from(document.querySelectorAll("a"))
    .slice(0, 200)
    .map((link) => ({
      text: link.innerText,
      href: link.href,
    }));
}

function getForms() {
  return Array.from(document.querySelectorAll("form")).map((form) => ({
    id: form.id || "",
  }));
}

function getInputs() {
  return Array.from(document.querySelectorAll("input")).map((input) => ({
    type: input.type,
    name: input.name,
  }));
}
