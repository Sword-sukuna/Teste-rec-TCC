let db;

const req = indexedDB.open("FacePresenceDB", 1);

req.onupgradeneeded = (e)=>{

  db = e.target.result;

  db.createObjectStore("alunos", {
    keyPath:"id",
    autoIncrement:true
  });

  db.createObjectStore("presencas", {
    keyPath:"id",
    autoIncrement:true
  });

};

req.onsuccess = (e)=>{
  db = e.target.result;
  carregarAlunos();
};


function salvarAluno(aluno){

  const tx = db.transaction("alunos", "readwrite");

  tx.objectStore("alunos").add(aluno);

}


function listarAlunos(callback){

  const tx = db.transaction("alunos", "readonly");

  const req = tx.objectStore("alunos").getAll();

  req.onsuccess = ()=> callback(req.result);

}


function deletarAluno(id){

  const tx = db.transaction("alunos", "readwrite");

  tx.objectStore("alunos").delete(id);

  carregarAlunos();

}