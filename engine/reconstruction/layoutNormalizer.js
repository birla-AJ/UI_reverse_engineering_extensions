function normalizeLayout(project) {
  if (!project) {
    return project;
  }
  let css = project.css || "";
  css += `

*{

 box-sizing:

 border-box

}

img{

 max-width:

 100%;

 height:auto

}

body{

 margin:0;

 overflow-x:hidden

}

`;
  css = fixFlex(css);
  css = fixGrid(css);
  css = fixDimensions(css);
  project.css = css;
  return project;
}

function fixFlex(css) {
  return (
    css +
    `

[class*="flex"]{

 display:flex

}

`
  );
}

function fixGrid(css) {
  return (
    css +
    `

[class*="grid"]{

 display:grid

}

`
  );
}

function fixDimensions(css) {
  return (
    css +
    `

*{

 min-width:0

}

`
  );
}
