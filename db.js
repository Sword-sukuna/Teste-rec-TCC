let db;


// 🚀 iniciar banco
function iniciarDB(){

  return new Promise((resolve,reject)=>{

    const request =
    indexedDB.open(
      "EduBlockDB",
      1
    );


    request.onupgradeneeded =
    event=>{

      db =
      event.target.result;


      if(
        !db.objectStoreNames
        .contains("alunos")
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


    request.onsuccess =
    event=>{

      db =
      event.target.result;

      resolve();

    };


    request.onerror =
    ()=>{

      reject(
        "Erro no banco"
      );

    };

  });

}


// ➕ adicionar
function adicionarAlunoDB(aluno){

  return new Promise((resolve)=>{

    const tx =
    db.transaction(
      "alunos",
      "readwrite"
    );

    const store =
    tx.objectStore(
      "alunos"
    );

    store.add(aluno);

    tx.oncomplete =
    ()=>resolve();

  });

}


// 📋 listar
function listarAlunosDB(){

  return new Promise((resolve)=>{

    const tx =
    db.transaction(
      "alunos",
      "readonly"
    );

    const store =
    tx.objectStore(
      "alunos"
    );

    const request =
    store.getAll();


    request.onsuccess =
    ()=>{

      resolve(
        request.result
      );

    };

  });

}


// ❌ excluir
function excluirAlunoDB(id){

  return new Promise((resolve)=>{

    const tx =
    db.transaction(
      "alunos",
      "readwrite"
    );

    const store =
    tx.objectStore(
      "alunos"
    );

    store.delete(id);

    tx.oncomplete =
    ()=>resolve();

  });

}


// ✏ atualizar
function atualizarAlunoDB(aluno){

  return new Promise((resolve)=>{

    const tx =
    db.transaction(
      "alunos",
      "readwrite"
    );

    const store =
    tx.objectStore(
      "alunos"
    );

    store.put(aluno);

    tx.oncomplete =
    ()=>resolve();

  });

}