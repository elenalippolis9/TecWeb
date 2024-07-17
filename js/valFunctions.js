//funzione per aprire la chat
function openForm() {
  document.getElementById("myForm").style.display = "block";
}
//funzione per chiudere la chat
function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

//FUNZIONE PER MANDARE AIUTO AI GIOCATORI TRAMITE BOX DI AIUTO O TEMPO

function sendHelpAiuto(){       
  var aChi = $(".custom-select option:selected").val();
  var risposta = $("#rispostaAiuto").val(); 
$.ajax({
  type: "POST",
  url: "/mandaAiuto",
  data: "risposta=" + risposta + "&aChi=" + aChi,
  dataType: "html",
  success: function(msg) {
      document.getElementById("rispostaAiuto").value ='';
  },
  error: function(){
      console.log("error");
   }
  
})
};

//FUNZIONE CHE MANDA I MESSAGGI NELLA CHAT

  function sendMsg(){  
    var msg = $("#rispostaChat").val(); 
    var id=  $("#scegliNome option:selected").val();
  
      $.ajax({
        type: "POST",
        url: "/manda/msg",
        data: "msg=" + msg + "&id=" + id,
        //dataType: "html",
        success: function() {
            document.getElementById("rispostaChat").value='';
        },
        error: function(error){
          console.log(error);
        }
    });
      
    
  };

//FUNZIONE PER LA VISUALIZZAZIONE DEI MESSAGGI

  function showMsg(){
    var id=$("#scegliNome option:selected").val();    
      //mostra messaggi
      if(id)
      {
          $.getJSON('json/val-chat.json', function(dataChat){
            var newObj = dataChat; 
          var messaggi = document.querySelector("#messages"); 
          var msg='';
                      
              if(newObj[id]==undefined){
                msg += "<div id='singlemsg'>  </div>";
                messaggi.innerHTML=msg;
              } else {
                for(let i=0; i<newObj[id].length; i++){
                  msg += "<div id='singlemsg'>" + newObj[id][i]+ " </div>";
                }
                messaggi.innerHTML=msg;
              }
            
          });
      }
  }
  setInterval(showMsg, 1000);

//FUNZIONE PER MANDARE AIUTO AI GIOCATORI TRAMITE BOX DI AIUTO O TEMPO
//si attiva con il pulsante invia di tempo
function sendHelpTempo(){       
  var aChi = $(".custom-select option:selected").val();
  var risposta = $("#rispostaTempo").val(); 
$.ajax({
  type: "POST",
  url: "/mandaAiuto",
  data: "risposta=" + risposta + "&aChi=" + aChi,
  dataType: "html",
  success: function(msg) {
      document.getElementById("rispostaTempo").value = '';
  },
  error: function(){
      console.log("error");
   }
  
})
};
//FUNZIONE CHE VALUTA MANUALMENTE LE RISPOSTE in valutazione.html

function valManuale(nome, numero){
  var punteggio= ($("#valutazione-manuale option:selected").text());
  
  $.ajax({
    type: "POST",
    url: "/valPunteggio",
    data: "nome=" + nome + " &punteggio=" + punteggio + " &numero=" + numero,
    dataType: "html",
    success: function() {
        $.getJSON("../stories_players/status/"+nome+".json", function(data){
          var dataChiavi = Object.keys(data['testoVal']);

          for(let i=0; i<dataChiavi.length; i++){
           if(data['testoVal']){
            if(data['testoVal'][i]){
              if(data['testoVal'][i][1]==numero){
                data['testoVal'].splice(i, 1);
                if(data['testoVal'].length==0){
                  data['valutazione']='false';
                }
                data= (JSON.stringify(data));
                $.ajax({
                  type: "POST",
                  url: "/cancellaVal",
                  data: "data=" + data + " &id=" + nome,
                
                  success: function() {
                      divVal();
                  },
                  error: function(){
                      console.log("error");
              
                  }
              });
              }}
           }
            
            }
            
          });
          
          
    },
    error: function(){
        console.log("error");

    }
}); 

}
 


