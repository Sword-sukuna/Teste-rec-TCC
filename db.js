let db;
const req=indexedDB.open("FaceDB",1);

req.onupgradeneeded=e=>{
 db=e.target.result;
 db.createObjectStore("alunos",{keyPath:"id",autoIncrement:true});
};

req.onsuccess=e=>{
 db=e.target.result;
 carregarAlunos();
};

function salvarAluno(a){
 db.transaction("alunos","readwrite")
 .objectStore("alunos").add(a);
}

function listarAlunos(cb){
 const r=db.transaction("alunos","readonly")
 .objectStore("alunos").getAll();
 r.onsuccess=()=>cb(r.result);
}

function deletarAluno(id){
 db.transaction("alunos","readwrite")
 .objectStore("alunos").delete(id);
 carregarAlunos();
}