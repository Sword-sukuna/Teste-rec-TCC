
// =============================
// 💾 DATABASE
// =============================
let db;


// =============================
// 🚀 ABRIR DATABASE
// =============================
const req =
  indexedDB.open("FaceDB", 1);


// =============================
// 🛠 CRIAR TABELAS
// =============================
req.onupgradeneeded = e => {

  db = e.target.result;

  // alunos
  if(
    !db.objectStoreNames.contains("alunos")
  ){

    db.createObjectStore(
      "alunos",
      {
        keyPath:"id",
        autoIncrement:true
      }
    );

  }

};


// =============================
// ✅ DB OK
// =============================
req.onsuccess = e => {

  db = e.target.result;

  console.log("✅ Banco carregado");

  // evita erro caso função ainda não exista
  if(
    typeof carregarAlunos === "function"
  ){
    carregarAlunos();
  }

};


// =============================
// ❌ ERRO DB
// =============================
req.onerror = e => {

  console.error(
    "Erro IndexedDB:",
    e
  );

};


// =============================
// 💾 SALVAR ALUNO
// =============================
function salvarAluno(aluno){

  if(!db){

    alert("Banco não carregado");

    return;

  }

  const tx =
    db.transaction(
      "alunos",
      "readwrite"
    );

  tx.objectStore("alunos")
    .add(aluno);

  tx.oncomplete = ()=>{

    console.log("Aluno salvo");

  };

}


// =============================
// 📋 LISTAR
// =============================
function listarAlunos(callback){

  if(!db) return;

  const tx =
    db.transaction(
      "alunos",
      "readonly"
    );

  const req =
    tx.objectStore("alunos")
    .getAll();

  req.onsuccess = ()=>{

    callback(req.result);

  };

}


// =============================
// 🗑 EXCLUIR
// =============================
function deletarAluno(id){

  if(!db) return;

  const ok =
    confirm(
      "Excluir aluno?"
    );

  if(!ok) return;

  const tx =
    db.transaction(
      "alunos",
      "readwrite"
    );

  tx.objectStore("alunos")
    .delete(id);

  tx.oncomplete = ()=>{

    carregarAlunos();

  };

}