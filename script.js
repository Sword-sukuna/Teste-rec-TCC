const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const resultado =
document.getElementById("resultado");

const lista =
document.getElementById("lista");

let alunos =
JSON.parse(
localStorage.getItem("alunos")
) || [];

let faceMatcher;


// 🚀 INICIAR
async function iniciar(){

  // 📦 carregar modelos
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");

  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

  await faceapi.nets.faceRecognitionNet.loadFromUri("./models");


  // 🎥 abrir webcam (DroidCam)
  const stream =
  await navigator.mediaDevices.getUserMedia({

    video:true

  });

  video.srcObject = stream;

  // 👨‍🎓 carregar alunos
  carregarMatcher();

}

iniciar();


// 👨‍🎓 CADASTRAR ROSTO
document
.getElementById("cadastrar")
.addEventListener(
"click",
async ()=>{

  const nome =
  document.getElementById("nome").value;

  if(!nome){

    alert("Digite o nome");

    return;

  }

  const deteccao =
  await faceapi
  .detectSingleFace(
    video,
    new faceapi.TinyFaceDetectorOptions()
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

  alert("Rosto cadastrado!");

});


// 🧠 CARREGAR MATCHER
function carregarMatcher(){

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

  renderLista();

}


// 📋 LISTA
function renderLista(){

  lista.innerHTML =
  alunos.map(a=>`

    <div class="aluno">

      👨‍🎓 ${a.nome}

    </div>

  `).join("");

}


// 🔍 RECONHECIMENTO
video.addEventListener(
"play",
()=>{

  const displaySize = {

    width:video.width,
    height:video.height

  };

  faceapi.matchDimensions(
    canvas,
    displaySize
  );

  setInterval(
  async ()=>{

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

    canvas
    .getContext("2d")
    .clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    resized.forEach(d=>{

      const resultadoFace =
      faceMatcher.findBestMatch(
        d.descriptor
      );

      const box =
      d.detection.box;

      const drawBox =
      new faceapi.draw.DrawBox(
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

  },500);

});