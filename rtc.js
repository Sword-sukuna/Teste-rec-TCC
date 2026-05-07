// 📡 WebRTC
let peerConnection;
let dataChannel;


// 🔑 config STUN
const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};


// 🚀 iniciar conexão
function criarConexao() {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    configurarCanal();
  };
}


// ⚡ canal de dados
function configurarCanal() {
  dataChannel.onopen = () => {
    adicionarLog("📡 Conectado com sucesso");
  };

  dataChannel.onmessage = async (event) => {
    const dados = JSON.parse(event.data);

    if (dados.tipo === "novoAluno") {
      await adicionarAlunoDB(dados.aluno);

      alunos = await listarAlunosDB();
      carregarMatcher();
      renderLista();

      adicionarLog(`👨‍🎓 ${dados.aluno.nome} sincronizado`);
    }
  };
}


// 📤 enviar aluno
function enviarAluno(aluno) {
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(
      JSON.stringify({
        tipo: "novoAluno",
        aluno
      })
    );

    adicionarLog(`📤 Enviado: ${aluno.nome}`);
  }
}


// 📋 logs
function adicionarLog(texto) {
  const logs = document.getElementById("logs");

  const div = document.createElement("div");
  div.className = "logItem";
  div.innerText = texto;

  logs.prepend(div);
}


// 🚀 iniciar RTC
criarConexao();


// 📱 GERAR QR CODE (PC -> celular)
document.getElementById("criarOffer").addEventListener("click", async () => {

  dataChannel = peerConnection.createDataChannel("dados");
  configurarCanal();

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  // ⏳ espera ICE
  await new Promise((resolve) => {
    if (peerConnection.iceGatheringState === "complete") {
      resolve();
    } else {
      peerConnection.addEventListener("icegatheringstatechange", () => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve();
        }
      });
    }
  });


  const offerFinal = JSON.stringify(peerConnection.localDescription);

  // 🔥 URL CORRIGIDA (SEM 404)
  const baseUrl = window.location.href.split("?")[0];

  const link = `${baseUrl}?offer=${encodeURIComponent(offerFinal)}`;


  // 📱 gerar QR
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";

  QRCode.toCanvas(link, { width: 300 }, (err, canvas) => {
    if (err) {
      console.error(err);
      return;
    }

    qrDiv.appendChild(canvas);
  });

});


// 📱 CELULAR abre e responde automaticamente
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const offerTexto = params.get("offer");

  if (!offerTexto) return;

  try {
    const offer = JSON.parse(decodeURIComponent(offerTexto));

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    adicionarLog("📱 Conectado ao PC via QR");

  } catch (err) {
    console.error(err);
  }

});