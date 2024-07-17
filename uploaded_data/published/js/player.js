var id;
var nome;
var keys;
var tmpLevel;
var pos = 2;
var storyData;
var oldTitle;
var totPoints = 0;
var errFlag = 0;
var sigTimer = 0;
var actualChat;
var actualName;
var actualTimer;
var actualActivity;
var selectedElement = "";
var selection = [];
var uploadedFile = "";
const maxAnswerTime = 120000;
var waitHelp;
var matchInfo = 
{
    //ogni volta che il player crea un giocatore gli assegna un id?
    "id": "",
    //nickname
    "nome": "",
    //risposte date dal giocatore; campi vuoti che si aggiornano a ogni risposta data
    "risposte": [],
    //punteggio per ogni risposta, valutato automaticamente in caso di risposta automatica
    "punteggi": [],
    //tempo impiegato per ogni risposta
    "tempoxrisp": [],
    //punteggio totale delle risposte; campo aggiornato solo dal valutatore
    "tot": 0,
    //richiesta di aiuto settata di default su false, diventa true se il giocatore chiede aiuto
    "aiuto": "false",
    //di base vuoto, si riempie con la richiesta del giocatore
    "testoAiuto": "",
    //risposta data dal valutatore che appare al giocatore
    "rispostaAiuto": "",
    //richiesta di valutazione, diventa true quando c'è una richiesta di valutazione non automatica
    "valutazione": "false",
    //array contenente gli indici della risposte non valutabili algoritmicamente
    "testoVal": [],
    //false di default, diventa true quando il giocatore è fermo da tot minuti
    "tempo": "false",
    //indica la scena/attività in cui il player si trova
    "posizione": "",
    //indica la nuova attività proposta dal valutatore per il player
    "modificaAttività" : []
};

$(() => {
    document.getElementById("avviaPartita").addEventListener("click", start);
    document.getElementById("avviaPartita").addEventListener("onKeyDown", start);
});

/* Utils functions */

function updateMatchInfo(field, val)
{   
    switch(field)
    {
        case "id":

            matchInfo[field] = val;
            break;

        case "nome":

            matchInfo[field] = val;
            break;

        case "risposte":

            matchInfo[field].push(val);
            break;
        
        case "punteggi":

            matchInfo[field].push(val);
            break;
        
        case "tempoxrisp":

            matchInfo[field].push(val);
            break;

        case "aiuto":

            matchInfo[field] = val;
            break;
        
        case "testoAiuto":

            matchInfo[field] = val;
            break;

        case "rispostaAiuto":

            matchInfo[field] = val;
            break;  
        
        case "valutazione":

            matchInfo[field] = val;
            break;
        
        case "testoVal":

            matchInfo[field].push(val);
            break;

        case "tempo":

            matchInfo[field] = val;
            break;

        case "posizione":

            matchInfo[field] = val;
            break;

        case "modificaAttività":

            matchInfo[field] = val;
            break;

        case "tot":

            matchInfo["tot"] += val;
            break;
    }

    sendToserver(field, val);
}

function sendToserver(tmpField, tmpVal)
{
    if(id)
    {   
        $.ajax(
        {
            type: "post",
            url: "/updateGameStatus",
            data: {"data" : JSON.stringify({"id" : id, "field" : tmpField, "val" : tmpVal})},
            success: function (sharedFields) 
            { 
                if(sharedFields)
                {
                    var tmpData = JSON.parse(sharedFields);
                    matchInfo["tot"] = tmpData["tot"];
                    matchInfo["punteggi"] = tmpData["points"];
                    matchInfo["testoVal"] = tmpData["unratedQuestions"];
                }
            }
        });
    }
}

function timer()
{
    sigTimer += 1000;
    if(sigTimer == maxAnswerTime) 
    { 
        updateMatchInfo("tempo", "true"); 
        sigTimer = 0;
        waitHelp = setInterval(waitResponse, 30000);
    }
}

function showText(showTextEvent)
{
    showTextEvent.target.setAttribute("aria-pressed", "true");

    if(document.getElementById("areaTesto").style.display == "none" || document.getElementById("areaTesto").style.display == "")
    {   
        document.getElementById("areaTesto").style.display = "block";
        showTextEvent.target.innerHTML = "Chiudi area di testo";
    }
    else
    {
        document.getElementById("areaTesto").style.display = "none";
        showTextEvent.target.innerHTML = "Mostra testo";
    }

    showTextEvent.target.setAttribute("aria-pressed", "false");
}

function movingChatORhelp(node, pos)
{
    switch (pos) 
    {
        case "Angolo in alto a sinistra":
            
            node.style.top = "10px";
            node.style.left = "10px";     
            node.style.right = "unset";
            node.style.bottom = "unset";
            break;
    
        case "Angolo in alto a destra":
            
            node.style.top = "10px";
            node.style.right = "10px";
            node.style.left = "unset";
            node.style.bottom = "unset";
            break;

        case "Angolo in basso a destra":
            
            node.style.top = "unset";
            node.style.left = "unset";
            node.style.right = "10px";
            node.style.bottom = "10px";
            break;
        
        case "Angolo in basso a sinistra":
         
            node.style.top = "unset";
            node.style.right = "unset";
            node.style.left = "10px";
            node.style.bottom = "10px";
            break;
        
        default:

            break;
    }
}

