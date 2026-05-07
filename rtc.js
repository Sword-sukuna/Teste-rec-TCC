
// 📡 conexão
let pc;
let dataChannel;


// 🔑 iniciar conexão
function iniciarRTC() {

  pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

}


// 📡 gerar QR (PC → celular)
async function gerarQRCode() {

  iniciarRTC();

  dataChannel = pc.createDataChannel("dados");

  configurarCanal();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await esperarICE();

  const link = window.location.href.split("?")[0] +
    "?offer=" + encodeURIComponent(JSON.stringify(pc.localDescription));

  QRCode.toCanvas(link, { width: 250 }, (err, canvas) => {
    if (!err) document.getElementById("qrcode").appendChild(canvas);
  });

}


// 📥 celular recebe e responde
window.addEventListener("load", async () => {

  const params = new URLSearchParams(location.search);
  const offer = params.get("offer");

  if (!offer) return;

  iniciarRTC();

  const remote = JSON.parse(decodeURIComponent(offer));

  await pc.setRemoteDescription(remote);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

});


// 📡 canal de dados
function configurarCanal() {

  pc.ondatachannel = (event) => {

    const channel = event.channel;

    channel.onmessage = async (e) => {

      const dados = JSON.parse(e.data);

      if (dados.tipo === "aluno") {

        await adicionarAlunoDB(dados.aluno);

        alunos = await listarAlunosDB();

        renderLista();

      }

    };

  };

}


// ⏳ ICE
function esperarICE() {

  return new Promise(resolve => {

    if (pc.iceGatheringState === "complete") resolve();

    else pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") resolve();
    });

  });

}