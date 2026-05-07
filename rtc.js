// 📡 WebRTC
let peerConnection;
let dataChannel;


// 🔑 configuração STUN
const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};


// 🚀 criar conexão base
function criarConexao() {

  peerConnection = new RTCPeerConnection(config);

  // 📡 receber canal (celular ou PC)
  peerConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    configurarCanal();
  };

}


// ⚡ configurar canal de dados
function configurarCanal() {

  dataChannel.onopen = () => {
    adicionarLog("📡 Conexão ativa");
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

    dataChannel.send(JSON.stringify({
      tipo: "novoAluno",
      aluno
    }));

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


// 📱 GERAR QR (PC → celular)
document.getElementById("criarOffer").addEventListener("click", async () => {

  dataChannel = peerConnection.createDataChannel("dados");
  configurarCanal();

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);


  // ⏳ esperar ICE completo
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

  // 🔥 URL CORRETA (GitHub Pages seguro)
  const baseUrl = window.location.href.split("?")[0];

  const link = `${baseUrl}?offer=${encodeURIComponent(offerFinal)}`;


  // 📱 gerar QR
  const qrDiv = document.getElementById("qrcode");
  qrDiv.innerHTML = "";

  QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {

    if (err) {
      console.error(err);
      return;
    }

    qrDiv.appendChild(canvas);
  });

});


// 📱 CELULAR (responde automaticamente)
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const offerTexto = params.get("offer");

  if (!offerTexto) return;

  try {

    // 🔥 garante conexão criada no celular também
    criarConexao();

    const offer = JSON.parse(decodeURIComponent(offerTexto));

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);


    // ⏳ esperar ICE completo também no celular
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


    adicionarLog("📱 Celular conectado com sucesso");

  } catch (err) {
    console.error("Erro WebRTC:", err);
  }

});