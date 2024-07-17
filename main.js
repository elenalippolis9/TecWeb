/* ########### Settaggi relativi al server in expressJS ########## */

//Variabili globali relative al valutatore
var files;
var giocatori = [];

//Richiedo i moduli necessari per gestire le richieste del server
var fs = require("fs");
var multer = require("multer");
var express = require("express");
var bodyParser = require("body-parser");
const { read } = require("@popperjs/core");

//Designazione dell'ip e del numero di porta del server
const port = "8000";
const ip = "127.0.0.1";
//const ip = "site202102.tw.cs.unibo.it";

//Designazione dell'host per generare il corretto QrCode sia avviando il server da linea di comando che con gocker
var host;
if(ip == "maria.cs.unibo.it" || ip == "127.0.0.1")
{
    host = ip + ":" + port;
}
else
{
    host = ip;
}

//Designazione dei path contenenti i vari file JSON necessari per il funzionamento del sito web
const CHATpath = __dirname + "/chat/";
const FILEpath = __dirname + "/uploaded_data/files/";
const JSONstatus = __dirname + "/stories_players/status/"
const JSONpath = __dirname + "/uploaded_data/stories/";
const JSONinfo = __dirname + "/uploaded_data/uploadedStories.json";
const JSONpublished = __dirname + "/uploaded_data/publishedStories.json";
const HTMLpublished = __dirname + "/uploaded_data/published/";
const HTMLpublishedQR = "/uploaded_data/published/";
const StoriesPlayers = __dirname + "/stories_players/"

//constanti valutatore
const giocatoriStatusPath =__dirname + "/stories_players/status/";
const esportaPath = __dirname + "/json/esporta.json";
const valChatPath =__dirname + '/json/val-chat.json';

//Template HTML per la creazione della welcome page di ogni storia
const welcomePageTop = `<!DOCTYPE html>
<html lang="it">
  <head>
    <title aria-live="assertive" aria-atomic="true">Homepage player - La tua avventura inizia quì! Inserisci il tuo nome nel campo 'nomeGiocatore' e clicca sul pulsante 'avviaPartita'!</title>
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <link rel = "shortcut icon" href = "./img/icon.png">
    <link rel="shortcut icon" href="#">
    <meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script type="text/javascript" src="./js/player.js"></script>
    <script src="https://kit.fontawesome.com/64d58efce2.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="./css/style.css" />
  </head>
  <body aria-live="assertive" aria-atomic="false">

    <div id="player-interface" class="container">

      <div class="start-container">
        <div class="start">
          <form action="#" class="start-form">
            <h1>Sei pronto ad intraprendere <br>questa avventura?</br></h1>
            <label for="nomeGiocatore">
              <input id="nomeGiocatore" type="text" placeholder="Inserisci il tuo nickname" aria-required="true"></input>
            </label>
            <label for="avviaPartita">
              <button class="btn button" id="avviaPartita" aria-label="Clicca questo pulsante per avviare la tua partita!" value="`;

const welcomePageBottom = `">INIZIA</button>
            </label>
          </form>
        </div>
      </div>
    
      <div class="panels-container">
        <div class="panel left-panel">
          <div class="content">
            <div class="logo">
              <nav><p><img src = "./img/M-M.png" alt="logo"></a></p></nav>
            </div>
          </div>
          <img src="./img/man.png" class="image" alt="" />
        </div>
      </div>
    
    </div>
  </body>
</html>`;

//Creazione dell'app express e del gestore per il routing
var app = express();
const router = express.Router();

//Setto la cartella di storage dei dati ricavati dal form ed imposto il nome da assegnare ad ogni file (nome originale del file)
var storage = multer.diskStorage({destination : FILEpath, filename : function(req, file, cb){cb(null, file.originalname.substr(0, file.originalname.length - 4) + "-" + Date.now() + file.originalname.substr(file.originalname.length - 4));}});

//Assegno ad upload una funzione che salva i file passati con il proprio nome originale nella cartella designata da storage tale funzione
//crea inoltre un array, di massimo 3 elementi, contenente le informazioni dei dati salvati
var upload = multer({storage : storage}).array("data", 3);

app.use("/", router);
app.use(bodyParser.urlencoded({ extended: false }));


/* ########## Funzioni interne ########## */