//FUNZIONE CHE CAMBIA IL NOME DI UN GIOCATORE, ASSEGNA I PREMI
//E GESTISCE IL CAMBIO DI TASK in storie-giocatori.html, 
function changeName(){       
      var nome = $("#nome").val(); 
      nome = nome.replace(/\s/g, '');
  
      $.ajax({
          type: "POST",
          url: "/cambia/nome",
          data: "nuovoNome=" + nome + "&id=" + document.getElementById("cambiaNome").value,
          dataType: "html",
          success: function() {
              document.getElementById("nome").value = '';
          },
          error: function(){
              console.log("error");
  
          }
      });
    }
  
    function addPrize(){
      var id = ($("#cambiaNome2 option:selected").val());
      var quanto = $(".custom-select.terzo option:selected").text(); 
      $.ajax({
          type: "POST",
          url: "/add/prize",
          data: "quanto=" + quanto+ " &id=" + id,
          dataType: "html",
          success: function(msg) {
      },
      error: function(){
          console.log("err");
      }
      });
    };
  
  function changeTask(){
    var tipo = $("#tipoInputTask").val(); 
    var newText=$("#cambiaT").val();
    var perChi = $("#perChiTask").val();
    $.ajax({
        type: "POST",
        url: "/cambiaTask",
        data: "tipo=" + tipo + "&newText=" + newText+ "&perChi=" + perChi,
        dataType: "html",
        success: function() {
          document.getElementById("cambiaT").value = '';
        },
        error: function(){
            console.log(error);
        }
    }); 
  };



