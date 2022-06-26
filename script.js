let username = "";
let usuario = {};
let logado = false;
let destinatario = "Todos";
let reservado = false;
let ultimoVetorMsg = [];
const divEntrada = document.querySelector(".logar");
const divCarregar = document.querySelector(".carregar");
const divLogin = document.querySelector(".entrada");
const divChat = document.querySelector(".chat");
const listaContatos = document.querySelector(".selecionarContato ul");
const divContatos = document.querySelector(".selecionarContato");
const divCinza = document.querySelector(".divcinza");
const inputMsg = document.querySelector(".chat input");
const ulMsgs = document.querySelector(".content ul");

let usuariosLogados = ["João", "Maria", "Carlos"];

let popContatos = 0;


function entrar(){
    username = document.querySelector(".entrada input").value;
    usuario = {
        name: username
    };
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants ", usuario);
    
    divEntrada.classList.add("invisivel");
    divCarregar.classList.remove("invisivel");

    promise.then(carregarChat);
    promise.catch(usuarioIncorreto);
}

function carregarChat(data){
    divLogin.classList.add("invisivel");
    divChat.classList.remove("invisivel");
    logado = true;
    popularContatos();
    obterMsgs();
    setInterval(manterConexao, 5000);
    popContatos = setInterval(popularContatos, 10000);
    setInterval(obterMsgs, 3000);



}

function usuarioIncorreto(erro){
    divEntrada.classList.remove("invisivel");
    divCarregar.classList.add("invisivel");
    alert("favor digitar outro nome, pois este já está em uso...");

}

function manterConexao(){
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", usuario);

}



function popularContatos(){
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(teste);

}

function teste(data){
    let vetorUsuarios = data.data;
    let destinatarioSelect = '';
    let todosSelect = '';
    if (destinatario == "Todos")
        todosSelect = 'selecionado';


    listaContatos.innerHTML = `
            <li class="${todosSelect}" onclick='selecionarContato(this);'>                
                <div>
                    <ion-icon name="people"></ion-icon>
                    <span>Todos</span>
                </div>
                <div class="check">
                    <ion-icon name="checkmark"></ion-icon>
                </div>
            </li>`;
    for(let i = 0; i < vetorUsuarios.length; i++){
        if (vetorUsuarios[i].name == destinatario)
            destinatarioSelect = 'selecionado';
        else
            destinatarioSelect = '';
        listaContatos.innerHTML += `
        <li onclick='selecionarContato(this);'" class = '${destinatarioSelect}'>
            <div>
            <ion-icon name="person-circle"></ion-icon>
            <span>${vetorUsuarios[i].name}</span>
            </div>
            <div class="check">
                            <ion-icon name="checkmark"></ion-icon>
            </div>
        </li>`;

    }

}

function selecionarContato(li){
    let novodestinatario = li.querySelector("span").innerHTML;
    if (novodestinatario !== username){
        selecionaUmLiDaUl(li);
        destinatario = novodestinatario;
    }
    const spanDestinario = document.querySelector(".contatoAEnviar");
    spanDestinario.innerHTML = destinatario;
}

function selecionarReservado(li){
    selecionaUmLiDaUl(li);
    reservado = ! reservado;
    const palavraReservada = document.querySelector(".modoDeEnvio");
    palavraReservada.innerHTML = "";
    if (reservado)
        palavraReservada.innerHTML = "(Reservadamente)";

}


function selecionaUmLiDaUl(li){
    const ul = li.parentNode;
    const selecionado = ul.querySelector(".selecionado");
    if (selecionado !== li){
        li.classList.toggle("selecionado");
        selecionado.classList.toggle("selecionado");
    }
}


function mostrarContatos(){
    divContatos.classList.toggle("mostrarContatos");
    divCinza.classList.toggle("invisivel");

}

function ocultarContatos(){
    divContatos.classList.toggle("mostrarContatos");
    divCinza.classList.toggle("invisivel");
}


function enviarMsg(){
    msg = inputMsg.value;
    tipoDeMsg = "message";
    if (reservado)
        tipoDeMsg = "private_message";
    const objetoMsg = {
        from: username,
	    to: destinatario,
	    text: msg,
	    type: tipoDeMsg // ou "private_message" para o bônus

    }
    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", objetoMsg);
    promise.then(limparInput);
    promise.catch(resetarSite);
    
}   

function resetarSite(erro){
    window.location.reload();
}

function limparInput(response){
    inputMsg.value = "";
    obterMsgs();

}
function obterMsgs(){
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(renderizarMsgs);
    promise.catch(resetarSite);
}

function entrarComEnter(event){
    if (event.key == "Enter")
        entrar();
}

function enviarComEnter(event){
    if (event.key == "Enter")
        enviarMsg();
}


function renderizarMsgs(resposta){
    const vetorMsgs = resposta.data;
    ulMsgs.innerHTML = "";
    for (let i = 0; i < vetorMsgs.length; i++){
        let type = vetorMsgs[i].type;
        if (type === "status"){
            ulMsgs.innerHTML += `
                    <li class="${vetorMsgs[i].type}">
                        <span class="time">${vetorMsgs[i].time}</span>
                        <span class="nome"> ${vetorMsgs[i].from} </span>
                        <span> ${vetorMsgs[i].text}</span>
                    </li>        
        `
        }
        else{
            let reservado = "";
            if (type == "private_message"){
                reservado = "reservadamente";
                if (naoEstouNaMsPrivada(vetorMsgs[i]))
                    continue;
            }
            ulMsgs.innerHTML += `
                    <li class="${vetorMsgs[i].type}">
                        <span class="time">${vetorMsgs[i].time}</span>
                        <span class="nome"> ${vetorMsgs[i].from} </span>
                        <span> ${reservado} para </span>
                        <span class="nome">${vetorMsgs[i].to}:</span>
                        <span> ${vetorMsgs[i].text}</span>
                    </li>        
        `
        }
    }

    if (ultimoVetorMsg !== vetorMsgs)
        deslocarParaUltimaMs(); 
    ultimoVetorMsg = vetorMsgs;
}

function naoEstouNaMsPrivada(msg){
    if(msg.to === username || msg.to === "Todos" || msg.from === username)
        return false
    else
        return true

}


function deslocarParaUltimaMs(){
    const elementoQueQueroQueApareca = ulMsgs.querySelector('li:last-of-type');
    elementoQueQueroQueApareca.scrollIntoView();

}