function updateJSONserver(toStore, path)
{
    console.log("[#] Starting update uploaded stories' file...");

    try
    {
      var data = fs.readFileSync(path);
      console.log("[#] Found file '" + path + "', starting to update it");
      let tmp = JSON.parse(data);
      let flag = 1;
      if(path == JSONinfo)
      {
        for(story of tmp["stories"]) { if(story === toStore) { flag = 0; break; } }
      }
      else
      {
        for(story of tmp["stories"]) { if(story["nome"] === toStore["nome"]) { flag = 0; break; } }
      }
      if(flag)
      {
          tmp["stories"].push(toStore);
          fs.writeFileSync(path, JSON.stringify(tmp, null, 2));
      }
    }
    catch
    {
      console.log("[#] The file '" + path + "' does not exist yet, I proceed to create it with the received data");
      let tmp = {"stories" : []}
      tmp["stories"].push(toStore);
      fs.writeFileSync(path, JSON.stringify(tmp, null, 2));
    }
}

/* ########## Routing delle richieste HTTP ########## */

app.get("/getStories", function(req, res)
{
    console.log("[#] GET request received to see all uploaded stories");
    try
    {
      var readData = fs.readFileSync(JSONinfo)
      res.send(readData);
      res.end();
    }
    catch(err)
    {
      console.log("[#] ERROR: " + err);
    }
});

app.get("/*", function(req, res)
{
    console.log("[#] GET request received for the file: '" + decodeURI(req.url) + "'");
    res.sendFile(decodeURI(req.url), {root : __dirname});
});

app.post("/saveStory", function(req, res)
{
    fs.writeFile(JSONpath + req.body["nome"] + ".json", req.body["dati"], (err) => { if(err) { console.log("[#] ERROR: " + err); } });
    updateJSONserver(req.body["nome"], JSONinfo);
    res.send(req.body["nome"]);
    res.end();
});

app.post("/uploadfile", upload, function (req, res)
{
    console.log("[#] A file was detected, starting upload...");
    res.send(req.files[0].filename);
    console.log("[#] Upload completed!");
    res.end();
});

app.post("/saveImgDescription", function(req, res)
{
    fs.writeFile(FILEpath + req.body["nome"] + ".txt", req.body["data"], (err) => { if(err) { console.log("[#] ERROR: " + err); } });
});

app.post("/publishStory", function(req, res)
{
    console.log("[#] User will publish the story: '" + req.body["nome"] + "'");
    try
    {
      var readData = fs.readFileSync(JSONpath + req.body["nome"] + ".json");
      readData = JSON.parse(readData);
      var tmp = { "nome" : req.body["nome"], "eta" : readData["Info"][0], "numeroPersone" : readData["Info"][1], "descrizione" : readData["Info"][2] };
      updateJSONserver(tmp, JSONpublished);
      var welcomePage = welcomePageTop + req.body["nome"] + welcomePageBottom;    
      fs.writeFileSync(HTMLpublished + req.body["nome"] + ".html", welcomePage);
      try
      {
        var tmpData = JSON.stringify({"players" : []});
        fs.writeFileSync(StoriesPlayers + req.body["nome"] + ".json", tmpData);
      }
      catch(err)
      {
        console.log("[#] ERROR: " + err)
      }
      console.log("[#] User has publish the story: '" + req.body["nome"] + "'");
      res.send(host + HTMLpublishedQR + req.body["nome"] + ".html");
      res.end();
    }
    catch(err)
    {
      console.log("[#] ERROR: " + err); 
    }
});

app.post("/duplicateStory", function(req, res)
{
    console.log("[#] User will make a copy about the story: '" + JSONpath + req.body["nome"] + ".json'");
    var dest = JSONpath + req.body["nome"] + "-" + Date.now() + ".json";
    fs.copyFile(JSONpath + req.body["nome"] + ".json", dest, (err) => { if (err) { console.log("[#] ERROR: " + err); } });
    updateJSONserver(dest.substr(JSONpath.length, req.body["nome"].length + 14), JSONinfo);
    console.log("[#] The copy of '" + JSONpath + req.body["nome"] + ".json' is complete");
    res.end();
});

