// 📡 conexão
let peerConnection;

let dataChannel;


// 🔑 configuração
const config = {

  iceServers:[

    {

      urls:
      "stun:stun.l.google.com:19302"

    }

  ]

};


// 🚀 criar conexão
function criarConexao(){

  peerConnection =
  new RTCPeerConnection(
    config
  );


  peerConnection.ondatachannel =
  event=>{

    dataChannel =
    event.channel;

    configurarCanal();

  };

}


// ⚡ canal
function configurarCanal(){

  dataChannel.onopen =
  ()=>{

    adicionarLog(
      "📡 Conectado"
    );

  };


  dataChannel.onmessage =
  async event=>{

    const dados =
    JSON.parse(
      event.data
    );


    // 👨‍🎓 sincronizar aluno
    if(
      dados.tipo ===
      "novoAluno"
    ){

      await adicionarAlunoDB(
        dados.aluno
      );


      alunos =
      await listarAlunosDB();


      carregarMatcher();

      renderLista();


      adicionarLog(

        `👨‍🎓 ${dados.aluno.nome}
        sincronizado`

      );

    }

  };

}


// 📤 enviar aluno
function enviarAluno(aluno){

  if(

    dataChannel &&

    dataChannel.readyState ===
    "open"

  ){

    dataChannel.send(

      JSON.stringify({

        tipo:"novoAluno",

        aluno

      })

    );

  }

}


// 📋 log
function adicionarLog(texto){

  const logs =
  document.getElementById(
    "logs"
  );


  const div =
  document.createElement(
    "div"
  );

  div.className =
  "logItem";

  div.innerText =
  texto;


  logs.prepend(div);

}


// 🚀 iniciar
criarConexao();


// 📱 gerar QR
document
.getElementById("criarOffer")
.addEventListener(
"click",
async ()=>{

  dataChannel =
  peerConnection
  .createDataChannel(
    "dados"
  );

  configurarCanal();


  const offer =

  await peerConnection
  .createOffer();


  await peerConnection
  .setLocalDescription(
    offer
  );


  // ⏳ ICE
  await new Promise(resolve=>{

    if(

      peerConnection
      .iceGatheringState ===
      "complete"

    ){

      resolve();

    }

    else{

      peerConnection
      .addEventListener(

        "icegatheringstatechange",

        ()=>{

          if(

            peerConnection
            .iceGatheringState ===
            "complete"

          ){

            resolve();

          }

        }

      );

    }

  });


  const offerCompleta =

  JSON.stringify(

    peerConnection
    .localDescription

  );


  const link =

  `${location.origin}
  ${location.pathname}
  ?offer=${
    encodeURIComponent(
      offerCompleta
    )
  }`;


  document
  .getElementById("qrcode")
  .innerHTML = "";


  QRCode.toCanvas(

    link,

    {

      width:300

    },

    (erro,canvas)=>{

      if(erro){

        console.error(
          erro
        );

        return;

      }


      document
      .getElementById("qrcode")
      .appendChild(
        canvas
      );

    }

  );

});


// 📱 celular recebendo
window.addEventListener(
"load",
async ()=>{

  const params =
  new URLSearchParams(
    location.search
  );


  const offerTexto =
  params.get("offer");


  if(!offerTexto){

    return;

  }


  try{

    const offer =
    JSON.parse(

      decodeURIComponent(
        offerTexto
      )

    );


    await peerConnection
    .setRemoteDescription(
      offer
    );


    const answer =

    await peerConnection
    .createAnswer();


    await peerConnection
    .setLocalDescription(
      answer
    );


    adicionarLog(
      "📱 Dispositivo conectado"
    );

  }

  catch(erro){

    console.error(
      erro
    );

  }

});