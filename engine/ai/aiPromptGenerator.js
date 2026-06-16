function generateAiPrompt(project) {
  return `

Rebuild this website.

Title:

${project.analysis?.metadata?.title}

Create:

- React components

- Responsive layout

- Reusable sections

- Modern CSS

- Accessibility support

Use this design system:

${JSON.stringify(
  project.design || {},

  null,

  2,
)}

`;
}
