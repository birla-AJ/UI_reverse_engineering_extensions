function generateSourceFiles(project) {
  return {
    appJs: generateAppJs(project),
    appCss: generateAppCss(project),
  };
}

function generateAppJs(project) {
  return `

console.log(

 "Website Clone Loaded"

)

`;
}

function generateAppCss(project) {
  return project.css || "";
}
