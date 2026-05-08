
// =========================
// 🔐 SENHA ADMIN
// =========================
const senhaAdmin =
  "Silvano@rosa10";


// =========================
// 👨‍💼 LOGIN ADMIN
// =========================
function loginAdmin(){

  const senha =
    document
    .getElementById(
      "senha"
    )
    .value;

  const erro =
    document
    .getElementById(
      "erroLogin"
    );

  if(
    senha
    ===
    senhaAdmin
  ){

    // salva modo
    localStorage.setItem(
      "modo",
      "admin"
    );

    // entrar
    location.href =
      "./index.html";

  }else{

    erro.innerText =
      "❌ Senha incorreta";

  }

}


// =========================
// 👀 MONITOR
// =========================
function entrarMonitor(){

  localStorage.setItem(
    "modo",
    "monitor"
  );

  location.href =
    "./index.html";

}