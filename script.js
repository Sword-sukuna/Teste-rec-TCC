
// =========================
// 🔐 MODO
// =========================
const modoSistema =
  localStorage.getItem(
    "modo"
  );


// sem login
if(!modoSistema){

  location.href =
    "./login.html";

}

// =========================
// 🧠 FACEPOINT
// =========================

let processando = false;

// delay anti spam
const delayRegistro = 10000;

// último registro
let ultimoRegistro = {};



// =========================
// 🚀 INICIAR
// =========================
window.addEventListener(

  "DOMContentLoaded",

  async ()=>{

    // =====================
    // 🔐 ADMIN / MONITOR
    // =====================
    if(
      modoSistema
      ===
      "monitor"
    ){

      trocarModo(
        "monitor"
      );

    }else{

      trocarModo(
        "admin"
      );

    }


    // =====================
    // 📷 CAMERA
    // =====================
    await iniciarCamera();


    // =====================
    // 🧠 IA
    // =====================
    await carregarModelos();


    // =====================
    // 📋 DADOS
    // =====================
    carregarPessoas();

    carregarRegistros();

    carregarMonitor();


    // =====================
    // 👨‍💼 ADMIN
    // =====================
    if(
      modoSistema
      ===
      "admin"
    ){

      document
        .getElementById(
          "btnCadastrar"
        )
        .addEventListener(
          "click",
          cadastrarPessoa
        );

    }


    // =====================
    // 🔎 RECONHECIMENTO
    // =====================
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

    document
      .getElementById(
        "video"
      )
      .srcObject = stream;

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
    document
    .getElementById(
      "nome"
    )
    .value
    .trim();

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
    )
    .value = "";

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
                faceapi
                .euclideanDistance(
                  faceAtual,
                  pessoa.face
                );

              if(dist < 0.5){

                reconhecido = true;

                registrarPonto(
                  pessoa
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
function registrarPonto(pessoa){

  const agora =
    Date.now();

  // anti spam
  if(

    ultimoRegistro[
      pessoa.id
    ]

    &&

    agora -
    ultimoRegistro[
      pessoa.id
    ]
    <
    delayRegistro

  ){

    return;

  }

  ultimoRegistro[
    pessoa.id
  ] = agora;


  // =====================
  // 📅 DATA
  // =====================
  const dataObj =
    new Date();

  const horario =
    dataObj.toLocaleTimeString(
      "pt-BR"
    );

  const data =
    dataObj.toLocaleDateString(
      "pt-BR"
    );


  // =====================
  // 🔄 ENTRADA / SAÍDA
  // =====================
  listarRegistrosPessoa(

    pessoa.id,

    registros=>{

      let tipo =
        "Entrada";

      // último registro
      const ultimo =
        registros[
          registros.length - 1
        ];

      // alterna
      if(ultimo){

        tipo =
          ultimo.tipo
          ===
          "Entrada"
          ?
          "Saída"
          :
          "Entrada";

      }


      // =================
      // 💾 SALVAR
      // =================
      salvarRegistro({

        pessoaId:
          pessoa.id,

        nome:
          pessoa.nome,

        horario,

        data,

        tipo

      });


      // atualizar UI
      carregarRegistros();

      carregarMonitor();


      atualizarStatus(

        `✅ ${pessoa.nome}
         registrou ${tipo}
         às ${horario}`

      );

    }

  );

}


// =========================
// 👥 CARREGAR PESSOAS
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

            <div class="item-info">

              <strong>
                👤 ${pessoa.nome}
              </strong>

              <small>
                ID: ${pessoa.id}
              </small>

            </div>


            <div class="item-actions">

              <button
                class="
                  small-btn
                  view-btn
                "
                onclick="
                  abrirHistorico(
                    ${pessoa.id},
                    '${pessoa.nome}'
                  )
                "
              >

                Pontos

              </button>


              <button
                class="
                  small-btn
                  delete-btn
                "
                onclick="
                  deletarPessoa(
                    ${pessoa.id}
                  )
                "
              >

                Excluir

              </button>

            </div>

          `;

          lista.appendChild(div);

        }
      );

    }
  );

}


// =========================
// 🕒 CARREGAR REGISTROS
// =========================
function carregarRegistros(){

  listarRegistros(
    registros=>{

      const box =
        document.getElementById(
          "registros"
        );

      box.innerHTML = "";

      registros
      .slice(0,10)
      .forEach(
        registro=>{

          const div =
            document
            .createElement("div");

          div.className =
            "item";

          div.innerHTML = `

            <div class="item-info">

              <strong>
                ✅ ${registro.nome}
              </strong>

              <small>
                ${registro.data}
              </small>

            </div>

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
// 📋 HISTÓRICO
// =========================
function abrirHistorico(
  pessoaId,
  nome
){

  document
    .getElementById(
      "modal"
    )
    .classList
    .add("show");

  document
    .getElementById(
      "modalNome"
    )
    .innerText =
    `📋 ${nome}`;

  listarRegistrosPessoa(
    pessoaId,

    registros=>{

      const box =
        document.getElementById(
          "modalRegistros"
        );

      box.innerHTML = "";

      if(
        registros.length
        ===
        0
      ){

        box.innerHTML =
          `
            <p>
              Nenhum registro
            </p>
          `;

        return;

      }

      registros.forEach(
        registro=>{

          const div =
            document
            .createElement("div");

          div.className =
            "registro-item";

          div.innerHTML = `

            <span>
              📅 ${registro.data}
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
// ❌ FECHAR MODAL
// =========================
function fecharModal(){

  document
    .getElementById(
      "modal"
    )
    .classList
    .remove("show");

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


// =========================
// 🔀 TROCAR MODO
// =========================
function trocarModo(modo){

  // tabs
  document
    .querySelectorAll(".tab")
    .forEach(
      t=>t.classList.remove(
        "active"
      )
    );

  // ativa tab correta
  if(modo==="admin"){

    document
      .querySelectorAll(".tab")[0]
      .classList
      .add("active");

  }else{

    document
      .querySelectorAll(".tab")[1]
      .classList
      .add("active");

  }

  // áreas
  document
    .getElementById(
      "adminArea"
    )
    .style.display =
    modo==="admin"
    ? "block"
    : "none";

  document
    .getElementById(
      "monitorArea"
    )
    .style.display =
    modo==="monitor"
    ? "block"
    : "none";

}


// =========================
// 👀 MONITOR TEMPO REAL
// =========================
function carregarMonitor(){

  listarRegistros(
    registros=>{

      const box =
        document.getElementById(
          "monitorRegistros"
        );

      if(!box) return;

      box.innerHTML = "";

      registros
      .slice(0,20)
      .forEach(
        registro=>{

          const div =
            document
            .createElement("div");

          div.className =
            "item";

          div.innerHTML = `

            <div class="item-info">

              <strong>
                👤 ${registro.nome}
              </strong>

              <small>
                📅 ${registro.data}
              </small>

            </div>

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
// 🔄 AUTO UPDATE
// =========================
setInterval(()=>{

  carregarMonitor();

},2000);




// =========================
// 📋 HISTÓRICO MELHORADO
// =========================
function abrirHistorico(
  pessoaId,
  nome
){

  document
    .getElementById(
      "modal"
    )
    .classList
    .add("show");

  document
    .getElementById(
      "modalNome"
    )
    .innerText =
    `📋 ${nome}`;

  listarRegistrosPessoa(

    pessoaId,

    registros=>{

      const box =
        document
        .getElementById(
          "modalRegistros"
        );

      box.innerHTML = "";

      if(
        registros.length
        ===
        0
      ){

        box.innerHTML =
        `
          <p>
            Nenhum registro
          </p>
        `;

        return;

      }

      registros.forEach(
        registro=>{

          const div =
            document
            .createElement("div");

          div.className =
            "registro-item";

          div.innerHTML = `

            <div>

              <strong>
                📅 ${registro.data}
              </strong>

              <p>
                ${registro.horario}
              </p>

            </div>


            <button

              class="
                small-btn
                delete-btn
              "

              onclick="
                excluirRegistroHistorico(
                  ${registro.id},
                  ${pessoaId},
                  '${nome}'
                )
              "

            >

              Excluir

            </button>

          `;

          box.appendChild(div);

        }
      );

    }

  );

}



// =========================
// 🗑 EXCLUIR HISTÓRICO
// =========================
function excluirRegistroHistorico(

  registroId,
  pessoaId,
  nome

){

  deletarRegistro(
    registroId
  );

  setTimeout(()=>{

    abrirHistorico(
      pessoaId,
      nome
    );

    carregarRegistros();

    carregarMonitor();

  },300);

}