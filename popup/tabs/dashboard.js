function renderDashboard() {
  const data = window.dashboardData || {};

  document.getElementById("tabContent").innerHTML = `

<div class="card">

Components

<h2>

${data.components || 0}

</h2>

</div>

<div class="card">

Assets

<h2>

${data.assets || 0}

</h2>

</div>

<div class="card">

Exports

<h2>

${data.exports || 0}

</h2>

</div>

`;
}
