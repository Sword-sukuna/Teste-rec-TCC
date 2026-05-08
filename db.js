
// =========================
// 💾 DATABASE
// =========================
let db;


// =========================
// 🚀 ABRIR DB
// =========================
const request =
  indexedDB.open(
    "FacePointDB",
    1
  );


// =========================
// 🛠 CRIAR TABELAS
// =========================
request.onupgradeneeded = e => {

  db = e.target.result;

  // pessoas
  if(
    !db.objectStoreNames.contains(
      "pessoas"
    )
  ){

    db.createObjectStore(
      "pessoas",
      {
        keyPath:"id",
        autoIncrement:true
      }
    );

  }

  // registros
  if(
    !db.objectStoreNames.contains(
      "registros"
    )
  ){

    db.createObjectStore(
      "registros",
      {
        keyPath:"id",
        autoIncrement:true
      }
    );

  }

};


// =========================
// ✅ DB OK
// =========================
request.onsuccess = e => {

  db = e.target.result;

  console.log("✅ DB carregado");

  if(
    typeof carregarPessoas
    ===
    "function"
  ){
    carregarPessoas();
  }

  if(
    typeof carregarRegistros
    ===
    "function"
  ){
    carregarRegistros();
  }

};


// =========================
// ❌ ERRO DB
// =========================
request.onerror = e => {

  console.error(
    "Erro DB",
    e
  );

};


// =========================
// 👤 SALVAR PESSOA
// =========================
function salvarPessoa(pessoa){

  const tx =
    db.transaction(
      "pessoas",
      "readwrite"
    );

  tx.objectStore(
    "pessoas"
  ).add(pessoa);

}


// =========================
// 📋 LISTAR PESSOAS
// =========================
function listarPessoas(callback){

  const tx =
    db.transaction(
      "pessoas",
      "readonly"
    );

  const req =
    tx.objectStore(
      "pessoas"
    ).getAll();

  req.onsuccess = () => {

    callback(req.result);

  };

}


// =========================
// 🗑 EXCLUIR PESSOA
// =========================
function deletarPessoa(id){

  const ok =
    confirm(
      "Excluir pessoa?"
    );

  if(!ok) return;

  const tx =
    db.transaction(
      "pessoas",
      "readwrite"
    );

  tx.objectStore(
    "pessoas"
  ).delete(id);

  tx.oncomplete = () => {

    carregarPessoas();

  };

}


// =========================
// 🕒 SALVAR REGISTRO
// =========================
function salvarRegistro(registro){

  const tx =
    db.transaction(
      "registros",
      "readwrite"
    );

  tx.objectStore(
    "registros"
  ).add(registro);

}


// =========================
// 📋 LISTAR REGISTROS
// =========================
function listarRegistros(callback){

  const tx =
    db.transaction(
      "registros",
      "readonly"
    );

  const req =
    tx.objectStore(
      "registros"
    ).getAll();

  req.onsuccess = () => {

    callback(
      req.result.reverse()
    );

  };

}