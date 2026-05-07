
// DOM helper
function $(id) {
  return document.getElementById(id);
}


// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const btn = $("cadastrar");

  if (btn) {
    btn.addEventListener("click", cadastrar);
  }

});


// =============================
// CADASTRAR
// =============================
function cadastrar() {

  const nome = $("nome");
  const lista = $("lista");

  if (!nome || !lista) return;

  if (!nome.value.trim()) return;

  const div = document.createElement("div");
  div.innerText = nome.value;

  lista.appendChild(div);

  nome.value = "";

}