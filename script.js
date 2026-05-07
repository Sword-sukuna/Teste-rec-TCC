const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const resultado =
document.getElementById("resultado");

const lista =
document.getElementById("lista");


// 👨‍🎓 banco local
let alunos = [];

try{

  alunos =
  JSON.parse(
    localStorage.getItem("alunos")
  ) || [];

}catch{

  alunos = [];

}


let faceMatcher;


// 🚀 INICIAR
async function iniciar(){

  resultado.innerHTML =
  "📦 Carregando IA...";


  // 📦 modelos
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


  resultado.innerHTML =
  "🎥 Abrindo câmera...";


  // 📱 detectar celular
  const mobile =
  /Android|iPhone|iPad|iPod/i
  .test(navigator.userAgent);


  // 🎥 abrir câmera
  const stream =
  await navigator
  .mediaDevices
  .getUserMedia({

    video: mobile

    ? {

        facingMode:"user",

        width:{
          ideal:1280
        },

        height:{
          ideal:720
        }

      }

    : {

        width:{
          ideal:1280
        },

        height:{
          ideal:720
        }

      }

  });


  video.srcObject = stream;


  carregarMatcher();

  renderLista();

  resultado.innerHTML =
  "✅ Sistema iniciado";

}

iniciar();


// 👨‍🎓 CADASTRO
document
.getElementById("cadastrar")
.addEventListener(
"click",
async ()=>{

  const nome =
  document
  .getElementById("nome")
  .value;

  if(!nome){

    alert(
      "Digite o nome"
    );

    return;

  }


  resultado.innerHTML =
  "📸 Detectando rosto...";


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

    alert(
      "Nenhum rosto detectado"
    );

    return;

  }


  // 📸 capturar foto
  const captura =
  document.createElement(
    "canvas"
  );

  captura.width =
  video.videoWidth;

  captura.height =
  video.videoHeight;

  const ctx =
  captura.getContext("2d");

  ctx.drawImage(

    video,

    0,

    0

  );

  const foto =
  captura.toDataURL(
    "image/png"
  );


  alunos.push({

    nome,

    foto,

    descriptor:
    Array.from(
      deteccao.descriptor
    ),

    registros:[]

  });


  localStorage.setItem(

    "alunos",

    JSON.stringify(alunos)

  );


  carregarMatcher();

  renderLista();


  resultado.innerHTML =
  `✅ ${nome} cadastrado`;

  alert(
    "Aluno cadastrado!"
  );

});


// 🧠 MATCHER
function carregarMatcher(){

  if(alunos.length === 0){

    return;

  }


  const labeledDescriptors =

  alunos.map(aluno=>{

    return new faceapi
    .LabeledFaceDescriptors(

      aluno.nome,

      [

        new Float32Array(
          aluno.descriptor
        )

      ]

    );

  });


  faceMatcher =
  new faceapi.FaceMatcher(

    labeledDescriptors,

    0.6

  );

}


// 📋 RENDER LISTA
function renderLista(){

  const busca =
  document
  .getElementById("buscar")
  .value
  .toLowerCase();


  const filtrados =
  alunos.filter(aluno=>

    aluno.nome
    .toLowerCase()
    .includes(busca)

  );


  lista.innerHTML =

  filtrados.map((a,index)=>`

    <div class="aluno">

      <img src="${a.foto}">

      <div class="info">

        <h3>
          👨‍🎓 ${a.nome}
        </h3>

        <p>
          🕒 Registros:
          ${a.registros.length}
        </p>

        <small>

          ${
            a.registros
            .slice(-5)
            .join(" | ")
          }

        </small>

      </div>

      <button
      onclick="excluirAluno(${index})">

        Excluir

      </button>

    </div>

  `).join("");

}


// 🔍 BUSCAR
document
.getElementById("buscar")
.addEventListener(
"input",
renderLista
);


// ❌ EXCLUIR
function excluirAluno(index){

  const confirmar =
  confirm(
    "Excluir aluno?"
  );

  if(!confirmar){

    return;

  }


  alunos.splice(index,1);


  localStorage.setItem(

    "alunos",

    JSON.stringify(alunos)

  );


  carregarMatcher();

  renderLista();

}


// 🔍 RECONHECIMENTO
video.addEventListener(
"play",
()=>{

  const displaySize = {

    width:video.videoWidth,

    height:video.videoHeight

  };


  faceapi.matchDimensions(

    canvas,

    displaySize

  );


  setInterval(

  async ()=>{

    if(!faceMatcher){

      return;

    }


    const deteccoes =

    await faceapi

    .detectAllFaces(

      video,

      new faceapi
      .TinyFaceDetectorOptions()

    )

    .withFaceLandmarks()

    .withFaceDescriptors();


    const resized =

    faceapi.resizeResults(

      deteccoes,

      displaySize

    );


    canvas.width =
    video.videoWidth;

    canvas.height =
    video.videoHeight;


    const ctx =
    canvas.getContext("2d");


    ctx.clearRect(

      0,

      0,

      canvas.width,

      canvas.height

    );


    resized.forEach(d=>{


      const resultadoFace =

      faceMatcher
      .findBestMatch(

        d.descriptor

      );


      const box =
      d.detection.box;


      const drawBox =

      new faceapi
      .draw
      .DrawBox(

        box,

        {

          label:
          resultadoFace.toString()

        }

      );


      drawBox.draw(canvas);


      const nomeDetectado =
      resultadoFace.label;


      resultado.innerHTML =

      `✅ ${nomeDetectado}`;


      // 👨‍🎓 procurar aluno
      const aluno =
      alunos.find(a=>

        a.nome === nomeDetectado

      );


      if(aluno){

        const agora =
        new Date()
        .toLocaleTimeString();


        const ultimo =
        aluno.registros[
          aluno.registros.length -1
        ];


        // evitar spam
        if(ultimo !== agora){

          aluno.registros.push(
            agora
          );


          localStorage.setItem(

            "alunos",

            JSON.stringify(alunos)

          );


          renderLista();

        }

      }

    });

  },

  1000

  );

});