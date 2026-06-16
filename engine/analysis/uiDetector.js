function detectUI() {
  return {
    sections: document.querySelectorAll("section").length,
    images: document.images.length,
    forms: document.forms.length,
  };
}
