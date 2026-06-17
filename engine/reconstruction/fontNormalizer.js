function normalizeFonts(project) {

    if (!project) {
        return
    }

    project.css += `
body{
 font-family:
 Inter,
 Arial,
 sans-serif;
}`
}