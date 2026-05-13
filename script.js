
// =========================
// 🧠 RECONHECIMENTO ESTÁVEL
// =========================
let rostoAtual = null;

let framesReconhecidos = 0;

const framesNecessarios = 2;

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

  // abrir monitor
  trocarModo(
    "monitor"
  );

  // esconder admin
  const admin =
    document.getElementById(
      "adminArea"
    );

  if(admin){

    admin.remove();

  }

  // esconder tabs
  const tabs =
    document.querySelector(
      ".tabs"
    );

  if(tabs){

    tabs.style.display =
      "none";

  }

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

    video.srcObject =
      stream;

    await video.play();

  }catch(e){

    console.error(e);

    atualizarStatus(
      "❌ Camera indisponível"
    );

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
// 👤 CADASTRAR PESSOA
// =========================
async function cadastrarPessoa(){

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

    return;

  }


  atualizarStatus(
    "📸 Capturando rosto..."
  );


  // =====================
  // 🧠 MULTI CAPTURA
  // =====================
  const descritores = [];


  for(
    let i=0;
    i<5;
    i++
  ){

    atualizarStatus(

      `📸 Captura ${
        i+1
      } de 5`

    );

    await esperar(700);

    const deteccao =
      await faceapi
      .detectSingleFace(

        video,

        
new faceapi
.TinyFaceDetectorOptions({

  inputSize:256,

  scoreThreshold:0.3

})

      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if(
      deteccao
    ){

      descritores.push(
        deteccao.descriptor
      );

    }

  }


  // sem capturas
  if(
    descritores.length
    <
    3
  ){

    atualizarStatus(
      "❌ Falha facial"
    );

    return;

  }


  // =====================
  // 🧮 MÉDIA FACIAL
  // =====================
  const media =
    calcularMediaFace(
      descritores
    );


  // =====================
  // 💾 SALVAR
  // =====================
  salvarPessoa({

    nome,

    face:
      Array.from(media)

  });


  // limpar
  document
    .getElementById(
      "nome"
    )
    .value = "";


  atualizarStatus(

    `✅ ${nome}
     cadastrado`

  );


  carregarPessoas();

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
.TinyFaceDetectorOptions({

  inputSize:256,

  scoreThreshold:0.3

})
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

              
if(dist < 0.58){

  reconhecido = true;


  // =====================
  // 🧠 ESTABILIZAÇÃO
  // =====================
  if(

    rostoAtual
    ===
    pessoa.id

  ){

    framesReconhecidos++;

  }else{

    rostoAtual =
      pessoa.id;

    framesReconhecidos = 1;

  }


  // confirmou rosto
  if(

    framesReconhecidos
    >=
    framesNecessarios

  ){

    registrarPonto(
      pessoa
    );

    framesReconhecidos = 0;

  }

}else{

  rostoAtual = null;

  framesReconhecidos = 0;

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


// 🔊 som
tocarSom();

// 🗣 voz
falar(

  `${pessoa.nome}
   registrou
   ${tipo}`

);


// efeito visual
document
  .body
  .classList
  .add(
    "face-detected"
  );

setTimeout(()=>{

  document
    .body
    .classList
    .remove(
      "face-detected"
    );

},1500);

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

if(!lista) return;

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

if(!box) return;

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
function atualizarStatus(
  texto
){

  const box =
    document.getElementById(
      "status"
    );

  if(box){

    box.innerText = texto;

  }

  atualizarMonitorStatus(
    texto
  );

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


// =========================
// 🕒 RELÓGIO
// =========================
function atualizarRelogio(){

  const agora =
    new Date();

  const hora =
    agora.toLocaleTimeString(
      "pt-BR"
    );

  const data =
    agora.toLocaleDateString(
      "pt-BR"
    );

  const h =
    document.getElementById(
      "clockHora"
    );

  const d =
    document.getElementById(
      "clockData"
    );

  if(h) h.innerText = hora;

  if(d) d.innerText = data;

}


// atualizar relógio
setInterval(

  atualizarRelogio,

  1000

);


// iniciar
atualizarRelogio();




// =========================
// 👀 MONITOR STATUS
// =========================
function atualizarMonitorStatus(
  texto
){

  const box =
    document.getElementById(
      "monitorStatus"
    );

  if(!box) return;

  box.innerText = texto;

}




// =========================
// 👀 MONITOR MELHORADO
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
      .slice(0,15)
      .forEach(

        registro=>{

          const div =
            document
            .createElement("div");

          div.className =
            "item live-registro";

          div.innerHTML = `

            <div class="item-info">

              <strong>

                👤 ${registro.nome}

              </strong>

              <small>

                📅 ${registro.data}

              </small>

            </div>


            <div>

              <strong>

                ${registro.horario}

              </strong>

              <p>

                ${registro.tipo || "Entrada"}

              </p>

            </div>

          `;

          box.appendChild(div);

        }

      );

    }

  );

}


// =========================
// 🔊 SOM
// =========================
function tocarSom(){

  const audio =
    new Audio(

      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"

    );

  audio.volume = 0.5;

  audio.play().catch(()=>{});

}

// =========================
// 🗣 VOZ
// =========================
function falar(texto){

  if(
    !("speechSynthesis" in window)
  ) return;

  const voz =
    new SpeechSynthesisUtterance(
      texto
    );

  voz.lang = "pt-BR";

  voz.rate = 1;

  voz.pitch = 1;

  speechSynthesis.cancel();

  speechSynthesis.speak(
    voz
  );

}


// =========================
// 🧮 MÉDIA FACIAL
// =========================
function calcularMediaFace(
  descritores
){

  const media =
    new Float32Array(128);

  for(
    let i=0;
    i<128;
    i++
  ){

    let soma = 0;

    descritores.forEach(
      d=>{
        soma += d[i];
      }
    );

    media[i] =
      soma /
      descritores.length;

  }

  return media;

}



// =========================
// ⏳ ESPERAR
// =========================
function esperar(ms){

  return new Promise(
    r=>setTimeout(r,ms)
  );

}