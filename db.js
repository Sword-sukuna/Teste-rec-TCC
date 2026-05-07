
let db;

const req = indexedDB.open("presenca", 1);

req.onupgradeneeded = (e) => {

  db = e.target.result;

  db.createObjectStore("alunos", {
    keyPath: "id",
    autoIncrement: true
  });

};

req.onsuccess = (e) => {
  db = e.target.result;
};