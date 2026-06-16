function generateReplayJs(project) {
  let js = ``;
  js += generateStickyReplay(project);
  js += generateHoverReplay(project);
  js += generateDropdownReplay(project);
  return js;
}

function generateStickyReplay(project) {
  return `

window.addEventListener(

"scroll",

()=>{

 document

 .querySelectorAll(

  "[data-sticky]"

 )

 .forEach(el=>{

  if(

   window.scrollY>50

  ){

   el.classList.add(

    "sticky-active"

   )

  }

 })

})

`;
}

function generateHoverReplay(project) {
  return `

document

.querySelectorAll(

"a,button"

)

.forEach(el=>{

 el.addEventListener(

 "mouseenter",

 ()=>{

  el.classList.add(

   "hover-active"

  )

 }

 )

})

`;
}

function generateDropdownReplay(project) {
  return `

document

.querySelectorAll(

"[aria-expanded]"

)

.forEach(el=>{

 el.addEventListener(

 "click",

 ()=>{

  el.classList.toggle(

   "open"

  )

 }

 )

})

`;
}