//funzione anonima che serve per aspettare che il DOM sia caricato prima di
//lavorare sul DOM
$(() => {
//POPOLA IL TAG SELECT DINAMICAMENTE COI NOMI DELLE STORIE PUBBLICATE

//+ FUNZIONE CHE POPOLA IL SELECT DELLA CHAT CON I NOMI DEI GIOCATORI E MANDA L'ID
//DEI GIOCATORI AL SERVER
$.getJSON("../uploaded_data/publishedStories.json", function(data) {
  var myObj=data;
  var selectItem=document.getElementById("scegliStoria");
  myObj=myObj["stories"];
  var optionItem='';
  if(document.getElementById("scegliStoria")){
    for(let i=0; i<myObj.length; i++){
      optionItem+=
      "<option data-limit='7' value="+myObj[i].nome+">"+ myObj[i].nome + "</option>";
    }
    selectItem.innerHTML+=optionItem;
  }
  
  if (localStorage.getItem('scegliStoria')) {
    $("#scegliStoria option").eq(localStorage.getItem('scegliStoria')).prop('selected', true);
}

$("#scegliStoria").on('change', function() {
    localStorage.setItem('scegliStoria', $('option:selected', this).index());
});

  var nomeStoria= $("#scegliStoria option:selected").val();
  if(nomeStoria){
    $.ajax(
      {
        type: "POST",
        url: "/numeroTask",
        data: "nomeStoria=" + nomeStoria,
        success: function(data) {
          var num = JSON.parse(data);
          popolaTableHeader(num);
        }
      });  
  }
  
//ogni volta che il valore del dropdown scegliStoria cambia, viene cambiato nomeStoria
//da cui dipendono tutti i parametri (i giocatori e il file della storia)
  $("#scegliStoria").change(function () {  
    nomeStoria= $("#scegliStoria option:selected").val();
    if(nomeStoria){
      $.ajax(
        {
          type: "POST",
          url: "/nome-storia",
          data: "nomeStoria=" + nomeStoria,
          error: function() {
              console.log("error");
          }
        });
        $.ajax(
          {
            type: "POST",
            url: "/numeroTask",
            data: "nomeStoria=" + nomeStoria,
            success: function(data) {
              var num = JSON.parse(data);
              
              popolaTableHeader(num);
            }
          });
    }
   
  });
})
});

  //viene salvato il nome della storia preso dal tag select
  function uploadEsporta(){
    var nomeStoria ='';
    if(document.getElementById("scegliStoria")){
      nomeStoria= document.getElementById("scegliStoria").value;

    }
    $.ajax(
      {
        type: "POST",
        url: "/nome-storia",
        data: "nomeStoria=" + nomeStoria,
        error: function() {
           console.log('error');
        }
      });  
  }
 setInterval(uploadEsporta, 5000);
 setTimeout(uploadEsporta, 100);

  function popolaDropdown(giocatori){
    var box='' ;
    var boxChat='' ;
    var boxAiuto = '';
    var boxTempo = '';

    for(let i=0; i<giocatori.length; i++){
      //funzioni giocatori dropdown  
      var primoBox = document.querySelector("#cambiaNome");
      var secondoBox = document.querySelector("#cambiaNome2");
      var terzoBox = document.querySelector('#perChiTask');
      var aiutoBox = document.querySelector("#cambiaNomeAiuto");
      var chatBox = document.querySelector("#scegliNome");
      var tempoBox = document.querySelector("#cambiaNomeTempo");

      var drop = "";
      var dropdownNome = "";
      var dropAiuto='';
      var dropTempo='';
            box +=  
      
      "<option class='dropdown-item' id='vecchioNome' value='" + giocatori[i].id.toString() + "'>"  + giocatori[i].nome.toString()  + "</option>";           
      boxChat +=  
      "<option value="+ giocatori[i].id.toString() +" id='option-chat'> <button id='vecchioNomeChat'  >"  + giocatori[i].nome.toString()  + "</button></option>"; 
      if(giocatori[i].aiuto=="true"){
        boxAiuto+=       "<option value="+ giocatori[i].id.toString() +" id='option-chat'> <button id='vecchioNomeChat'  >"  + giocatori[i].nome.toString()  + "</button></option>"; 
      }
      if(giocatori[i].tempo=="true"){
        boxTempo+=       "<option value="+ giocatori[i].id.toString() +" id='option-chat'> <button id='vecchioNomeChat'  >"  + giocatori[i].nome.toString()  + "</button></option>"; 
      }
      }
      drop +=  boxChat;
      dropdownNome +=  box;
      dropAiuto += boxAiuto;
      dropTempo += boxTempo;
      
      if(secondoBox) { 
        
        if(dropdownNome==""){
          secondoBox.innerHTML = "<option> Nessun giocatore online </option>";
          
        } else {
          secondoBox.innerHTML = dropdownNome; 
        }
      }
      if(primoBox) { 
        
        if(dropdownNome==""){
          primoBox.innerHTML = "<option> Nessun giocatore online </option>";
          
        } else {
          primoBox.innerHTML = dropdownNome; 
        }
      }
      if(tempoBox){ 
        if(dropTempo==""){
          tempoBox.innerHTML = "<option> Nessun giocatore fermo </option>";
          
        } else {
          tempoBox.innerHTML = dropTempo; 
        }

        
      }
      if(terzoBox){ 
        if(dropdownNome==""){
          terzoBox.innerHTML = "<option> Nessun giocatore online </option>";
          
        } else {
          terzoBox.innerHTML = dropdownNome; 
        }
        
      }  
      if(aiutoBox){
        if(dropAiuto==""){
          aiutoBox.innerHTML = "<option> Nessuna richiesta di aiuto </option>";
          
        } else {
          aiutoBox.innerHTML =dropAiuto;
        }
         
        }
      if(chatBox){ 
        if(drop==""){
          chatBox.innerHTML = "<option> Nessun giocatore online </option>";
          
        } else {
          chatBox.innerHTML = drop;
          chatBox.innerHTML += "</select>";
        }
        
      } 
  }

  function popolaAiuto(giocatori){
    var cardBody = document.getElementById('cardEl');
    var li = "<li class='list-group-item'><div class='row align-items-center no-gutters'><div class='col mr-2'>";

    for(let i=0; i<giocatori.length; i++){
      let temp = eval(giocatori[i].aiuto);
      if(temp==true){
        li +=  
          "<h6 class='mb-0'><strong> '" + giocatori[i].testoAiuto  + "'</strong></h6><span class='text-xs'> - " + giocatori[i].nome  + "</span>";
  
      /* We add the table row to the table body */
  
    }
  }cardBody.innerHTML = li;
  }

  function popolaTabella1(giocatori){
    var tbody = document.getElementById('giocatori');
    var tr = "<tr style='background-color: white; '>";
    for(let i=0; i<giocatori.length; i++){
      
      
          tr +=  
          "<td id=nome"+i+">" + giocatori[i].nome.toString() + "</td>";
          for(let j=0; j<giocatori[i].risposte.length; j++){
            if(Array.isArray(giocatori[i].risposte[j])){
              tr += "<td id=risp"+i+j+">";
              for(let k=0; k<giocatori[i].risposte[j].length; k++){
                tr += "<img class='table-img' src='../uploaded_data/files/" +giocatori[i].risposte[j][k].toString() + " ' style='width: 40px' />";
              }
              tr += "</td>";
            }
             else if(giocatori[i].risposte[j].toString().includes('jpg') ||(giocatori[i].risposte[j].toString().includes('png'))){
              tr += "<td id=risp"+i+j+"><img class='table-img' src='../uploaded_data/files/" + giocatori[i].risposte[j].toString() + " '/></td>";
            } else {
              tr += "<td id=risp"+i+j+">" + giocatori[i].risposte[j].toString() + "</td>";
            }
          }
          tr += "</tr>";
          
    }tbody.innerHTML = tr;
  }

  function popolaTabella2(giocatori){
    var tbody2 = document.getElementById('demo');
    var contaTempo=0;
    var tr2 = "<tr style='background-color: white'>";
    
    for(let i=0; i<giocatori.length; i++){
      
      
      tr2 +=  
        "<td id=nome"+i+">" + giocatori[i].nome.toString() + "</td>";
        
        tr2 +=
        "<td id=fase"+i+">" + giocatori[i].posizione + "</td>";
    
        for(let j=0; j<giocatori[i].tempoxrisp.length; j++){
            contaTempo += parseInt(giocatori[i].tempoxrisp[j]);
        } 
        tr2 +=
        "<td id=tempo"+i+">" + contaTempo + "</td>";
        tr2 +=
        "<td id=tot"+i+">" + giocatori[i].tot  + "</td>";
        tr2 += "</tr>";
    }
    tbody2.innerHTML = tr2;
  }

  function popolaNotifiche(giocatori){
    var richiestaAiuto = document.getElementById('notificaAiuto');
    var richiestaVal = document.getElementById('notificaVal');
    var richiestaTempo = document.getElementById('notificaTempo');

  var countHelp = 0;
  var countVal = 0;
  var countTempo =0;
  var aiuto=false;
  var valut=false;
  var tempo=false;
  for(var i=0; i<giocatori.length; i++){

  aiuto= aiuto || eval(giocatori[i].aiuto.toString()) ;
  valut = valut || eval(giocatori[i].valutazione.toString());
  tempo = (tempo || eval(giocatori[i].tempo.toString()));
  if(aiuto===true){
  if(eval(giocatori[i].aiuto.toString())==true){
    countHelp +=1; 
  }
}
if(valut===true){
  if(eval(giocatori[i].valutazione.toString())==true){
    countVal += giocatori[i].testoVal.length; 
  }}
  if(tempo===true){
    if(eval(giocatori[i].tempo.toString())==true){
      countTempo +=1;
    }
  }
  var pHelp ="<button type='button' class='btn btn-outline-warning' style='color:black' onclick='divAiuto() '>";
  var pVal= "<button type='button' class='btn btn-outline-warning' style='color:black' onclick='divVal()'>";
  var pTempo = "<button type='button' class='btn btn-outline-warning' style='color:black' onclick='divTempo()'>";

  pHelp += "Aiuto <br><span class='badge bg-dark' style='color:whitesmoke' > " + countHelp + "</span></button>";
  if (richiestaAiuto) {
    richiestaAiuto.innerHTML = pHelp;
  }
  pVal += "Valutazione <br> <span class='badge bg-dark' style='color:whitesmoke'> " + countVal + "</span></button>";
  if(richiestaVal){
    richiestaVal.innerHTML = pVal;
  }
  pTempo +=  "Tempo<br> <span class='badge bg-dark' style='color:whitesmoke'> " + countTempo +"</span></button>";
  if(richiestaTempo){
    richiestaTempo.innerHTML = pTempo;
  }
}
  }

  function popolaTableHeader(index){
    var header = document.getElementById("giocatoriHeader");
    var tHeader = "<th>Giocatore</th>";
    
    
      for(let j=0; j<index; j++){
        tHeader += "<th>R"+ (j+1) +"</th>";
      }
    
    header.innerHTML= tHeader;
    
  }


  function popolaValutatore(){
    $.getJSON('../json/esporta.json', function(giocatori){
      $(function() {
        if (localStorage.getItem('scegliNome')) {
          $("#scegliNome option").eq(localStorage.getItem('scegliNome')).prop('selected', true);
      }
      
      $("#scegliNome").on('change', function() {
          localStorage.setItem('scegliNome', $('option:selected', this).index());
      });

        if (localStorage.getItem('perChiTask')) {
          $("#perChiTask option").eq(localStorage.getItem('perChiTask')).prop('selected', true);
      }
      
      $("#perChiTask").on('change', function() {
          localStorage.setItem('perChiTask', $('option:selected', this).index());
      });

        if (localStorage.getItem('cambiaNome')) {
          $("#cambiaNome option").eq(localStorage.getItem('cambiaNome')).prop('selected', true);
      }
      
      $("#cambiaNome").on('change', function() {
          localStorage.setItem('cambiaNome', $('option:selected', this).index());
      });

        if (localStorage.getItem('cambiaNome2')) {
          $("#cambiaNome2 option").eq(localStorage.getItem('cambiaNome2')).prop('selected', true);
      }
      
      $("#cambiaNome2").on('change', function() {
          localStorage.setItem('cambiaNome2', $('option:selected', this).index());
      });

        if (localStorage.getItem('cambiaNomeAiuto')) {
          $("#cambiaNomeAiuto option").eq(localStorage.getItem('cambiaNomeAiuto')).prop('selected', true);
      }
      
      $("#cambiaNomeAiuto").on('change', function() {
          localStorage.setItem('cambiaNomeAiuto', $('option:selected', this).index());
      });
        });
      popolaDropdown(giocatori);
      if(document.getElementById('cardEl')) {popolaAiuto(giocatori)};
      if(document.getElementById('giocatori')) {popolaTabella1(giocatori); }
      if(document.getElementById('demo')){popolaTabella2(giocatori);}
      //popolaValutazione(giocatori);
      popolaNotifiche(giocatori);
      //popolaTableHeader(giocatori);
    });

  };

  setTimeout(popolaValutatore, 100); 
  setInterval(popolaValutatore, 10000);