function createInteractiveActivity(type, data)
{   
    switch(type)
    {
        case "Testo libero":

            document.getElementsByTagName("title")[0].innerHTML += " L'attività prevede una risposta aperta, inserisci la tua risposta nel campo rispostaAperta.";
            var divContainer = document.createElement("div");
            var labelInput = document.createElement("label");
            labelInput.setAttribute("for", "rispostaAperta");
            labelInput.appendChild(document.createTextNode("Inserisci quì la tua risposta: "));
            var input = document.createElement("input");
            input.setAttribute("id", "rispostaAperta");
            input.setAttribute("type", "text");
            labelInput.appendChild(input);
            divContainer.appendChild(labelInput);
            document.getElementById("testoDelLivello").appendChild(divContainer);
            break;

        case "Risposta multipla":

            document.getElementsByTagName("title")[0].innerHTML += " L'attività prevede una risposta multipla, seleziona la tua risposta tra le voci 'rispostaMultipla-numero della risposta' e ricorda che è possibile indicare solo una risposta come corretta.";
            var usedElem = [];
            var checkContainer = document.createElement("div");
            var fieldSet = document.createElement("fieldset");
            fieldSet.setAttribute("id", "risposta-multipla");
            while(usedElem.length != data.length)
            {
                var n = Math.floor(Math.random() * 10);
                if((n < data.length) && (!usedElem.includes(n)))
                {
                    var labelInput = document.createElement("label");
                    labelInput.setAttribute("for", "rispostaMultipla-" + n.toString());
                    var input = document.createElement("input");
                    input.setAttribute("id", "rispostaMultipla-" + n.toString());
                    input.setAttribute("type", "radio");
                    input.setAttribute("name", "answer");
                    input.addEventListener("click", changeOptionColor);
                    if(n == 0)
                    {
                        input.setAttribute("value", data[n]["Risposta"]);
                        labelInput.appendChild(document.createTextNode(data[n]["Risposta"] + " "));
                    }
                    else
                    {
                        input.setAttribute("value", data[n]);
                        labelInput.appendChild(document.createTextNode(data[n] + " "));
                    }
                    labelInput.appendChild(input)
                    fieldSet.appendChild(labelInput);
                    fieldSet.appendChild(document.createElement("br"));
                    usedElem.push(n);
                }
            }
            checkContainer.appendChild(fieldSet);
            document.getElementById("testoDelLivello").appendChild(checkContainer);
            break;

        case "Caricamento file":
            
            document.getElementsByTagName("title")[0].innerHTML += " L'attività prevede il caricamento di un'immagine, presta attenzione che sia in formato 'png', 'jpg', o 'jpeg' e successivamente selezionala dal campo 'caricaFile'.";
            var divContainer = document.createElement("div");
            var labelInput = document.createElement("label");
            labelInput.setAttribute("for", "caricaFile");
            labelInput.appendChild(document.createTextNode("Carica quì il tuo file: "));
            var input = document.createElement("input");
            input.setAttribute("id", "caricaFile");
            input.setAttribute("name", "data");
            input.setAttribute("type", "file");
            input.setAttribute("accept", ".png, .jpg, .jpeg");
            input.addEventListener("change", file_upload);
            input.addEventListener("onKeyDown", file_upload);
            labelInput.appendChild(input);
            document.getElementById("testoDelLivello").appendChild(document.createElement("br"));
            divContainer.appendChild(labelInput);
            document.getElementById("testoDelLivello").appendChild(divContainer);
            break;

        case "Selezione elemento":
            
            document.getElementsByTagName("title")[0].innerHTML += " L'attività prevede la selezione di un elemento, seleziona l'elemento che ritieni corretto dagli elementi indicati con 'elemento-numero dell'elemento' e ricorda che è possibile indicare un solo elemento come corretto. Per cambiare la tua risposta prima di passare al prossimo livello seleziona il nuovo elemento che ritieni corretto, il precedente non sarà più indicato come la risposta selezionata.";
            var usedElem = [];
            var activity = document.getElementById("attività");
            var fieldSet = document.createElement("fieldset");
            while(usedElem.length != data.length)
            {
                var n = Math.floor(Math.random() * data.length);
                if((n < data.length) && (!usedElem.includes(n)))
                {
                    var labelInput = document.createElement("label");
                    labelInput.setAttribute("for", "elemento-" + n.toString());
                    var elem = document.createElement("div");
                    elem.setAttribute("class", "elem-selection");
                    elem.setAttribute("id", "elemento-" + n.toString());
                    elem.setAttribute("role", "button");
                    elem.setAttribute("aria-pressed", "false");
                    if(n == 0)
                    {
                        elem.setAttribute("name", data[n]["Risposta"]);
                        elem.style.backgroundImage = 'url("../files/' + data[n]["Risposta"] + '")';
                        elem.setAttribute("longdesc", "../../files/" + data[n]["Risposta"] + ".txt");
                    }
                    else
                    {
                        elem.setAttribute("name", data[n]);
                        elem.style.backgroundImage = 'url("../files/' + data[n] + '")';
                        elem.setAttribute("longdesc", "../../files/" + data[n] + ".txt");
                    }
                    elem.addEventListener("click", setSelectedElem);
                    elem.addEventListener("onKeyDown", setSelectedElem);
                    labelInput.appendChild(elem);
                    fieldSet.appendChild(labelInput);
                    usedElem.push(n);
                }
            }
            activity.appendChild(fieldSet);
            activity.style.display = "flex";
            break;

        case "Selezione ordinata":

            document.getElementsByTagName("title")[0].innerHTML += " L'attività prevede una selezione ordinata, seleziona in maniera ordinata gli elementi indicati come 'elemento-numero dell'elemento' secondo il criterio indicato nel testo del livello. Pensi di aver sbagliato? Non c'è problema! Azzera la tua selezione con il pulsante 'cancellaSelezione' e fornisci nuovamente la tua risposta.";
            var activity = document.getElementById("attività");
            var labelReset = document.createElement("label");
            labelReset.setAttribute("for", "cancellaSelezione");
            var resetSelection = document.createElement("button");
            resetSelection.setAttribute("id", "cancellaSelezione")
            resetSelection.appendChild(document.createTextNode("Cancella selezione"));
            resetSelection.addEventListener("click", cleanSelection);
            resetSelection.addEventListener("onKeyDown", cleanSelection);
            labelReset.appendChild(resetSelection);
            activity.appendChild(labelReset);
            var usedElem = []
            var fieldSet = document.createElement("fieldset");
            while(usedElem.length != data.length - 1)
            {
                var n = Math.floor(Math.random() * data.length);
                if(((n > 0) && (n < data.length)) && (!usedElem.includes(n)))
                {
                    var elemLabel = document.createElement("label");
                    elemLabel.setAttribute("for", "elemento-" + n.toString());
                    var elem = document.createElement("div");
                    elem.setAttribute("name", data[n]);
                    elem.setAttribute("class", "elem");
                    elem.setAttribute("id", "elemento-" + n.toString());
                    elem.setAttribute("longdesc", "../../files/" + data[n] + ".txt");
                    elem.setAttribute("role", "button");
                    elem.setAttribute("aria-pressed", "false");
                    elem.style.backgroundImage = 'url("../files/' + data[n] + '")';
                    elem.addEventListener("click", selectSort);
                    elem.addEventListener("onKeyDown", selectSort);
                    elemLabel.appendChild(elem);
                    fieldSet.appendChild(elemLabel)
                    usedElem.push(n);
                }
            }
            activity.appendChild(fieldSet);
            activity.style.display = "flex";
            break;
    }
}

