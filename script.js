
// =========================
// 🧠 FACEPOINT MOBILE
// =========================

let faceAtual = null;

let processando = false;

// delay anti spam
const delayRegistro = 10000;

// ultimo registro
let ultimoRegistro = {};


// =========================
// 🚀 INICIAR
// =========================
window.addEventListener(
  "DOMContentLoaded",
  async ()=>{

    await iniciarCamera();

    await carregarModelos();

    carregarPessoas();

    carregarRegistros();

    document
      .getElementById(
        "btnCadastrar"
      )
      .addEventListener(
        "click",
        cadastrarPessoa
      );

    iniciarReconhecimento();

  }
);


// =========================
// 📷 CAMERA
// =========================
async function iniciarCamera(){

  try{

    const stream =
      await navigator
      .mediaDevices
      .getUserMedia({
        video:{
          facingMode:"user"
        },
        audio:false
      });

    const video =
      document.getElementById(
        "video"
      );

    video.srcObject = stream;

  }catch(e){

    alert(
      "Erro ao acessar câmera"
    );

    console.error(e);

  }

}


// =========================
// 🧠 MODELOS
// =========================
async function carregarModelos(){

  atualizarStatus(
    "📦 Carregando IA..."
  );

  await faceapi
    .nets
    .tinyFaceDetector
    .loadFromUri("./models");

  await faceapi
    .nets
    .faceLandmark68Net
    .loadFromUri("./models");

  await faceapi
    .nets
    .faceRecognitionNet
    .loadFromUri("./models");

  atualizarStatus(
    "✅ IA carregada"
  );

}


// =========================
// 👤 CADASTRAR
// =========================
async function cadastrarPessoa(){

  if(processando) return;

  processando = true;

  const nome =
    document.getElementById(
      "nome"
    ).value.trim();

  if(!nome){

    alert(
      "Digite um nome"
    );

    processando = false;

    return;

  }

  atualizarStatus(
    "📸 Capturando rosto..."
  );

  const video =
    document.getElementById(
      "video"
    );

  const deteccao =
    await faceapi
    .detectSingleFace(
      video,
      new faceapi
      .TinyFaceDetectorOptions()
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if(!deteccao){

    atualizarStatus(
      "❌ Nenhum rosto detectado"
    );

    processando = false;

    return;

  }

  const face =
    Array.from(
      deteccao.descriptor
    );

  salvarPessoa({
    nome,
    face
  });

  document
    .getElementById(
      "nome"
    ).value = "";

  carregarPessoas();

  atualizarStatus(
    `✅ ${nome} cadastrado`
  );

  processando = false;

}


// =========================
// 🔎 RECONHECIMENTO
// =========================
async function iniciarReconhecimento(){

  const video =
    document.getElementById(
      "video"
    );

  setInterval(
    async ()=>{

      if(processando) return;

      processando = true;

      const deteccao =
        await faceapi
        .detectSingleFace(
          video,
          new faceapi
          .TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if(!deteccao){

        processando = false;

        return;

      }

      const faceAtual =
        deteccao.descriptor;

      listarPessoas(
        pessoas=>{

          let reconhecido =
            false;

          pessoas.forEach(
            pessoa=>{

              const dist =
                faceapi.euclideanDistance(
                  faceAtual,
                  pessoa.face
                );

              // menor = melhor
              if(
                dist < 0.5
              ){

                reconhecido = true;

                registrarPonto(
                  pessoa.nome
                );

              }

            }
          );

          if(!reconhecido){

            atualizarStatus(
              "🔎 Rosto desconhecido"
            );

          }

          processando = false;

        }
      );

    },

    2000
  );

}


// =========================
// 🕒 REGISTRAR PONTO
// =========================
function registrarPonto(nome){

  const agora =
    Date.now();

  // delay anti spam
  if(
    ultimoRegistro[nome]
    &&
    agora -
    ultimoRegistro[nome]
    <
    delayRegistro
  ){

    return;

  }

  ultimoRegistro[nome] =
    agora;

  const horario =
    new Date()
    .toLocaleTimeString(
      "pt-BR"
    );

  salvarRegistro({
    nome,
    horario
  });

  carregarRegistros();

  atualizarStatus(
    `✅ ${nome} registrado às ${horario}`
  );

}


// =========================
// 📋 PESSOAS
// =========================
function carregarPessoas(){

  listarPessoas(
    pessoas=>{

      const lista =
        document.getElementById(
          "lista"
        );

      lista.innerHTML = "";

      pessoas.forEach(
        pessoa=>{

          const div =
            document
            .createElement("div");

          div.className =
            "item";

          div.innerHTML = `
            <span>
              👤 ${pessoa.nome}
            </span>

            <button
              class="delete"
              onclick="
                deletarPessoa(${pessoa.id})
              "
            >
              Excluir
            </button>
          `;

          lista.appendChild(div);

        }
      );

    }
  );

}


// =========================
// 🕒 REGISTROS
// =========================
function carregarRegistros(){

  listarRegistros(
    registros=>{

      const box =
        document.getElementById(
          "registros"
        );

      box.innerHTML = "";

      registros.forEach(
        registro=>{

          const div =
            document
            .createElement("div");

          div.className =
            "item";

          div.innerHTML = `
            <span>
              ✅ ${registro.nome}
            </span>

            <strong>
              ${registro.horario}
            </strong>
          `;

          box.appendChild(div);

        }
      );

    }
  );

}


// =========================
// 📡 STATUS
// =========================
function atualizarStatus(texto){

  document
    .getElementById(
      "status"
    )
    .innerText = texto;

}