//FUNZIONE CHE AGGIORNA DOMANDA, RISPOSTA E NOME del messaggio da valutare
//in valutazione.html
function valut(){
  if (localStorage.getItem('scegliStoria')) {
    $("#scegliStoria option").eq(localStorage.getItem('scegliStoria')).prop('selected', true);
}

$("#scegliStoria").on('change', function() {
    localStorage.setItem('scegliStoria', $('option:selected', this).index());
});
  if(document.getElementById('cardElV'))
  {  
    $("#scegliStoria").change(function() { 
      nomeStoria= $("#scegliStoria option:selected").val();
    });
    var nomeStoria ='';
    //viene salvato il nome della storia preso dal tag select
      nomeStoria= document.getElementById("scegliStoria").value;
    
    //path "dinamici" che dipendono dal nome della storia
    var pathGiocatori=`../stories_players/${nomeStoria}.json`;
  
    $.getJSON(pathGiocatori, function(storyPlayers) 
    {
      var cardBody = document.getElementById('cardElV');

        for(playerObj of storyPlayers["players"])
        {
          $.getJSON("../stories_players/status/"+ playerObj["player"] +'.json', function(statusPlayer)
          {
            if(statusPlayer["valutazione"] == "true")
            {             
              for(textVal of statusPlayer["testoVal"])
              { 
                if((statusPlayer["risposte"][textVal[1]].includes("jpg")) || (statusPlayer["risposte"][textVal[1]].includes('png'))){
                  var h = "<h6 class='list-group-item'><div class='row align-items-center no-gutters'><div class='col mr-2'>";
                h += "<h6 class='mb-0'>D: "+textVal[0]+"<br><strong> R:  <img src='../uploaded_data/files/" + statusPlayer["risposte"][textVal[1]]  + "' class='img-val'></strong></h6><span class='text-xs nome-val'> - " + statusPlayer["nome"] + "</span>";
                h +=  "<select class='custom-select' id='valutazione-manuale' style='width: 100%; margin-bottom:10px'><option value='1' selected>0</option><option value='2'>5</option><option value='3'>10</option><option value='4'>15</option><option value='5'>-5</option><option value='6'>-10</option><option value='7'>-15</option></select>";
                h += "<button class='btn btn-outline-secondary' id='btn-val' onclick='valManuale( `"+statusPlayer["id"]+"` , `"+textVal[1]+"`)'  type='button'>Invia</button>";
                /* We add the table row to the table body */
                cardBody.innerHTML += h;
                } else if(Array.isArray(statusPlayer["risposte"][textVal[1]])) {
                  var h = "<h6 class='list-group-item'><div class='row align-items-center no-gutters'><div class='col mr-2'>";
                    h += "<h6 class='mb-0'>D: "+textVal[0]+"<br><strong> R:  ";
                  for(let k=0; k<statusPlayer["risposte"][textVal[1]].length; k++){
                    h+= "<img style='width:40px' src='../uploaded_data/files/" + statusPlayer["risposte"][textVal[1]][k]  + "' class='img-val'>";
                  }
                  h+= "</strong></h6><span class='text-xs nome-val'> - " + statusPlayer["nome"] + "</span>";
                    h +=  "<select class='custom-select' id='valutazione-manuale' style='width: 100%; margin-bottom:10px'><option value='1' selected>0</option><option value='2'>5</option><option value='3'>10</option><option value='4'>15</option><option value='5'>-5</option><option value='6'>-10</option><option value='7'>-15</option></select>";
                    h += "<button class='btn btn-outline-secondary' id='btn-val' onclick='valManuale( `"+statusPlayer["id"]+"` , `"+textVal[1]+"`)'  type='button'>Invia</button>";
                    /* We add the table row to the table body */
                    cardBody.innerHTML += h;

                } else {
                  //domanda risposta nome
                var h = "<h6 class='list-group-item'><div class='row align-items-center no-gutters'><div class='col mr-2'>";
                h += "<h6 class='mb-0'>D: "+textVal[0]+"<br><strong> R: '" + statusPlayer["risposte"][textVal[1]]  + "'</strong></h6><span class='text-xs nome-val'> - " + statusPlayer["nome"] + "</span>";
                h +=  "<select class='custom-select' id='valutazione-manuale' style='width: 100%; margin-bottom:10px'><option value='1' selected>0</option><option value='2'>5</option><option value='3'>10</option><option value='4'>15</option><option value='5'>-5</option><option value='6'>-10</option><option value='7'>-15</option></select>";
                h += "<button class='btn btn-outline-secondary' id='btn-val' onclick='valManuale( `"+statusPlayer["id"]+"` , `"+textVal[1]+"`)'  type='button'>Invia</button>";
                /* We add the table row to the table body */
                cardBody.innerHTML += h;
                }
                
              } 
            }
          });
        }
    });
  }
}  
setTimeout(valut, 100);