function changeOptionColor(optionNodeEvent)
{
    for(node of document.getElementById("risposta-multipla").childNodes)
    {
        if(node != optionNodeEvent.target.parentNode)
        {
            node.style.backgroundColor = "#ffffff";
            node.style.color = "#000000"
        }
        else
        {
            node.style.backgroundColor = "#1B242D";
            node.style.color = "#ffffff";
        }
    }
}

function setSelectedElem(selectedEvent)
{
    selectedElement = selectedEvent.target.getAttribute("name");
    selectedEvent.target.setAttribute("aria-pressed", "true");
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    selectedEvent.target.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")"
    for(node of document.getElementsByClassName("elem-selection"))
    {
        if(node != selectedEvent.target) 
        { 
            node.setAttribute("aria-pressed", "false"); 
            node.style.backgroundColor = "";
        }
    }
}


function cleanSelection()
{ 
    selection = [];
    for(nodeElem of document.getElementsByClassName("elem"))
    { 
        nodeElem.style.backgroundColor = ""; 
        nodeElem.setAttribute("aria-pressed", "false");
    }
}

function selectSort(selectedSortEvent)
{
    if(!selection.includes(selectedSortEvent.target.getAttribute("name"))) 
    { 
        selectedSortEvent.target.setAttribute("aria-pressed", "true");
        selection.push(selectedSortEvent.target.getAttribute("name")); 
        var r = Math.floor(Math.random() * 256);
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);
        selectedSortEvent.target.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    }
}

function renderScene(toRender)
{
    var interface = document.getElementById("player-interface");

    Object.keys(toRender).forEach(key => {

        if(toRender[key].length > 0)
        {   
            switch(key)
            {
                case "Colore sfondo":
    
                    interface.style.backgroundColor = toRender[key];
                    break;
                
                case "Sfondo scena":
    
                    interface.style.backgroundImage = 'url("../files/' + toRender[key] + '")';
                    break;
                
                case "Audio scena":

                    var audio = new Audio("../../files/" + toRender[key]);
                    audio.play();
                    break;
            
                case "Video scena":

                    var video = document.getElementById("video-player");
                    video.pause();
                    video.style.display = "block";
                    video.setAttribute("src", "../files/" + toRender[key]);
                    video.load();
                    video.play();
                    break;
    
                case "Testo scena":
    
                    var p = document.createElement("p");
                    p.setAttribute("id", "testoDelLivello");
                    p.appendChild(document.createTextNode(toRender[key][0]));
                    p.style.color = toRender[key][1];
                    p.style.fontWeight = toRender[key][2];
                    p.style.fontSize = toRender[key][3] + "px";
                    document.getElementById("areaTesto").firstChild.replaceChild(p, document.getElementById("testoDelLivello"));
                    break;
            }
        }
    });
}

function renderActivity(toRender)
{
    renderScene(toRender);
    let activityData = toRender["Tipologia attivita"];
    document.getElementById("testoDelLivello").appendChild(document.createTextNode(activityData[0]));
    createInteractiveActivity(activityData[1], activityData[2]);
}

function showHelpBox(helpEvent)
{   

    helpEvent.target.setAttribute("aria-pressed", "true");

    if(matchInfo["aiuto"] == "false")
    {
        makeHelpBox();
    }
    else
    {
        document.getElementById("finestraAiuto").style.display = "block";
    }

    helpEvent.target.setAttribute("aria-pressed", "false");
}

