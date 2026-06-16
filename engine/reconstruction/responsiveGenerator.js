function generateResponsiveCss() {
  return `

@media(

 max-width:1024px

){

 img{

  max-width:100%

 }

}

@media(

 max-width:768px

){

 body{

  overflow-x:hidden

 }

}

@media(

 max-width:480px

){

 body{

  font-size:14px

 }

}

`;
}
