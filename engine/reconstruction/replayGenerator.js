function generateReplayJs(project) {
  let js = ``;
  js += generateBaseReplay(project);
  js += generateStickyReplay(project);
  js += generateHoverReplay(project);
  js += generateDropdownReplay(project);
  js += generateFormReplay(project);
  js += generateTabReplay(project);
  js += generateHashLinkReplay(project);
  return js;
}

function generateBaseReplay(project) {
  return `

document.documentElement.classList.add("clone-ready");

document.addEventListener("click", function(event) {
 const disabled = event.target.closest("[disabled], [aria-disabled='true']");
 if (disabled) {
  event.preventDefault();
 }
});

`;
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

document
.querySelectorAll(
 ".dropdown-toggle,[data-toggle='dropdown'],[data-bs-toggle='dropdown']"
)
.forEach(el=>{
 el.addEventListener("click", event=>{
  event.preventDefault();
  const parent = el.closest(".dropdown,.nav-item") || el.parentElement;
  if(parent){
   parent.classList.toggle("show");
   parent.querySelectorAll(".dropdown-menu").forEach(menu=>{
    menu.classList.toggle("show");
   });
  }
  el.setAttribute("aria-expanded", el.getAttribute("aria-expanded")==="true" ? "false" : "true");
 });
})

`;
}

function generateFormReplay(project) {
  return `

document
.querySelectorAll("form")
.forEach(form=>{
 form.addEventListener("submit", event=>{
  event.preventDefault();
 });
});

document
.querySelectorAll("input, textarea, select")
.forEach(control=>{
 control.addEventListener("input", ()=>{
  if(control.type === "checkbox" || control.type === "radio"){
   control.toggleAttribute("checked", control.checked);
   return;
  }
  control.setAttribute("value", control.value);
 });
});

`;
}

function generateTabReplay(project) {
  return `

document
.querySelectorAll("[role='tab'],[data-toggle='tab'],[data-bs-toggle='tab']")
.forEach(tab=>{
 tab.addEventListener("click", event=>{
  event.preventDefault();
  const targetSelector = tab.getAttribute("href") || tab.dataset.target || tab.dataset.bsTarget;
  const group = tab.closest("[role='tablist']") || tab.parentElement;
  if(group){
   group.querySelectorAll("[role='tab'],[data-toggle='tab'],[data-bs-toggle='tab']").forEach(item=>{
    item.classList.remove("active");
    item.setAttribute("aria-selected","false");
   });
  }
  tab.classList.add("active");
  tab.setAttribute("aria-selected","true");
  if(targetSelector && targetSelector.startsWith("#")){
   document.querySelectorAll(".tab-pane,[role='tabpanel']").forEach(panel=>{
    panel.classList.remove("active","show");
   });
   const target = document.querySelector(targetSelector);
   if(target){
    target.classList.add("active","show");
   }
  }
 });
});

`;
}

function generateHashLinkReplay(project) {
  return `

document
.querySelectorAll("a[href^='#']")
.forEach(link=>{
 link.addEventListener("click", event=>{
  const href = link.getAttribute("href");
  if(!href || href === "#"){
   event.preventDefault();
   return;
  }
  const target = document.querySelector(href);
  if(target){
   event.preventDefault();
   target.scrollIntoView({behavior:"smooth", block:"start"});
  }
 });
});

`;
}
