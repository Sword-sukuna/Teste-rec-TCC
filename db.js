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


      // 👨‍🎓 tabela alunos
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


// ➕ adicionar aluno
function adicionarAluno(aluno){

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


// 📋 listar alunos
function listarAlunos(){

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


// ❌ excluir aluno
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