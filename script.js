const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const resultado =
document.getElementById("resultado");

const lista =
document.getElementById("lista");


// 👨‍🎓 carregar alunos
let alunos = [];

try {

  alunos =
  JSON.parse(
    localStorage.getItem("alunos")
  ) || [];

} catch {

  alunos = [];

}


let faceMatcher;


// 🚀 INICIAR SISTEMA
async function iniciar(){

  resultado.innerHTML =
  "📦 Carregando IA...";


  // 📦 carregar modelos
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

    // 📱 celular
    ? {

        facingMode:"user",

        width:{
          ideal:1280
        },

        height:{
          ideal:720
        }

      }

    // 💻 PC
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


  // 👨‍🎓 carregar rostos
  carregarMatcher();

  resultado.innerHTML =
  "✅ Sistema iniciado";

}

iniciar();


// 👨‍🎓 CADASTRAR ROSTO
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


  alunos.push({

    nome,

    descriptor:
    Array.from(
      deteccao.descriptor
    )

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
    "Rosto cadastrado!"
  );

});


// 🧠 CARREGAR MATCHER
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
  new faceapi
  .FaceMatcher(

    labeledDescriptors,

    0.6

  );


  renderLista();

}


// 📋 LISTA DE ALUNOS
function renderLista(){

  lista.innerHTML =

  alunos.map(a=>`

    <div class="aluno">

      👨‍🎓 ${a.nome}

    </div>

  `).join("");

}


// 🔍 RECONHECIMENTO FACIAL
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


      resultado.innerHTML =

      `✅ ${resultadoFace.toString()}`;

    });

  },

  500

  );

});