app.post("/deleteStory", function(req, res)
{
    console.log("[#] User will delete the story: '" + req.body["nome"] + ".json'");
    fs.unlink(JSONpath + req.body["nome"] + ".json", (err) => { if(err) { console.log("[#] ERROR: " + err); } });
    try
    {
      var readData = fs.readFileSync(JSONinfo);
      var oldData = JSON.parse(readData);
      fs.unlink(JSONinfo, (err) => { if(err) { console.log("[#] ERROR: " + err); } });
      var tmp = []
      for(story_name of oldData["stories"])
      {
        if(story_name != req.body["nome"]) { tmp.push(story_name); }
      }
      var tmpPub = [];
      readData = fs.readFileSync(JSONpublished);
      oldData = JSON.parse(readData);
      for(storyObj of oldData["stories"])
      {
        if(storyObj["nome"] != req.body["nome"]) { tmpPub.push(storyObj); }
      }
      var newData = {"stories" : tmp};
      oldData["stories"] = tmpPub;
      fs.writeFileSync(JSONinfo, JSON.stringify(newData, null, 2));
      fs.writeFileSync(JSONpublished, JSON.stringify(oldData, null, 2));
      console.log("[#] The story: '" + req.body["nome"] + ".json' has been deleted");
    }
    catch(err)
    {
      console.log("[#] ERROR : " + err);
    }
    res.end();
});

app.post("/noPublish", function(req, res)
{
    console.log("[#] User want to remove the story '" + req.body["nome"] + ".json' as public");
    try
    {
      var readData = fs.readFileSync(JSONpublished);
      var oldData = JSON.parse(readData);
      var tmp = []
      for(story_name of oldData["stories"])
      {
        if(story_name["nome"] != req.body["nome"]) {tmp.push(story_name)};
      }
      var newData = {"stories" : tmp};
      fs.writeFileSync(JSONpublished, JSON.stringify(newData, null, 2));
      fs.unlink(HTMLpublished + req.body["nome"] + ".html", (err) => { if(err) { console.log("[#] The story HTML file has already been deleted"); } });
      console.log("[#] The story '" + req.body["nome"] + ".json' is now no longer public");
    }
    catch(err)
    {
      console.log("ERROR: " + err);
    }
    res.end();
});

app.post("/getStory", function(req, res)
{
  try
  {
    var readData = fs.readFileSync(JSONpath + req.body["nome"] + ".json");
    res.send(JSON.stringify({"story" : JSON.parse(readData), "id" : Date.now()}));
  }
  catch
  {
    console.log("[#] The file '" + req.body["nome"] + ".json' not found"); 
  }
});

app.post("/updateStoryPlayers", function(req, res)
{
    try    
    {    
      var readData = fs.readFileSync(StoriesPlayers + req.body["nome"] + ".json");
      var tmp = JSON.parse(readData);
      tmp["players"].push({"player" : req.body["id"]});
      try
      {
        fs.writeFileSync(StoriesPlayers + req.body["nome"] + ".json", JSON.stringify(tmp, null, 2));
      }
      catch(err)
      {
        console.log(err);
      }
    }
    catch(err)
    {
      var tmp = {"players" : [{"player" : req.body["id"]}]};
      try
      {
        fs.writeFileSync(StoriesPlayers + req.body["nome"] + ".json", JSON.stringify(tmp, null, 2));
      }
      catch(err)
      {
        console.log(err);
      }
    }
    res.end();
});