function makeHelpBox()
{
    oldTitle = document.getElementsByTagName("title")[0].innerHTML;
    document.getElementsByTagName("title")[0].innerHTML = "Hai aperto la sezione per richiedere aiuto, inserisci la tua richiesta nel campo 'richiestaDiAiuto' e procedi ad inviarla mediante il pulsante 'inviaRichiestaDiAiuto'!";
    var helpBox = document.createElement("div");
    helpBox.setAttribute("id", "finestraAiuto");
    var container = document.createElement("div");
    var reply = document.createElement("p");
    reply.setAttribute("id", "rispostaAllaRichiestaDiAiuto");
    var p = document.createElement("p");
    p.appendChild(document.createTextNode("Hai bisogno di aiuto? Inserisci nel box sottostante la tua richiesta, un valutatore ti risponderà il prima possibile!"));
    var labelInput = document.createElement("label");
    labelInput.setAttribute("for", "richiestaDiAiuto");
    var input = document.createElement("input");
    input.setAttribute("id", "richiestaDiAiuto");
    input.setAttribute("type", "text");
    input.setAttribute("aria-label", "Inserisci quì il testo della tua richiesta di aiuto");
    labelInput.appendChild(input);
    var labelsendRequest = document.createElement("label");
    labelsendRequest.setAttribute("for", "inviaRichiestaDiAiuto")
    var sendRequest = document.createElement("button");
    sendRequest.setAttribute("id", "inviaRichiestaDiAiuto");
    sendRequest.setAttribute("value", "Invia richiesta di aiuto");
    sendRequest.setAttribute("aria-pressed", "false");
    sendRequest.setAttribute("aria-label", "Premi questo pulsante per inviare la tua richiesta di aiuto ad un valutatore");
    sendRequest.appendChild(document.createTextNode("Invia richiesta di aiuto"));
    sendRequest.addEventListener("click", sendHelpRequest);
    sendRequest.addEventListener("onKeyDown", sendHelpRequest);
    labelsendRequest.appendChild(sendRequest);
    var labelClose = document.createElement("label");
    labelClose.setAttribute("for", "chiudiRichiestaDiAiuto")
    var close = document.createElement("div");
    close.setAttribute("id", "chiudiRichiestaDiAiuto");
    close.setAttribute("aria-pressed", "false")
    close.setAttribute("aria-label", "Premi questo elemento per chiudere la finestra relativa alla richiesta di aiuto");
    close.addEventListener("click", hideHelpBox);
    close.addEventListener("onKeyDown", hideHelpBox);
    labelClose.appendChild(close);
    container.appendChild(reply);
    container.appendChild(p);
    container.appendChild(labelInput);
    container.appendChild(labelsendRequest);
    container.appendChild(labelClose);
    helpBox.appendChild(container);
    if(document.getElementById("finestraAiuto")) { document.body.removeChild(document.getElementById("finestraAiuto")); }
    document.body.appendChild(helpBox);
    input.focus();  
}

function hideHelpBox(hideEvent)
{
    document.getElementsByTagName("title")[0].innerHTML = oldTitle;
    hideEvent.target.setAttribute("aria-pressed", "true");
    document.getElementById("finestraAiuto").style.display = "none";
    hideEvent.target.setAttribute("aria-pressed", "false");
}

function sendHelpRequest(sendEvent)
{
    sendEvent.target.setAttribute("aria-pressed", "true");

    if(document.getElementById("richiestaDiAiuto").value.length > 0)
    {
        updateMatchInfo("rispostaAiuto", "");
        updateMatchInfo("aiuto", "true");
        updateMatchInfo("testoAiuto", document.getElementById("richiestaDiAiuto").value);
        document.getElementById("chiudiRichiestaDiAiuto").focus();
        waitHelp = setTimeout(waitResponse, 30000);
        document.getElementById("richiestaDiAiuto").value = "";
    }
    else
    {
        document.getElementById("richiestaDiAiuto").focus();
    }

    sendEvent.target.setAttribute("aria-pressed", "false");
}

function waitResponse()
{
    $.ajax(
    {
        type: "post",
        url: "/getUserStatus",
        data: {"id" : id},
        success: function(status)
        {
            var tmp = JSON.parse(status);

            if(tmp["rispostaAiuto"] != "")
            {
                makeHelpBox();
                if(matchInfo["testoAiuto"])
                {
                    document.getElementById("rispostaAllaRichiestaDiAiuto").innerHTML = "Domanda effettuata: " + matchInfo["testoAiuto"] + "\nRisposta: " + tmp["rispostaAiuto"];
                }
                else
                {
                    document.getElementById("rispostaAllaRichiestaDiAiuto").innerHTML = "Messaggio valutatore: " + tmp["rispostaAiuto"];
                }
                clearTimeout(waitHelp);
                updateMatchInfo("aiuto", "false");
                updateMatchInfo("rispostaAiuto", "");
            }
        }
    });
}

function waitTotalPoints()
{
    $.ajax(
    {
        type: "post",
        url: "/getUserStatus",
        data: {"id" : id},
        success: function(finalStatus)
        {
            var serverStatus = JSON.parse(finalStatus);
            if(serverStatus["testoVal"].length == 0)
            {
                matchInfo["tot"] = serverStatus["tot"];
                matchInfo["testoVal"] = serverStatus["testoVal"]
                loadEndScreen();
                clearInterval(actualTimer);
            }
        }
    });
}

function checkNewName()
{
    $.ajax(
    {
        type: "post",
        url: "/getUserStatus",
        data: {"id" : id},
        success: function(finalStatus)
        {
            var serverStatus = JSON.parse(finalStatus);
            if(serverStatus["nome"] !== nome)
            {
                nome = serverStatus["nome"];
                matchInfo["nome"] = serverStatus["nome"];
            }
        }
    });
}

