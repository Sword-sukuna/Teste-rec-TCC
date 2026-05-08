
let face = null;


// =============================
// 🚀 INICIAR
// =============================
window.addEventListener("DOMContentLoaded", async () => {

  sec("dash");

  await cam();

  await modelos();

  // botões
  document
    .getElementById("cap")
    .addEventListener("click", capturar);

  document
    .getElementById("save")
    .addEventListener("click", salvar);

  document
    .getElementById("busca")
    .addEventListener("input", filtro);

});


// =============================
// 📂 TROCAR SEÇÃO
// =============================
function sec(id){

  document
    .querySelectorAll("section")
    .forEach(s => {
      s.classList.remove("on");
    });

  document
    .getElementById(id)
    .classList.add("on");

}


// =============================
// 📷 INICIAR CAMERA
// =============================
async function cam(){

  try{

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video:true
      });

    const video =
      document.getElementById("video");

    video.srcObject = stream;

  }catch(e){

    alert("Camera indisponível");

    console.error(e);

  }

}


// =============================
// 🧠 CARREGAR MODELOS
// =============================
async function modelos(){

  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");

  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

  await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

}


// =============================
// 📸 CAPTURAR FACE
// =============================
async function capturar(){

  const video =
    document.getElementById("video");

  const d = await faceapi
    .detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if(!d){

    alert("Nenhum rosto");

    return;

  }

  face = Array.from(d.descriptor);

  alert("Face capturada");

}


// =============================
// 💾 SALVAR
// =============================
function salvar(){

  const nome =
    document.getElementById("nome");

  if(!nome.value || !face){

    alert("Complete os dados");

    return;

  }

  salvarAluno({
    nome:nome.value,
    face
  });

  nome.value = "";

  face = null;

  carregarAlunos();

}


// =============================
// 📋 LISTAR
// =============================
function carregarAlunos(){

  listarAlunos(a => {

    const lista =
      document.getElementById("lista");

    const ta =
      document.getElementById("ta");

    lista.innerHTML = "";

    ta.innerText = a.length;

    a.forEach(x => {

      const d =
        document.createElement("div");

      d.className = "aluno";

      d.innerHTML = `
        <span>${x.nome}</span>

        <button onclick="deletarAluno(${x.id})">
          Excluir
        </button>
      `;

      lista.appendChild(d);

    });

  });

}


// =============================
// 🔎 FILTRO
// =============================
function filtro(e){

  document
    .querySelectorAll(".aluno")
    .forEach(a => {

      a.style.display =
        a.innerText
        .toLowerCase()
        .includes(
          e.target.value.toLowerCase()
        )
        ? "flex"
        : "none";

    });

}