app.post("/updateGameStatus", function(req, res)
{
    var readDataObj;
    try
    {
      var field = JSON.parse(req.body["data"])["field"];
      var val = JSON.parse(req.body["data"])["val"];
      var readData = fs.readFileSync(JSONstatus + JSON.parse(req.body["data"])["id"] + ".json");
      console.log("[#] Found the game status' file for the player with id '" + JSON.parse(req.body["data"])["id"] + "', I proceed to update it");
      readDataObj = JSON.parse(readData);
      switch(field)
      {
        case "id":
  
          readDataObj[field] = val;
          break;
  
        case "nome":
  
          readDataObj[field] = val;
          break;
  
        case "risposte":
  
          readDataObj[field].push(val);
          break;
          
        case "punteggi":
  
          readDataObj[field].push(val);
          break;
          
        case "tempoxrisp":
  
          readDataObj[field].push(val);
          break;
  
        case "aiuto":
  
          readDataObj[field] = val;
          break;
          
        case "testoAiuto":
  
          readDataObj[field] = val;
          break;
  
        case "rispostaAiuto":
  
          readDataObj[field] = val;
          break;  
          
        case "valutazione":
  
          readDataObj[field] = val;
          break;
          
        case "testoVal":
  
          readDataObj[field].push(val);
          break;
  
        case "tempo":
  
          readDataObj[field] = val;
          break;
  
        case "posizione":
  
          readDataObj[field] = val;
          break;
  
        case "modificaAttività":
  
          readDataObj[field] = val;
          break;

        case "tot":

          readDataObj["tot"] += Number(val);
          break;
      }
      fs.writeFileSync(JSONstatus + JSON.parse(req.body["data"])["id"] + ".json", JSON.stringify(readDataObj, null, 2));
    }
    catch
    {
      console.log("[#] The game status' file for the player with id '" + JSON.parse(req.body["data"])["id"] + "' doesn't exist yet, I proceed to create it");
      var tmpSTATUSstructure = '{"id": ' + val + ',"nome":"","risposte":[],"punteggi":[],"tempoxrisp":[],"tot":0,"aiuto":"false","testoAiuto":"","rispostaAiuto":"","valutazione":"","testoVal":[],"tempo":"false","posizione":"","modificaAttività":[]}'
      fs.writeFileSync(JSONstatus + JSON.parse(req.body["data"])["id"] + ".json", tmpSTATUSstructure, null, 2);
    }
    if(readDataObj)
    {
      res.send(JSON.stringify({"points" : readDataObj["punteggi"], "tot" : readDataObj["tot"], "unratedQuestions" : readDataObj["testoVal"]}));
    }
    else
    {
      res.end();
    }
    console.log("[#] Player with id '" + JSON.parse(req.body["data"])["id"] + "' has updated his status JSON");
});

app.post("/getUserStatus", function(req, res)
{
    console.log("[#] User with id '" + req.body["id"] + "' has requested his status JSON");
    try
    {
      var readData = fs.readFileSync(JSONstatus + req.body["id"] + ".json");
      res.send(readData);
    }
    catch(err)
    {
      console.log("[#] ERROR: " + err); 
    }
});

app.post("/sendMessage", function(req, res)
{
    var id = req.body["id"];
    var msg = req.body["msg"];
    try
    {
      var readData = fs.readFileSync(CHATpath + id + "-chat.json");
      console.log("[#] Found file '" + id + "-chat.json', starting to update it");
      var dataObj = JSON.parse(readData);
      dataObj["Domande player"].push(msg);
      fs.writeFileSync(CHATpath + id + "-chat.json", JSON.stringify(dataObj, null, 2));
    }
    catch(e)
    {
      console.log("[#] A chat for the player '" + id + "' doesn't exist yet, proceed to make it")
      var tmp = {"Domande player" : [msg], "Risposte valutatore" : []};
      fs.writeFileSync(CHATpath + id + "-chat.json", JSON.stringify(tmp, null, 2));
    }
    try
    {
      var readData = fs.readFileSync(valChatPath);
      readData = JSON.parse(readData);
      if(readData[id])
      {
        readData[id].push("player: " + msg);
      }
      else
      {
        readData[id] = ["player: " + msg];
      }
      fs.writeFileSync(valChatPath, JSON.stringify(readData, null, 2));
    }
    catch(e)
    {
      tmp = {id : ["player: " + msg]};
      fs.writeFileSync(valChatPath, JSON.stringify(tmp, null, 2));
    }
    res.end();
});

app.post("/getMessage", function(req, res)
{
    var id = req.body["id"];
    var user = req.body["user"];
    try
    {
      var readData = fs.readFileSync(CHATpath + id + "-chat.json");
      var dataObj = JSON.parse(readData);
      res.send({"valutatore" : dataObj[user][dataObj[user].length - 1]});
    }
    catch
    {
      var tmp = {"Domande player" : [], "Risposte valutatore" : []};
      fs.writeFileSync(CHATpath + id + "-chat.json", JSON.stringify(tmp, null, 2));
    }
});

app.listen(port);
console.log("[#] Server listening on " + ip + ":" + port);

//DA QUI IN POI VALUTATORE
//porta l'array giocatori.json nell'oggetto data