function checkNewActivity()
{
    $.ajax(
    {
        type: "post",
        url: "/getUserStatus",
        data: {"id" : id},
        success: function(finalStatus)
        {
            var newDiv = document.createElement("div");
            var serverStatus = JSON.parse(finalStatus);
            if(serverStatus["modificaAttività"].length > 0)
            {
                matchInfo["modificaAttività"] = serverStatus["modificaAttività"];
                document.getElementById("testoDelLivello").innerHTML = serverStatus["modificaAttività"][0];
                var labelInput = document.createElement("label");
                var newActivity = document.createElement("input");
                if(serverStatus["modificaAttività"][1] == "Testo libero")
                {
                    labelInput.setAttribute("for", "rispostaAperta");
                    newActivity.setAttribute("id", "rispostaAperta");
                    newActivity.setAttribute("type", "text");
                }
                else
                {

                    labelInput.setAttribute("for", "caricaFile");
                    newActivity.setAttribute("id", "caricaFile");
                    newActivity.setAttribute("type", "file");
                    newActivity.setAttribute("name", "data");
                    newActivity.setAttribute("accept", ".png, .jpg, .jpeg");
                    newActivity.addEventListener("change", file_upload);
                    newActivity.addEventListener("onKeyDown", file_upload);
                }
                newDiv.appendChild(labelInput);
                newDiv.appendChild(newActivity);
                if(document.getElementById("attività").style.display != "none")
                {
                    document.getElementById("attività").style.display = "none";
                    document.getElementById("testoDelLivello").appendChild(newDiv);
                }
                else
                {
                    document.getElementById("testoDelLivello").replaceChild(newDiv, document.getElementById("testoDelLivello").lastChild);
                }
                clearInterval(actualActivity);
                sigTimer = 0;
            }
        }
    });
}

function openChat(chatEvent)
{
    chatEvent.target.setAttribute("aria-pressed", "true");
    if(document.getElementById("chat-container").style.display == "none" || document.getElementById("chat-container").style.display == "")
    {
        document.getElementById("chat-container").style.display = "block";
        document.getElementById("messaggioDaInviare").focus();
    }
    else
    {
        document.getElementById("chat-container").style.display = "none";
    }
    chatEvent.target.setAttribute("aria-pressed", "false");
}

function makeChat()
{
    var chatContainer = document.createElement("div");
    chatContainer.setAttribute("id", "chat-container");
    var chatBox = document.createElement("div");
    chatBox.setAttribute("id", "chat-box");
    if((storyData["Skin"][1] == "Angolo in alto a sinistra") || (storyData["Skin"][1] == "Angolo in basso a sinistra"))
    { 
        chatBox.style.float = "left"; 
    }
    else
    { 
        chatBox.style.float = "right"; 
    }
    var msgArea = document.createElement("div");
    msgArea.setAttribute("id", "msg-area");
    msgArea.setAttribute("aria-label", "Area in cui verranno visualizzati i messaggi inviati e ricevuti della chat");
    var inputArea = document.createElement("div");
    inputArea.setAttribute("id", "input-area");
    var labelInput = document.createElement("label");
    labelInput.setAttribute("for", "messaggioDaInviare");
    var input = document.createElement("input");
    input.setAttribute("id", "messaggioDaInviare");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Il tuo messaggio");
    input.setAttribute("aria-label", "Inserisci quì il messaggio da inviare nella tua chat con il valutatore");
    labelInput.appendChild(input);
    var labelSendButton = document.createElement("label");
    labelSendButton.setAttribute("for", "inviaMessaggio");
    var sendButton = document.createElement("button");
    sendButton.setAttribute("id", "inviaMessaggio");
    sendButton.setAttribute("aria-label", "Premi questo pulsante per inviare il tuo messaggio");
    sendButton.appendChild(document.createTextNode("INVIA"));
    sendButton.addEventListener("click", sendMsg);
    labelSendButton.appendChild(sendButton);
    inputArea.appendChild(labelInput);
    inputArea.appendChild(sendButton);
    chatBox.appendChild(msgArea);
    chatBox.appendChild(inputArea);
    chatContainer.appendChild(chatBox);
    document.getElementById("player-interface").appendChild(chatContainer);
    actualChat = setInterval(getMsg, 3000);
}

function sendMsg()
{
    var msg = document.getElementById("messaggioDaInviare").value;

    $.ajax(
    {
        type: "post",
        url: "/sendMessage",
        data: {"id" : id, "msg" : msg},
        success: () => {

            var msgBox = document.createElement("div");
            msgBox.setAttribute("class", "msg");
            var p = document.createElement("p");
            p.setAttribute("class", "testoDomanda");
            p.appendChild(document.createTextNode(msg));
            msgBox.appendChild(p);
            document.getElementById("msg-area").appendChild(msgBox);
            document.getElementById("messaggioDaInviare").value = "";
        }
    });
}

function getMsg()
{
    $.ajax(
    {
        type: "post",
        url: "/getMessage",
        data: {"id" : id, "user" : "Risposte valutatore"},
        success: function(message)
        {   
            var lastMsgVal = message["valutatore"];
            if(lastMsgVal)
            {
                if(document.getElementsByClassName("testoRisposta").length > 0)
                {
                    if(lastMsgVal !== document.getElementsByClassName("testoRisposta")[document.getElementsByClassName("testoRisposta").length - 1].innerHTML)
                    {
                        var msgBox = document.createElement("div");
                        msgBox.setAttribute("class", "msg");
                        var p = document.createElement("p");
                        p.setAttribute("class", "testoRisposta");
                        p.appendChild(document.createTextNode(lastMsgVal));
                        msgBox.appendChild(p);
                        document.getElementById("msg-area").appendChild(msgBox);
                    }
                }
                else
                {
                    var msgBox = document.createElement("div");
                    msgBox.setAttribute("class", "msg");
                    var p = document.createElement("p");
                    p.setAttribute("class", "testoRisposta");
                    p.appendChild(document.createTextNode(lastMsgVal));
                    msgBox.appendChild(p);
                    document.getElementById("msg-area").appendChild(msgBox);
                }
            }
        }
    });
}

