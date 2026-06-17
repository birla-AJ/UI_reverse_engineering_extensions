function optimizeCss(css){

 if(!css){

  return ""

 }

 return css

 .replace(

 /\s+/g,

 " "

 )

 .replace(

 /;\s+/g,

 ";"

 )

 .replace(

 /\{\s+/g,

 "{"

 )

 .replace(

 /\s+\}/g,

 "}"

 )

 .trim()

}