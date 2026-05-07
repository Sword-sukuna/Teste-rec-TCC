// 📡 conexão WebRTC
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


  // 📡 receber canal
  peerConnection.ondatachannel =
  event=>{

    dataChannel =
    event.channel;

    configurarCanal();

  };


  // 🧊 ICE
  peerConnection.onicecandidate =
  event=>{

    if(event.candidate){

      console.log(

        "ICE:",

        JSON.stringify(
          event.candidate
        )

      );

    }

  };

}


// ⚡ configurar canal
function configurarCanal(){

  dataChannel.onopen =
  ()=>{

    adicionarLog(
      "📡 Conexão estabelecida"
    );

  };


  dataChannel.onclose =
  ()=>{

    adicionarLog(
      "❌ Conexão encerrada"
    );

  };


  dataChannel.onmessage =
  async event=>{

    const dados =
    JSON.parse(
      event.data
    );


    console.log(
      "📥 Recebido:",
      dados
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


    adicionarLog(

      `📤 ${aluno.nome}
      enviado`

    );

  }

}


// 📋 logs
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