/*************************************************************************************************/

function start(startEvent)
{
    if(document.getElementById("nomeGiocatore").value.length > 0)
    {
        nome = document.getElementById("nomeGiocatore").value;
        loadStory(startEvent.target.value);

    }
    else
    {
        document.getElementById("nomeGiocatore").focus();
    }

    event.preventDefault();
}

function loadStory(storyName)
{
    getStory(storyName);
}

function getStory(story_name)
{
    $.ajax(
    {
        type: "post",
        url: "/getStory",
        data: {"nome" : story_name},
        success: function(txtStoryANDid)
        {
            id = JSON.parse(txtStoryANDid)["id"];
            updateMatchInfo("id", id);
            updateMatchInfo("nome", nome);
            storyData = JSON.parse(txtStoryANDid)["story"];
            keys = Object.keys(storyData);
            updateStoryPlayers(story_name);
        },
        error: (err) => { console.log(err); }
    });
    event.preventDefault();
}

function updateStoryPlayers(story_name)
{
    $.ajax(
    {
        type: "post",
        url: "/updateStoryPlayers",
        data: {"id" : id, "nome" : story_name},
        success: function()
        {
            loadPlayerInterface(storyData[keys[pos]], keys[pos]);
            actualName = setInterval(checkNewName, 60000);
            pos++;
        },
        error: (err) => { console.log(err); }
    });
}

function loadPlayerInterface(toRender, rawType)
{
    tmpLevel = toRender;
    buildInterface();
    skinRender();
    sceneORacivityRendering(toRender, rawType);
    updateMatchInfo("posizione", rawType);
}

function buildInterface()
{
    var chatBackup;
    if(document.getElementById("msg-area")) { chatBackup = document.getElementById("msg-area").cloneNode(true); }
    var interface = document.createElement("div");
    interface.setAttribute("id", "player-interface");
    var labelSeeTextButton = document.createElement("label");
    labelSeeTextButton.setAttribute("for", "mostraTesto");
    var seeTextButton = document.createElement("button");
    seeTextButton.setAttribute("id", "mostraTesto");
    seeTextButton.setAttribute("aria-pressed", "false");
    seeTextButton.setAttribute("aria-label", "Clicca questo pulsante per visualizzare il testo del livello");
    seeTextButton.addEventListener("click", showText);
    seeTextButton.addEventListener("onKeyDown", showText);
    seeTextButton.appendChild(document.createTextNode("Mostra testo"));
    labelSeeTextButton.appendChild(seeTextButton);
    var labelChat = document.createElement("label");
    labelChat.setAttribute("for", "chat");
    var chatButton = document.createElement("div");
    chatButton.setAttribute("id", "chat");
    chatButton.setAttribute("role", "button");
    chatButton.setAttribute("aria-pressed", "false");
    chatButton.setAttribute("aria-label", "Clicca questo pulsante per aprire la chat e comunicare con il valutatore");
    chatButton.addEventListener("click", openChat);
    chatButton.app
    labelChat.appendChild(chatButton);
    var labelHelp = document.createElement("label");
    labelHelp.setAttribute("for", "richiestaAiuto");
    var helpButton = document.createElement("div");
    helpButton.setAttribute("id", "richiestaAiuto");
    helpButton.setAttribute("role", "button");
    helpButton.setAttribute("aria-pressed", "false");
    helpButton.setAttribute("aria-label", "Clicca questo pulsante per segnalare ed inviare una richiesta di aiuto al valutatore compilando un semplice form");
    helpButton.addEventListener("click", showHelpBox);
    seeTextButton.addEventListener("onKeyDown", showHelpBox);
    labelHelp.appendChild(helpButton);
    var labelNext = document.createElement("label");
    labelNext.setAttribute("for", "livelloSuccessivo");
    var nextButton = document.createElement("div");
    nextButton.setAttribute("id", "livelloSuccessivo");
    nextButton.setAttribute("role", "button");
    nextButton.setAttribute("aria-pressed", "false");
    nextButton.setAttribute("aria-label", "Clicca questo pulsante per andare al prossimo livello! Prima di procedere ricordati di aver visionato il testo del livello attuale e di aver fornito una risposta al quesito se presente");
    nextButton.addEventListener("click", nextLevel);
    nextButton.addEventListener("onKeyDown", nextLevel)
    labelNext.appendChild(nextButton)
    var textContainer = document.createElement("div");
    textContainer.setAttribute("id", "areaTesto");
    var labelP = document.createElement("label");
    labelP.setAttribute("for", "testoDelLivello");
    var textP = document.createElement("p");
    textP.setAttribute("id", "testoDelLivello");
    labelP.appendChild(textP);
    textContainer.appendChild(labelP);
    var videoLabel = document.createElement("label");
    videoLabel.setAttribute("for", "video-player");
    var videoContainer = document.createElement("video");
    videoContainer.setAttribute("id", "video-player");
    videoContainer.setAttribute("type", "video/mp4");
    videoContainer.setAttribute("controls", "controls");
    videoLabel.appendChild(videoContainer);
    var labelActivity = document.createElement("label");
    labelActivity.setAttribute("for", "attività");
    var activityContainer = document.createElement("div");
    activityContainer.setAttribute("id", "attività");
    labelActivity.appendChild(activityContainer)
    interface.appendChild(labelSeeTextButton);
    interface.appendChild(labelChat);
    interface.appendChild(labelHelp);
    interface.appendChild(labelNext);
    interface.appendChild(textContainer);
    interface.appendChild(videoLabel);
    interface.appendChild(labelActivity);
    document.body.replaceChild(interface, document.getElementById("player-interface"));
    makeChat();
    if(chatBackup){ document.getElementById("chat-box").replaceChild(chatBackup, document.getElementById("msg-area")); }
    seeTextButton.focus();
}