function updateEsportaFile(field, value, id)
{
  readData = fs.readFileSync(__dirname + "/json/esporta.json");
  readData = JSON.parse(readData);
  for(var i = 0; i < readData[0].length; i++) 
  { 
    if(readData[0][i]["id"] == id) 
    { 
      switch(field)
      {
        case "nome":

          readData[0][i][field] = value;
          break;
        
        case "tot":
          
          readData[0][i][field] += value;
          break;

        case "rispostaAiuto":
          
          readData[0][i][field] = value;
          break;
        
        case "modificaAttività":
          
          readData[0][i][field] = value;
          break;

        case "punteggi":

          readData[0][i][field].push(value);
          break;
      }

      break;
    } 
  }



  readData.sort(function(a, b){
   return b.tot - a.tot;
   
 });

  fs.writeFileSync(__dirname + "/json/esporta.json", JSON.stringify(readData, null, 2));
}

//set up a route that change a name in giocatori.json array
function changeName(newNome, id) 
{
  try
  {
    var readData = fs.readFileSync(__dirname + "/stories_players/status/" + id + ".json");
    readData = JSON.parse(readData);
    readData["nome"] = newNome;
    fs.writeFileSync(__dirname + "/stories_players/status/" + id + ".json", JSON.stringify(readData));
    updateEsportaFile("nome", newNome, id);
  }
  catch(e)
  {
    console.log(e);
  }
}

function addPrize(howMuch, id)
{
  try
  {
    var readData = fs.readFileSync(__dirname + "/stories_players/status/" + id + ".json");
    readData = JSON.parse(readData);
    readData["tot"] += howMuch;
    fs.writeFileSync(__dirname + "/stories_players/status/" + id + ".json", JSON.stringify(readData));
    updateEsportaFile("tot", howMuch, id);
  }
  catch(e)
  {
    console.log(e);
  }
}
 
function setHelp(risp, id)
{
  try
  {
    var readData = fs.readFileSync(__dirname + "/stories_players/status/" + id + ".json");
    readData = JSON.parse(readData);
    readData["rispostaAiuto"] = risp;
    fs.writeFileSync(__dirname + "/stories_players/status/" + id + ".json", JSON.stringify(readData));
    updateEsportaFile("rispostaAiuto", risp, id);
  }
  catch(e)
  {
    console.log(e);
  }
}

function changeTask(newTask, id)
{
  try
  {
    var readData = fs.readFileSync(__dirname + "/stories_players/status/" + id + ".json");
    readData = JSON.parse(readData);
    readData["modificaAttività"] = newTask;

    fs.writeFileSync(__dirname + "/stories_players/status/" + id + ".json", JSON.stringify(readData));
    updateEsportaFile("modificaAttività", newTask, id);
  }
  catch(e)
  {
    console.log(e);
  }
}

 app.post('/cambia/nome', (req, res) => {
  var newName = req.body.nuovoNome;
  var id = req.body.id;
  newName = newName.replace(/\s/g, '');
  changeName(newName, id);
  res.end();
});

app.post('/add/prize', (req, res) => {
  var howMuch = req.body.quanto;
  var idPl=req.body.id;
  howMuch = parseInt(howMuch);
  addPrize(howMuch, idPl);
  res.end();
});

app.post('/mandaAiuto', (req, res) => {
  var risposta = req.body.risposta;
  var aChi = req.body.aChi;
  setHelp(risposta, aChi);
  res.end();
});

function pushCHATValutatore(msg){ try { 
  fs.writeFileSync(valChatPath, JSON.stringify(msg, null, 2));  } catch(e) {  
    console.log(e); } }

