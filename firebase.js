// 🔥 IMPORTS FIREBASE
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  onValue
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// 🔥 CONFIG FIREBASE
const firebaseConfig = {

  apiKey: "SUA_API_KEY",

  authDomain:
  "SEU-PROJETO.firebaseapp.com",

  databaseURL:
  "https://SEU-PROJETO-default-rtdb.firebaseio.com",

  projectId:
  "SEU-PROJETO",

  storageBucket:
  "SEU-PROJETO.appspot.com",

  messagingSenderId:
  "123456789",

  appId:
  "APP_ID"

};


// 🔥 INICIAR FIREBASE
const app =
initializeApp(firebaseConfig);

const db =
getDatabase(app);


// EXPORTAR
export {
  db,
  ref,
  set,
  onValue
};