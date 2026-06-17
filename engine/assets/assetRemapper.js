function remapAssets(

 html,

 project

){

 if(

  !html||

  !project

 ){

  return html

 }

 const assets=

 project.localAssets||

 {}

 Object.keys(

  assets.images||{}

 )

 .forEach(url=>{

  html=

  html.replaceAll(

   url,

   assets.images[url]

  )

 })

 Object.keys(

  assets.videos||{}

 )

 .forEach(url=>{

  html=

  html.replaceAll(

   url,

   assets.videos[url]

  )

 })

 return html

}