//single page application
function divStoria(){
  var storia='';
  storia = '<div id="content" class="row"><div class="d-flex flex-column col-9" id="content-wrapper" style="  justify-content: center; align-items: center !important; width:90%;"> <div id="content" style="width: 100%;"></div>';
  storia += '<div class="container-fluid" style="margin-top:16px"><div class="row" style="height: 19%; margin-bottom:2%!important;  justify-content: center; margin-top: 5px; align-items: center; width: 75%; margin:auto; "><div class="card col" id="first-card" style="background-color:rgba(60, 87, 77, 0.9);  width: 100%; justify-content: center; align-items: center !important; height: 100%">';
  storia += '<div class="card-header " style="color:rgb(212, 211, 211)"><strong>Cambia il nome di un giocatore</strong></div><div class="dropdown" style="color: rgb(212, 211, 211); width:60%; margin:auto; align-self:center"  >';
  storia += '<select class="custom-select  secondo" id="cambiaNome"style="width: 100%; margin-bottom:10px">Seleziona un nome<span class="caret"></span></select></div> ';
  storia += '<div class="input-group mb-3" style="width: 65%; margin:auto"><input type="text" id="nome" name="nome" class="form-control" placeholder="Nuovo nome" aria-label="Nuovo nome" aria-describedby="button-addon2" required><div class="input-group-append">';
  storia += '<button class="btn btn-outline" type="button submit" id="changeNameBtn" onclick="changeName()" style="background-color:black; color:whitesmoke; height:100%;">Cambia</button></div> </div>  </div></div> <div class="row" style="height: 19%; justify-content: center; margin-top: 5px; margin-bottom:2% !important; align-items: center; width: 75%; margin:auto; "><div class="card col"  style="background-color:rgba(60, 87, 77, 0.9); color:rgb(212, 211, 211); width:100%; height: 100%; justify-content: center; align-items: center !important; ">';
  storia += '<div class="card-header"><strong>Cambia task</strong></div><div class="card" style="padding-bottom:0; align-content: center!important; justify-content: center!important;"><div class="input-group " id="cambiaTask" style="align-self:center; margin:auto; width:100%"><div class="input-group-prepend" style="width:40%">';
  storia+= '<select class="custom-select task2" id="perChiTask" style="width:90%"></select></div><select class="custom-select task1" id="tipoInputTask" style="width:60%"><option value="Testo libero">Testo libero</option><option value="Caricamento file">Caricamento file</option></select>';
                         
  storia += '<p style="align-self: center; margin:auto">Testo della domanda:</p><div class="input-group mb-1 " style="width: 90%; margin:auto; margin-bottom: 4%"><input type="text" id="cambiaT" name="cambiaTO" class="form-control" placeholder="Scrivi qui" aria-label="Scrivi qui" aria-describedby="button-addon2">'
  storia += '<div class="input-group-append"><button class="btn btn-outline-secondary" type="button submit" id="changeTaskBtn" onclick="changeTask()" style="background-color:black; color:whitesmoke; height:100%;">Cambia</button></div></div> </div>  </div></div> </div>';
  storia += '<div class="row" style="height: 19%; margin-top: 5px; align-items: center; width: 74%; margin:auto; margin-bottom:2% !important"><div class="card col" style=" color: rgb(212, 211, 211);background-color:rgba(60, 87, 77, 0.9);  width: 100%; justify-content: center; align-items: center !important;  height: 100% !important;"><div class="card-header"><strong>Assegna premi</strong></div>';
  storia += '<div class="card" style="width:90%; align-items: center;"><div class="dropdown" style="margin: auto; width:60%">';
  storia += '<select class="custom-select  secondo" id="cambiaNome2"style="width: 100%; margin-bottom:10px" >Seleziona un nome</select><!--Nomi presi da giocatori.JSON--></div></div><select class="custom-select terzo" id="inputGroupSelect01" style="width: 60%; margin-bottom:10px">';
  storia += '<option selected>2</option> <option value="1">5</option><option value="2">10</option><option value="3">15</option></select>';
                            
  storia += '<div class="input-group-append" style="justify-content: center;"><button class="btn btn-outline-secondary" type="button submit" id="addPrizeBtn" onclick="addPrize()" style="background-color:black; color:whitesmoke; margin-bottom: 5%;">Assegna punti</button></div></div></div><div class="row" style="height: 19%; justify-content: center; margin-top: 5px; align-items: center; width: 75%; margin:auto; margin-bottom: 2%; "><div class="card col"  style="background-color:rgba(60, 87, 77, 0.9); color:rgb(212, 211, 211); width:100%; height: 100%;">';
  storia += '<div class="card-header"><strong>Esporta i dati dei giocatori</strong></div> <div class="d-flex flex-column col-9" id="content-wrapper" style="justify-content:center; width:100%; align-items: center; justify-self:center;"><div id="content" style="background-color: transparent; padding:8px 10px!important; border-radius:10px ">';
  storia += '<a class="btn btn-primary" id="esporta-btn" type="button" href="./json/esporta.json"  download="dati_giocatori" style="font-size: 28px;background:black;">Esporta</a></div></div></div></div></div></div>';
  
  $('#content').replaceWith(storia);
  uploadEsporta();
  popolaValutatore();
  }

  function divAiuto(){
    var aiuto='';
    aiuto += '<div class="d-flex flex-column col-9" id="content" style="justify-content: center; align-items: center; width:90%;">';
    aiuto += '<div style="background-color:rgba(60, 87, 77, 0.9); border-radius:20px; width:60%; justify-content: center; align-items: center; margin-top:50px;"><div class="container-fluid"><div class="d-sm-flex justify-content-between align-items-center mb-4"><h3 class=" mb-0" style=" color: rgb(212, 211, 211); margin-top: 30px;">Aiuto</h3></div><div class="col-lg-12 mb-4"><div class="card shadow mb-4"><div class="card-header py-3" style="background-color: rgba(0, 0, 0, 0.479); ">';
    aiuto += '<h6 class="text font-weight-bold m-0" style="color:whitesmoke !important;" >Richieste di aiuto</h6></div><ul class="list-group list-group-flush" id="cardEl" style="height:25vh!important; overflow-y:scroll; background-color: white;"></ul></div></div><div class="col-lg-12 mb-4"><div class="card shadow mb-4"><div class="card-header py-3" style="background-color: rgba(0, 0, 0, 0.479); "><div class="dropdown" style="margin: auto; width:100%"><p style="color:white">Rispondi a:</p><select class="custom-select  primo" id="cambiaNomeAiuto"style="width: 100%; margin-bottom:10px" >';
    aiuto += '<!--Nomi presi da giocatori.JSON--> </div>       </div> <br><div class="input-group mb-3"><input type="text" id="rispostaAiuto" class="form-control" placeholder="Rispondi"><div class="input-group-append">"<button class="btn btn-outline-secondary" onclick="sendHelpAiuto()" type="button">Invia</button></div></div></div></div></div></div></div>';
  
    $('#content').replaceWith(aiuto);
    uploadEsporta();
    popolaValutatore();
  }

  function divVal(){
    var val='';
    val += '<div class="d-flex flex-column col-9" id="content" style="justify-content: center; align-items: center; width:90%;">';
    val += '<div style="background-color:rgba(60, 87, 77, 0.9); border-radius:20px; width:60%;justify-content: center; align-items: center; margin-top:50px;"><div class="container-fluid" ><div class="d-sm-flex justify-content-between align-items-center mb-4"><h3 class="mb-0" style="margin-top: 30px; color: rgb(212, 211, 211)">Valutazione</h3></div>';
    val += '<div class="col-lg-12 mb-4"><div class="card shadow mb-4"><div class="card-header py-3" style="background-color: rgba(0, 0, 0, 0.479); "></div><ul class="list-group list-group-flush" style="height:55vh!important; overflow-y:scroll; background-color: white"><li class="list-group-item"><div class="row align-items-center no-gutters">';
    val += '<div class="col mr-2"><div class="list-group list-group-flush" ><div class="input-group mb-3" id="cardElV" ></div></div></div></div></li></ul></div></div></div></div></div>';
  
    $('#content').replaceWith(val);
    
    uploadEsporta();
    popolaValutatore();
    valut();
  }

  function divTempo(){
    var tempo='';
    tempo += '<div class="d-flex flex-column col-9" id="content" style="justify-content: center; align-items: center; width:90%;">';
    tempo += '<div style="background-color:rgba(60, 87, 77, 0.9); width:70%; border-radius:20px; justify-content: center; align-items: center; margin-top:50px;"><div class="container-fluid"><div class="d-sm-flex justify-content-between align-items-center mb-4"><h3 class=" mb-0" style="margin-top: 30px; color: rgb(212, 211, 211)">Tempo</h3></div>';
    tempo += '<div class="col-lg-12 mb-4"><div class="card shadow mb-4"><div class="card-header py-3" style="background-color: rgba(0, 0, 0, 0.479); "><h6 class="text font-weight-bold m-0" style="color:whitesmoke !important;" >Aiuta giocatori fermi da troppo tempo</h6></div><ul class="list-group list-group-flush" style="height:55vh!important; overflow-y:scroll; background-color: white"><li class="list-group-item"><div class="row align-items-center no-gutters"><div class="col mr-2"><div class="dropdown" style="margin: auto; width:100%">';
    tempo += '<select class="custom-select  primo" id="cambiaNomeTempo"style="width: 100%; margin-bottom:10px" ><!--Nomi presi da giocatori.JSON--></div>       </div><br><div class="input-group mb-3"><input type="text" id="rispostaTempo" class="form-control" placeholder="Aiuta" aria-label="Rispondi" aria-describedby="basic-addon2"><div class="input-group-append"><button class="btn btn-outline-secondary" onclick="sendHelpTempo()" type="button">Invia</button></div></div></div></div></li</div></div></li></ul></div></div>';

    $('#content').replaceWith(tempo);
    uploadEsporta();
    popolaValutatore();
  }