function normalizeButtons(project){

 if(!project){

  return

 }

 project.css+=`

button{

 cursor:pointer;

 transition:.3s;

}

button:hover{

 opacity:.9

}

`

}