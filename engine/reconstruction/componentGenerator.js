function generateComponents(data) {
  return {
    navbar: generateNavbar(data),
    hero: generateHero(data),
    footer: generateFooter(data),
    cards: generateCards(data),
  };
}

function generateNavbar(data) {
  if (!data.navbar) {
    return "";
  }
  return `

<nav>

 Navbar

</nav>

`;
}

function generateHero(data) {
  if (!data.hero) {
    return "";
  }
  return `

<section>

 Hero

</section>

`;
}

function generateFooter(data) {
  if (!data.footer) {
    return "";
  }
  return `

<footer>

 Footer

</footer>

`;
}

function generateCards(data) {
  return `

<section>

 Cards

</section>

`;
}
