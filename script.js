let faceCapturada = null;
  if(!deteccao){
    alert("Nenhum rosto detectado");
    return;
  }

  faceCapturada = Array.from(deteccao.descriptor);

  alert("Face capturada");

}


function salvarCadastro(){

  const nome = document.getElementById("nome").value;

  if(!nome || !faceCapturada){
    alert("Complete os dados");
    return;
  }

  salvarAluno({
    nome,
    face:faceCapturada
  });

  carregarAlunos();

}


function carregarAlunos(){

  listarAlunos((alunos)=>{

    const lista = document.getElementById("lista");

    lista.innerHTML = "";

    document.getElementById("totalAlunos").innerText = alunos.length;

    alunos.forEach(aluno=>{

      const div = document.createElement("div");

      div.className = "aluno";

      div.innerHTML = `
        <span>${aluno.nome}</span>

        <button onclick="deletarAluno(${aluno.id})">
          Excluir
        </button>
      `;

      lista.appendChild(div);

    });

  });

}


function filtrarAlunos(e){

  const termo = e.target.value.toLowerCase();

  const alunos = document.querySelectorAll(".aluno");

  alunos.forEach(aluno=>{

    const texto = aluno.innerText.toLowerCase();

    aluno.style.display =
      texto.includes(termo)
      ? "flex"
      : "none";

  });

}