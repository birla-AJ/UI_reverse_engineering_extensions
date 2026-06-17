function captureDOM() {
  const body = document.body.cloneNode(true);
  normalizeCloneAssetUrls(document.body, body);
  normalizeCloneFormState(document.body, body);
  normalizeCloneCanvas(document.body, body);
  normalizeCloneShadowRoots(document.body, body);
  const visualSnapshot = captureVisualSnapshot(document.body, body);
  removeHiddenElements(document.body, body);

  return {
    html: body.innerHTML,
    title: document.title,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      devicePixelRatio: window.devicePixelRatio,
    },
    visualSnapshot,
  };
}

function removeHiddenElements(sourceRoot = document.body, cloneRoot = sourceRoot) {
  if (!sourceRoot || !cloneRoot) {
    return;
  }

  const sourceElements = Array.from(sourceRoot.querySelectorAll("*"));
  const cloneElements = Array.from(cloneRoot.querySelectorAll("*"));

  sourceElements.forEach((sourceEl, index) => {
    const clonedEl = cloneElements[index];
    if (!clonedEl) {
      return;
    }
    const style = getComputedStyle(sourceEl);
    if (style.display === "none" || style.visibility === "hidden") {
      clonedEl.remove();
    }
  });
}

function normalizeCloneCanvas(sourceRoot = document.body, cloneRoot = sourceRoot) {
  if (!sourceRoot || !cloneRoot) {
    return;
  }

  normalizePairedElements(
    sourceRoot.querySelectorAll("canvas"),
    cloneRoot.querySelectorAll("canvas"),
    normalizeClonedCanvas,
  );
}

function normalizeClonedCanvas(sourceEl, clonedEl) {
  try {
    const dataUrl = sourceEl.toDataURL("image/png");
    const img = document.createElement("img");
    img.src = dataUrl;
    img.width = sourceEl.width;
    img.height = sourceEl.height;
    img.setAttribute("data-canvas-snapshot", "true");
    img.setAttribute("alt", clonedEl.getAttribute("aria-label") || "Canvas snapshot");
    clonedEl.replaceWith(img);
  } catch (error) {
    clonedEl.setAttribute("data-canvas-snapshot", "unavailable");
  }
}

function normalizeCloneShadowRoots(sourceRoot = document.body, cloneRoot = sourceRoot) {
  if (!sourceRoot || !cloneRoot) {
    return;
  }

  const sourceElements = Array.from(sourceRoot.querySelectorAll("*"));
  const cloneElements = Array.from(cloneRoot.querySelectorAll("*"));

  sourceElements.forEach((sourceEl, index) => {
    if (!sourceEl.shadowRoot || sourceEl.shadowRoot.mode !== "open") {
      return;
    }

    const clonedEl = cloneElements[index];
    if (!clonedEl) {
      return;
    }

    const template = document.createElement("template");
    template.setAttribute("shadowrootmode", "open");
    template.innerHTML = sourceEl.shadowRoot.innerHTML;
    clonedEl.appendChild(template);
    clonedEl.setAttribute("data-open-shadow-root", "true");
  });
}

function normalizeCloneFormState(sourceRoot = document.body, cloneRoot = sourceRoot) {
  if (!sourceRoot || !cloneRoot) {
    return;
  }

  normalizePairedElements(
    sourceRoot.querySelectorAll("input"),
    cloneRoot.querySelectorAll("input"),
    normalizeClonedInput,
  );
  normalizePairedElements(
    sourceRoot.querySelectorAll("textarea"),
    cloneRoot.querySelectorAll("textarea"),
    normalizeClonedTextarea,
  );
  normalizePairedElements(
    sourceRoot.querySelectorAll("select"),
    cloneRoot.querySelectorAll("select"),
    normalizeClonedSelect,
  );
}

function normalizeClonedInput(sourceEl, clonedEl) {
  clonedEl.setAttribute("value", sourceEl.value || "");

  if (sourceEl.checked) {
    clonedEl.setAttribute("checked", "");
  } else {
    clonedEl.removeAttribute("checked");
  }

  if (sourceEl.disabled) {
    clonedEl.setAttribute("disabled", "");
  }
}

function normalizeClonedTextarea(sourceEl, clonedEl) {
  clonedEl.textContent = sourceEl.value || "";
}

function normalizeClonedSelect(sourceEl, clonedEl) {
  Array.from(sourceEl.options).forEach((option, index) => {
    const clonedOption = clonedEl.options[index];
    if (!clonedOption) {
      return;
    }

    if (option.selected) {
      clonedOption.setAttribute("selected", "");
    } else {
      clonedOption.removeAttribute("selected");
    }
  });
}

function normalizeCloneAssetUrls(sourceRoot = document.body, cloneRoot = sourceRoot) {
  if (!sourceRoot || !cloneRoot) {
    return;
  }

  normalizePairedElements(
    sourceRoot.querySelectorAll("img"),
    cloneRoot.querySelectorAll("img"),
    normalizeClonedImage,
  );
  normalizePairedElements(
    sourceRoot.querySelectorAll("source"),
    cloneRoot.querySelectorAll("source"),
    normalizeClonedSource,
  );
  normalizePairedElements(
    sourceRoot.querySelectorAll("video"),
    cloneRoot.querySelectorAll("video"),
    normalizeClonedMedia,
  );
  normalizePairedElements(
    sourceRoot.querySelectorAll("audio"),
    cloneRoot.querySelectorAll("audio"),
    normalizeClonedMedia,
  );
  normalizePairedElements(
    sourceRoot.querySelectorAll("iframe"),
    cloneRoot.querySelectorAll("iframe"),
    normalizeClonedFrame,
  );
}

