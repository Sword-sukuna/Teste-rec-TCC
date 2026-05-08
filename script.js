let face=null;
 document.querySelectorAll("section")
 .forEach(s=>s.classList.remove("on"));
 document.getElementById(id).classList.add("on");


async function cam(){
 try{
  const s=await navigator.mediaDevices.getUserMedia({video:true});
  video.srcObject=s;
 }catch(e){alert("Camera indisponível")}
}

async function modelos(){
 await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
 await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
 await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
}

async function capturar(){
 const d=await faceapi
 .detectSingleFace(video,new faceapi.TinyFaceDetectorOptions())
 .withFaceLandmarks()
 .withFaceDescriptor();

 if(!d)return alert("Nenhum rosto");

 face=Array.from(d.descriptor);
 alert("Face capturada");
}

function salvar(){
 if(!nome.value||!face)return alert("Complete os dados");

 salvarAluno({nome:nome.value,face});
 nome.value="";
 face=null;
 carregarAlunos();
}

function carregarAlunos(){
 listarAlunos(a=>{
  lista.innerHTML="";
  ta.innerText=a.length;

  a.forEach(x=>{
   const d=document.createElement("div");
   d.className="aluno";
   d.innerHTML=`<span>${x.nome}</span>
   <button onclick="deletarAluno(${x.id})">Excluir</button>`;
   lista.appendChild(d);
  });
 });
}

function filtro(e){
 document.querySelectorAll(".aluno")
 .forEach(a=>{
  a.style.display=a.innerText.toLowerCase()
  .includes(e.target.value.toLowerCase())
  ?"flex":"none";
 });
}