function loadEndScreen()
{
    document.getElementsByTagName("title").innerHTML = "Fine partita";
    var playerInterface = document.createElement("div");
    playerInterface.setAttribute("id", "end");
    var h1 = document.createElement("h1");
    h1.appendChild(document.createTextNode("Complimenti " + nome + ", hai terminato la tua partita!"));
    var h2 = document.createElement("h2");
    h2.appendChild(document.createTextNode("Informazioni sulla partita:"));
    var pAlg = document.createElement("p");
    pAlg.appendChild(document.createTextNode("Hai totalizzato un punteggio, per le risposte valutabili immediatamente, pari a : " + totPoints.toString()));
    var waitVal = matchInfo["testoVal"];
    var pVal = document.createElement("p");
    var pTot = document.createElement("p");
    if(waitVal.length == 0)
    {
        pVal.appendChild(document.createTextNode("Hai totalizzato un punteggio, per le risposte a cui è necessaria una valutazione umana, pari a : " + (matchInfo["tot"] - Math.abs(totPoints)).toString()));
        pTot.appendChild(document.createTextNode("Il punteggio complessivo, dato dalle risposte valutabili immediatamente e da quelle valutabili dal valutatore, è : " + matchInfo["tot"].toString()));
        clearInterval(actualTimer);
        clearInterval(actualName);
    }
    else
    {
        pVal.appendChild(document.createTextNode("Il valutatore deve ancora valutare alcune delle tue risposte, non appena lo avrà fatto vedrai il relativo punteggio ed il punteggio totale!"));
        clearInterval(actualTimer);
        actualTimer = setInterval(waitTotalPoints, 30000);
    }
    playerInterface.appendChild(h1);
    playerInterface.appendChild(h2);
    playerInterface.appendChild(pAlg);
    playerInterface.appendChild(pVal);
    playerInterface.appendChild(pTot);
    playerInterface.style.flexFlow = "column";
    playerInterface.style.textAlign = "center";
    playerInterface.style.backgroundSize = "cover";
    playerInterface.style.backgroundImage = "url(../../../img/manageStoriesWallp.jpeg)";
    var toReplace = document.getElementById("player-interface");
    if(!toReplace) { toReplace = document.getElementById("end"); }
    document.body.replaceChild(playerInterface, toReplace);
}

function skinRender()
{
    for(var i = 0; i < storyData["Skin"].length; i++)
    {
        if(storyData["Skin"][i] !== "")
        {
            switch(i.toString())
            {
                case "0":

                    document.getElementById("chat").style.backgroundImage = 'url("../files/' + storyData["Skin"][i] + '")';
                    break;
    
                case "1":

                    movingChatORhelp(document.getElementById("chat"), storyData["Skin"][i]);
                    break;
    
                case "2":

                    document.getElementById("richiestaAiuto").style.backgroundImage = 'url("../files/' + storyData["Skin"][i] + '")';
                    break;
    
                case "3":

                    movingChatORhelp(document.getElementById("richiestaAiuto"), storyData["Skin"][i]);
                    break;
    
                case "4":

                    let textArea = document.getElementById("areaTesto");
                    textArea.style.backgroundColor = "none";
                    //textArea.style.border = "none";
                    textArea.style.backgroundImage = 'url("../files/' + storyData["Skin"][i] + '")';
                    break;
            }
        }
    }
}

function sceneORacivityRendering(toRender, rawType)
{
    if(rawType.substr(0, 5) == "scena")
    {
        document.getElementsByTagName("title")[0].innerHTML = rawType + " - Fai attenzione al testo della scena, potrebbe fornirti informazioni per poter completare la prossima attività! Visualizza il testo dell'attività cliccando sul pulsante 'mostraTesto', per andare avanti dopo aver letto attentamente il testo della scena clicca sull'elemento 'livelloSuccessivo'.";
        renderScene(toRender);
        document.getElementById("mostraTesto").click();
    }
    else
    {
        document.getElementsByTagName("title")[0].innerHTML = rawType + " - Attualmente ti trovi in una attività, presta attenzione alle risposte che darai ed in caso di necessità non farti problemi a chiedere aiuto tramite il pulsante chat o tramite il tasto richiestaAiuto! Visualizza il testo dell'attività cliccando sul pulsante 'mostraTesto', per andare avanti dopo aver risposto clicca sull'elemento 'livelloSuccessivo'.";
        renderActivity(toRender);
        selection = [];
        selectedElement = "";
        actualTimer = setInterval(timer, 1000);
        actualActivity = setInterval(checkNewActivity, 60000)
    }
}