function pushCHATcommon(msg, id){ try { 
  fs.writeFileSync(__dirname + '/chat/'+id+'-chat.json', JSON.stringify(msg, null, 2)); 
} catch(e) { console.log(e); } };


  app.post('/manda/msg', (req, res) => {
    var msg = req.body.msg;
    var id=req.body.id;
    var allMsg='';
    var arrayR='';
    var CPath=__dirname + '/chat/'+id+'-chat.json';
    var Vpath=__dirname + '/json/val-chat.json';
    try
    {
      var chat = require(CPath);
    }
    catch(e)
    {
      var tmp = {"Domande player" : [], "Risposte valutatore" : [msg]};
      fs.writeFileSync(__dirname + '/chat/'+id+'-chat.json', JSON.stringify(tmp));
      var chat = require(CPath);
    }
    
    //CHECK: problema require è come se fosse un readFile asincrono forse
    var path = require('path');
    var filename = path.resolve(Vpath);
    delete require.cache[filename];
    var vChat = require(Vpath);
    allMsg=(vChat[id]);
    var allArray= [];
    allArray.push(id);
    arrayR = (chat["Risposte valutatore"]);
    if(allMsg!=null)
    {
      
     // allMsg=(vChat[id]);
      vChat[id].push("tu: " + msg); 
    }
    else
    {
      vChat[id]=[];
      vChat[id].push("tu: "+ msg);
    }

    arrayR.push(msg);

    pushCHATcommon(chat, id);
    
    pushCHATValutatore(vChat);
    res.end();

  });
  



app.post("/getQrCodeString", (req, res) => { res.send(host + HTMLpublishedQR + req.body["nome"] + ".html"); });


app.post("/cambiaTask", (req, res) => { 
  var tipo = req.body.tipo;
  var text = req.body.newText;
  var perChi = req.body.perChi;
  var obj = [text, tipo];
  changeTask(obj, perChi);
  res.end();
});


app.post("/valPunteggio", (req, res) => { 
  var id=req.body.nome;
  id = id.replace(/\s/g, '');
  var punteggio=parseInt(req.body.punteggio);
  var numero= req.body.numero;
 
  try{
    var readData = fs.readFileSync(__dirname + "/stories_players/status/" + id + ".json");
    readData = JSON.parse(readData);
    readData["punteggi"][numero]= punteggio;
    readData["tot"] += punteggio;
    fs.writeFileSync(__dirname + "/stories_players/status/" + id + ".json", JSON.stringify(readData));
    //updateEsportaFile("punteggi", punteggio, id);
    //updateEsportaFile("tot", punteggio, id);
  }
  catch(e)
  {
    console.log(e);
  }
  res.end();
})


function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}
//FUNZIONE CHE SCRIVE IL FILE esporta.json IN BASE AL NOME DELLA STORIA DATO
function aggiornaEsporta(nomeStoria){
  var esportaGiocatori = [];
  var temp='';
  var players = [];
    players = requireUncached(__dirname + "/stories_players/"+nomeStoria+".json");
    if(players.hasOwnProperty("players"))
    {
      for(let i=0; i<players["players"].length; i++){
        temp=requireUncached(__dirname + "/stories_players/status/"+players["players"][i].player+".json");
        //var x = require(__dirname + "/stories_players/status/1613752259057.json");
        esportaGiocatori.push(temp);
      }
      try
      {
        esportaGiocatori.sort(function(a, b){
          return b.tot - a.tot;
        });
        fs.writeFileSync(esportaPath, JSON.stringify(esportaGiocatori, null, 2));
      }
      catch(err)
      {
        console.log("[#] ERROR: " + err)
      }
    }
}

//POST CHE RICEVE IL NOME DELLA STORIA E AGGIORNA IL FILE ESPORTA
app.post("/nome-storia", (req, res) => { 
  var nomeStoria = req.body.nomeStoria;
  if(nomeStoria){ aggiornaEsporta(nomeStoria); }
 res.end();
});

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

app.post("/numeroTask", (req, res) => { 
  var nomeStoria = req.body.nomeStoria;
  var readData='';
  var numero = 0;
  var chiavi = '';
  if(nomeStoria){  
     readData = JSON.parse(fs.readFileSync(JSONpath + nomeStoria + ".json"));
    
    chiavi = (Object.keys(readData));
    
    for(let i=0; i<(chiavi.length); i++){
      let temp=chiavi[i];
      if(readData[temp]['Tipologia attivita']){
        if(!isObjectEmpty(readData[temp]['Tipologia attivita'][4]['Attività errore'])){
          
          numero+=1;
        }
      }
      
      if(chiavi[i].includes("attività")){
        numero += 1;
      }
    }
   
  }
 res.end('"'+numero+'"');
});

app.post("/cancellaVal", (req,res)=>{
  var data=req.body.data;
  var id=req.body.id;
  
  data=JSON.parse(data);
  
  fs.writeFileSync(__dirname+'/stories_players/status/'+ id + '.json', JSON.stringify(data, null, 2));
  res.end();
})