function normalizePairedElements(sourceElements, cloneElements, normalizer) {
  Array.from(sourceElements).forEach((sourceEl, index) => {
    const clonedEl = cloneElements[index];
    if (clonedEl) {
      normalizer(sourceEl, clonedEl);
    }
  });
}

function normalizeClonedImage(sourceEl, clonedEl) {
  const src = sourceEl.currentSrc || sourceEl.src || sourceEl.getAttribute("src");
  if (src) {
    clonedEl.setAttribute("src", resolveAssetUrl(src));
  }
  normalizeSrcset(sourceEl, clonedEl);
}

function normalizeClonedSource(sourceEl, clonedEl) {
  const src = sourceEl.src || sourceEl.getAttribute("src");
  if (src) {
    clonedEl.setAttribute("src", resolveAssetUrl(src));
  }
  normalizeSrcset(sourceEl, clonedEl);
}

function normalizeClonedMedia(sourceEl, clonedEl) {
  const src = sourceEl.currentSrc || sourceEl.src || sourceEl.getAttribute("src");
  if (src) {
    clonedEl.setAttribute("src", resolveAssetUrl(src));
  }

  const poster = sourceEl.getAttribute("poster");
  if (poster) {
    clonedEl.setAttribute("poster", resolveAssetUrl(poster));
  }
}

function normalizeClonedFrame(sourceEl, clonedEl) {
  const src = sourceEl.src || sourceEl.getAttribute("src");
  if (src) {
    clonedEl.setAttribute("src", resolveAssetUrl(src));
  }
}

function normalizeSrcset(sourceEl, clonedEl) {
  const srcset = sourceEl.getAttribute("srcset");
  if (!srcset) {
    return;
  }

  const normalized = srcset
    .split(",")
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      const url = parts.shift();
      if (!url) {
        return "";
      }
      return [resolveAssetUrl(url), ...parts].join(" ");
    })
    .filter(Boolean)
    .join(", ");

  clonedEl.setAttribute("srcset", normalized);
}

function resolveAssetUrl(url) {
  try {
    return new URL(url, document.baseURI).href;
  } catch (error) {
    return url;
  }
}

function captureVisualSnapshot(sourceRoot = document.body, cloneRoot = sourceRoot) {
  if (!sourceRoot || !cloneRoot) {
    return {
      body: {},
      elements: [],
    };
  }

  const sourceElements = Array.from(sourceRoot.querySelectorAll("*"));
  const cloneElements = Array.from(cloneRoot.querySelectorAll("*"));
  const elements = [];
  const maxElements = 2500;

  sourceElements.forEach((sourceEl, index) => {
    if (elements.length >= maxElements) {
      return;
    }

    const clonedEl = cloneElements[index];
    if (!clonedEl || shouldSkipVisualElement(sourceEl)) {
      return;
    }

    const rect = sourceEl.getBoundingClientRect();
    const style = getComputedStyle(sourceEl);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0 ||
      (rect.width === 0 && rect.height === 0)
    ) {
      return;
    }

    const id = `ui-${elements.length + 1}`;
    clonedEl.setAttribute("data-ui-clone-id", id);

    elements.push({
      id,
      tag: sourceEl.tagName.toLowerCase(),
      rect: {
        x: Math.round((rect.left + window.scrollX) * 100) / 100,
        y: Math.round((rect.top + window.scrollY) * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      },
      styles: pickComputedStyles(style),
      before: capturePseudoElement(sourceEl, "::before"),
      after: capturePseudoElement(sourceEl, "::after"),
    });
  });

  return {
    body: pickBodyStyles(getComputedStyle(document.body)),
    elements,
  };
}

function shouldSkipVisualElement(el) {
  return ["script", "style", "link", "meta", "noscript"].includes(
    el.tagName.toLowerCase()
  );
}

function pickComputedStyles(style) {
  const properties = [
    "display",
    "position",
    "z-index",
    "box-sizing",
    "width",
    "height",
    "min-width",
    "min-height",
    "max-width",
    "max-height",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "line-height",
    "letter-spacing",
    "text-align",
    "text-transform",
    "text-decoration-line",
    "white-space",
    "color",
    "background",
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "background-repeat",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-radius",
    "box-shadow",
    "opacity",
    "overflow",
    "overflow-x",
    "overflow-y",
    "object-fit",
    "object-position",
    "transform",
    "transform-origin",
    "filter",
    "backdrop-filter",
    "mix-blend-mode",
    "gap",
    "row-gap",
    "column-gap",
    "align-items",
    "align-content",
    "justify-items",
    "justify-content",
    "flex-direction",
    "flex-wrap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "order",
    "grid-template-columns",
    "grid-template-rows",
    "grid-column",
    "grid-row",
    "place-items",
    "clip-path",
  ];

  return properties.reduce((result, property) => {
    const value = style.getPropertyValue(property);
    if (shouldKeepStyleValue(property, value)) {
      result[property] = value;
    }
    return result;
  }, {});
}

function pickBodyStyles(style) {
  const styles = pickComputedStyles(style);
  delete styles.width;
  delete styles.height;
  delete styles.position;
  delete styles.display;
  return styles;
}

function shouldKeepStyleValue(property, value) {
  if (!value) {
    return false;
  }

  const ignoredValues = ["normal", "none", "auto", "0px", "rgba(0, 0, 0, 0)"];
  if (ignoredValues.includes(value) && !property.includes("background")) {
    return false;
  }

  return true;
}

function capturePseudoElement(el, pseudo) {
  const style = getComputedStyle(el, pseudo);
  const content = style.getPropertyValue("content");
  if (!content || content === "none" || content === "normal") {
    return null;
  }

  return {
    content,
    styles: pickComputedStyles(style),
  };
}
