const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const resultado =
document.getElementById("resultado");

const lista =
document.getElementById("lista");

let alunos = [];

let faceMatcher;

let processandoReconhecimento = false;


// 🚀 INICIAR
async function iniciar(){

  try{

    resultado.innerHTML =
    "💾 Iniciando banco...";


    await iniciarDB();


    alunos =
    await listarAlunosDB();


    resultado.innerHTML =
    "📦 Carregando IA...";


    // 🧠 modelos
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


    // 🎥 câmera inteligente
    let stream;

    try{

      stream =
      await navigator
      .mediaDevices
      .getUserMedia({

        video:{

          facingMode:"user",

          width:{
            ideal:1280
          },

          height:{
            ideal:720
          }

        }

      });

    }

    catch{

      try{

        stream =
        await navigator
        .mediaDevices
        .getUserMedia({

          video:{

            facingMode:"environment"

          }

        });

      }

      catch{

        stream =
        await navigator
        .mediaDevices
        .getUserMedia({

          video:true

        });

      }

    }


    video.srcObject = stream;


    carregarMatcher();

    renderLista();


    resultado.innerHTML =
    "✅ Sistema iniciado";

  }

  catch(erro){

    console.error(erro);

    resultado.innerHTML =

    "❌ Erro ao iniciar sistema";

  }

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
  .value
  .trim();

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


  // 📸 foto
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


  const aluno = {

    nome,

    foto,

    descriptor:
    Array.from(
      deteccao.descriptor
    ),

    registros:[]

  };


  await adicionarAlunoDB(
    aluno
  );


  alunos =
  await listarAlunosDB();


  carregarMatcher();

  renderLista();


  resultado.innerHTML =
  `✅ ${nome} cadastrado`;

  document
  .getElementById("nome")
  .value = "";

});


// 🧠 MATCHER
function carregarMatcher(){

  if(alunos.length === 0){

    faceMatcher = null;

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

    0.55

  );

}


// 📋 LISTA
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

  filtrados.map(a=>`

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
            .map(r=>r.horario)
            .join(" | ")
          }

        </small>

      </div>

      <button
      onclick="excluirAluno(${a.id})">

        Excluir

      </button>

    </div>

  `).join("");

}


// 🔍 BUSCA
document
.getElementById("buscar")
.addEventListener(
"input",
renderLista
);


// ❌ EXCLUIR
async function excluirAluno(id){

  const confirmar =
  confirm(
    "Excluir aluno?"
  );

  if(!confirmar){

    return;

  }


  await excluirAlunoDB(id);


  alunos =
  await listarAlunosDB();


  carregarMatcher();

  renderLista();

}


// 🗑 RESETAR
document
.getElementById("resetarBanco")
.addEventListener(
"click",
()=>{

  const confirmar =
  confirm(

    "Apagar TODOS os alunos?"

  );

  if(!confirmar){

    return;

  }


  indexedDB.deleteDatabase(
    "EduBlockDB"
  );


  alert(
    "Banco apagado!"
  );


  location.reload();

});


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

    if(
      !faceMatcher ||
      processandoReconhecimento
    ){

      return;

    }


    processandoReconhecimento =
    true;


    try{

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


      for(const d of resized){


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


        if(
          nomeDetectado === "unknown"
        ){

          continue;

        }


        resultado.innerHTML =

        `✅ ${nomeDetectado}`;


        const aluno =
        alunos.find(a=>

          a.nome === nomeDetectado

        );


        if(aluno){

          // 🕒 horário atual
          const agoraData =
          new Date();

          const agora =
          agoraData.getTime();


          // ⏳ cooldown 5 min
          const cooldown =
          5 * 60 * 1000;


          const ultimoRegistro =

          aluno.registros[
            aluno.registros.length -1
          ];


          // 🚫 evitar spam
          if(

            !ultimoRegistro ||

            agora -
            ultimoRegistro.timestamp

            >

            cooldown

          ){

            aluno.registros.push({

              horario:

              agoraData
              .toLocaleTimeString(),

              timestamp:agora

            });


            await atualizarAlunoDB(
              aluno
            );


            resultado.innerHTML =

            `✅ Presença registrada:
            ${aluno.nome}`;


            alunos =
            await listarAlunosDB();

            renderLista();

          }

        }

      }

    }

    catch(erro){

      console.error(
        erro
      );

    }


    processandoReconhecimento =
    false;

  },

  1500

  );

});