function nextLevel(nextEvent)
{
    nextEvent.target.setAttribute("aria-pressed", "true");
    clearInterval(actualTimer);
    clearInterval(actualChat);
    clearInterval(actualActivity);
    if(keys[pos - 1].substr(0, 8) == "attività"){ updateMatchInfo("tempoxrisp", (sigTimer / 60000).toFixed(2).toString()); }
    sigTimer = 0;
    updateMatchInfo("aiuto", "false");
    updateMatchInfo("testoAiuto", "");
    updateMatchInfo("tempo", "false");
    checkAndSendAnswer(storyData[keys[pos - 1]], keys[pos - 1]);
    if(!errFlag)
    {
        if(pos < keys.length)
        {
            loadPlayerInterface(storyData[keys[pos]], keys[pos]);
            pos++;
        }
        else
        {
            loadEndScreen();
        }
    }
    nextEvent.target.setAttribute("aria-pressed", "false");
}

function checkAndSendAnswer(dataInfo, rawType)
{
    var answer = "";
    if(rawType.substr(0, 8) == "attività")
    {   
        if(matchInfo["modificaAttività"].length == 0)
        {
            if(!errFlag)
            {
                answer = getAnswer(dataInfo["Tipologia attivita"][1]);
                if(dataInfo["Tipologia attivita"][2][0]["Risposta"] != "")
                {
                    if(dataInfo["Tipologia attivita"][2][0]["Risposta"] == answer)
                    {
                        var actPoints = parseInt(dataInfo["Tipologia attivita"][3]);
                        totPoints += parseInt(dataInfo["Tipologia attivita"][3]);
                        updateMatchInfo("punteggi", actPoints);
                        updateMatchInfo("tot", actPoints);
                        if(dataInfo["Tipologia attivita"][4]["Attività errore"].hasOwnProperty("Testo scena")) 
                        { 
                            updateMatchInfo("risposte", "");
                            updateMatchInfo("punteggi", "");
                        }
                    }
                    else
                    {   
                        var actPoints = (parseInt(dataInfo["Tipologia attivita"][3]) / 3).toFixed(0);
                        totPoints -= actPoints;
                        updateMatchInfo("punteggi", -actPoints);
                        updateMatchInfo("tot", -actPoints);
                        if(dataInfo["Tipologia attivita"][4]["Attività errore"].hasOwnProperty("Testo scena"))
                        {
                            errFlag = 1;
                            loadPlayerInterface(dataInfo["Tipologia attivita"][4]["Attività errore"], "attività di errore relativa all'attività-" + rawType.substr(9));
                        }
                    }
                }
                else
                {
                    updateMatchInfo("valutazione", "true");
                    updateMatchInfo("punteggi", "");
                }
            }
            else
            {
                errFlag = 0;
                checkAndSendAnswer(storyData[keys[pos - 1]]["Tipologia attivita"][4]["Attività errore"], keys[pos - 1]);
            }
        }
        else
        {
            if(document.getElementById("caricaFile"))
            {
                updateMatchInfo("risposte", uploadedFile);
                updateMatchInfo("testoVal", [matchInfo["modificaAttività"][0], matchInfo["risposte"].length - 1]);
            }
            else
            {
                updateMatchInfo("risposte", document.getElementById("rispostaAperta").value);
                updateMatchInfo("testoVal", [matchInfo["modificaAttività"][0], matchInfo["risposte"].length - 1]);
            }

            updateMatchInfo("valutazione", "true");
            updateMatchInfo("modificaAttività", []);
        }
        
    }
    return answer
}

function getAnswer(activityType)
{
    switch(activityType)
    {
        case "Testo libero":

            updateMatchInfo("risposte", document.getElementById("rispostaAperta").value);
            updateMatchInfo("testoVal", [tmpLevel["Tipologia attivita"][0], matchInfo["risposte"].length - 1]);
            return document.getElementById("rispostaAperta").value;
            break;

        case "Risposta multipla":

            var flag = 0;
            var checkboxList = document.getElementsByTagName("input");
            for(checkbox of checkboxList) 
            { 
                if(checkbox.checked)
                { 
                    flag = 1;
                    updateMatchInfo("risposte", checkbox.value);
                    return checkbox.value 
                } 
            }
            if(!flag){ updateMatchInfo("risposte", ""); }
            break;

        case "Caricamento file":

            updateMatchInfo("risposte", uploadedFile);
            updateMatchInfo("testoVal", [tmpLevel["Tipologia attivita"][0], matchInfo["risposte"].length - 1]);
            return uploadedFile;
            break;

        case "Selezione elemento":
            
            updateMatchInfo("risposte", selectedElement);
            return selectedElement;
            break;

        case "Selezione ordinata":

            updateMatchInfo("risposte", selection);
            updateMatchInfo("testoVal", [tmpLevel["Tipologia attivita"][0], matchInfo["risposte"].length - 1]);
            return selection;
            break;
    }
}

//Procede al caricamento asincrono del file verso il server
function file_upload(eventNode)
{
    //Creo un form contenente il file che l'utente vuole caricare
    var form = document.createElement("form");
    form.appendChild((eventNode.target).cloneNode(true));

    //Procedo all'inoltro del file, mediante un FormData, in via asincrona 
    var formData = new FormData(form);

    $.ajax(
    {
        type: "post",
        url: "/uploadfile",
        data: formData,
        contentType: false, 
        processData: false, 
        success: function(fileName)
        {   
            uploadedFile = fileName;
            //setto l'attributo "alt" del nodo originale per segnalare il caricamento positivo del file
            eventNode.target.setAttribute("alt", "caricamento del file completato");
        },
        error: function (err)
        {
            console.log("Salvataggio file non completato");
            alert("Il caricamento di un file non e' andato a buon termine.\nSi consiglia di riprovare a selezionare il file");
        }
    }); 
    event.preventDefault();
}