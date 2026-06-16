function generateSummaryFile(data) {
  return `

Website Summary

Navbar:

${data.navbar ? "YES" : "NO"}

Hero:

${data.hero ? "YES" : "NO"}

Footer:

${data.footer ? "YES" : "NO"}

Behaviors:

${data.behaviors ? "YES" : "NO"}

Hover:

${data.hover ? data.hover.length : 0}

`;
}
