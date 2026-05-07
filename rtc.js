
// 📡 conexão geral
let pc;
let dataChannel;
let videoSender;


// 🔑 config
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};


// 🚀 criar conexão base
function criarPC() {
  pc = new RTCPeerConnection(config);
}


// ================================
// 📡 MODO DADOS (ALUNOS)
// ================================
async function gerarQRCodeDados() {

  criarPC();

  dataChannel = pc.createDataChannel("dados");

  configurarCanal();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await esperarICE();

  const link = gerarLink("data");

  gerarQR(link);
}


// ================================
// 📷 MODO CÂMERA (VÍDEO)
// ================================
async function gerarQRCodeCamera() {

  criarPC();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await esperarICE();

  const link = gerarLink("camera");

  gerarQR(link);
}


// 🔥 gerar link seguro
function gerarLink(mode) {

  const base = window.location.href.split("?")[0];

  return `${base}?mode=${mode}&offer=${encodeURIComponent(
    JSON.stringify(pc.localDescription)
  )}`;
}


// 📱 QR CODE
function gerarQR(link) {

  const div = document.getElementById("qrcode");
  div.innerHTML = "";

  QRCode.toCanvas(link, { width: 280 }, (err, canvas) => {
    if (err) return console.error(err);
    div.appendChild(canvas);
  });

}


// ⏳ esperar ICE
function esperarICE() {

  return new Promise(resolve => {

    if (pc.iceGatheringState === "complete") {
      resolve();
    } else {
      pc.addEventListener("icegatheringstatechange", () => {
        if (pc.iceGatheringState === "complete") {
          resolve();
        }
      });
    }

  });

}


// ================================
// 📥 CELULAR (RECEBE MODE)
// ================================
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);

  const mode = params.get("mode");
  const offer = params.get("offer");

  if (!mode || !offer) return;

  criarPC();

  const remoteOffer = JSON.parse(decodeURIComponent(offer));

  await pc.setRemoteDescription(remoteOffer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await esperarICE();

  console.log("📱 conectado no modo:", mode);


  // =========================
  // 📡 MODO DADOS
  // =========================
  if (mode === "data") {

    pc.ondatachannel = (event) => {

      dataChannel = event.channel;

      dataChannel.onmessage = async (e) => {

        const dados = JSON.parse(e.data);

        if (dados.tipo === "novoAluno") {

          await adicionarAlunoDB(dados.aluno);

          alunos = await listarAlunosDB();

          renderLista();

        }

      };

    };

  }


  // =========================
  // 📷 MODO CÂMERA
  // =========================
  if (mode === "camera") {

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    document.body.appendChild(video);

    pc.ontrack = (event) => {
      video.srcObject = event.streams[0];
    };

  }

});